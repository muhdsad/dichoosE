"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { 
    FaSearch, 
    FaFilter, 
    FaCalendarAlt, 
    FaSave, 
    FaTrash, 
    FaCheckCircle, 
    FaExclamationTriangle, 
    FaDownload, 
    FaUpload, 
    FaBoxes, 
    FaHistory, 
    FaPercentage,
    FaTimesCircle
} from 'react-icons/fa';

const getTodayDateTimeString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const getNextDay1145PMString = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T23:45`;
};

export default function BulkOffersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Scheduled', 'Expired', 'None'
    
    // Pending modified product IDs tracking
    const [editedIds, setEditedIds] = useState(new Set());
    const [rowSaveStates, setRowSaveStates] = useState({}); // { productId: 'idle' | 'saving' | 'saved' | 'error' }

    // Excel upload preview states
    const [previewUpdates, setPreviewUpdates] = useState([]);
    const [selectedDownloadCategory, setSelectedDownloadCategory] = useState('All');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const allProducts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort alphabetically by name
            allProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setProducts(allProducts);
            setEditedIds(new Set());
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Failed to load products. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate unique categories for filters
    const uniqueCategories = useMemo(() => {
        const allCats = products.flatMap(p => {
            let cats = p.categories || [];
            if (p.category && !cats.includes(p.category)) {
                cats = [p.category, ...cats];
            }
            return cats.filter(Boolean);
        });
        return ['All', ...Array.from(new Set(allCats))].sort();
    }, [products]);

    // Handle field updates reactively
    const handleFieldChange = (productId, field, value) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const updated = { ...p, [field]: value };
                if (field === 'offerPrice' && value && String(value).trim() !== '') {
                    if (!p.offerStart || p.offerStart === '') {
                        updated.offerStart = getTodayDateTimeString();
                    }
                    if (!p.offerEnd || p.offerEnd === '') {
                        updated.offerEnd = getNextDay1145PMString();
                    }
                }
                return updated;
            }
            return p;
        }));
        setEditedIds(prev => {
            const next = new Set(prev);
            next.add(productId);
            return next;
        });
    };

    // Status evaluation function
    const getOfferStatusInfo = (p) => {
        if (!p.offerPrice || parseFloat(p.offerPrice) <= 0) {
            return { label: 'No Offer', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
        const now = new Date();
        const start = p.offerStart ? new Date(p.offerStart) : null;
        const end = p.offerEnd ? new Date(p.offerEnd) : null;

        if (start && now < start) {
            return { label: 'Scheduled', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
        }
        if (end && now > end) {
            return { label: 'Expired', badgeClass: 'bg-red-50 text-red-700 border-red-200' };
        }
        return { label: 'Active Now', badgeClass: 'bg-green-50 text-green-700 border-green-200' };
    };

    // Live filtering products based on search inputs
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Search Match
            const matchesSearch = 
                (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.barcode || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            // Category Match
            let cats = p.categories || [];
            if (p.category && !cats.includes(p.category)) {
                cats = [p.category, ...cats];
            }
            const matchesCategory = selectedCategory === 'All' || cats.includes(selectedCategory);

            // Status Match
            const statusInfo = getOfferStatusInfo(p);
            let matchesStatus = true;
            if (statusFilter === 'Active') matchesStatus = statusInfo.label === 'Active Now';
            else if (statusFilter === 'Scheduled') matchesStatus = statusInfo.label === 'Scheduled';
            else if (statusFilter === 'Expired') matchesStatus = statusInfo.label === 'Expired';
            else if (statusFilter === 'None') matchesStatus = statusInfo.label === 'No Offer';

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchQuery, selectedCategory, statusFilter]);

    // Save individual product offer details instantly
    const saveSingleProductOffer = async (p) => {
        setRowSaveStates(prev => ({ ...prev, [p.id]: 'saving' }));
        try {
            const docRef = doc(db, "products", p.id);
            const offerPriceVal = p.offerPrice ? parseFloat(p.offerPrice) : null;
            const priceVal = p.price ? parseFloat(p.price) : 0;

            // Auto-check / update category list to maintain the "Offer" category tag
            let updatedCategories = [...(p.categories || [])];
            if (offerPriceVal && offerPriceVal > 0) {
                if (!updatedCategories.includes('Offer')) {
                    updatedCategories.push('Offer');
                }
            } else {
                updatedCategories = updatedCategories.filter(c => c !== 'Offer');
            }

            const updatePayload = {
                price: priceVal,
                offerPrice: offerPriceVal,
                offerStart: p.offerStart || null,
                offerEnd: p.offerEnd || null,
                categories: updatedCategories,
                category: updatedCategories.length > 0 ? updatedCategories[0] : ''
            };

            await updateDoc(docRef, updatePayload);

            // Update in-place local state
            setProducts(prev => prev.map(item => {
                if (item.id === p.id) {
                    return { ...item, ...updatePayload };
                }
                return item;
            }));

            setEditedIds(prev => {
                const next = new Set(prev);
                next.delete(p.id);
                return next;
            });
            setRowSaveStates(prev => ({ ...prev, [p.id]: 'saved' }));
            setTimeout(() => {
                setRowSaveStates(prev => ({ ...prev, [p.id]: 'idle' }));
            }, 2000);
        } catch (error) {
            console.error("Error updating offer:", error);
            setRowSaveStates(prev => ({ ...prev, [p.id]: 'error' }));
        }
    };

    // Reset/Clear campaign offer values for a product
    const clearSingleProductOffer = async (p) => {
        setRowSaveStates(prev => ({ ...prev, [p.id]: 'saving' }));
        try {
            const docRef = doc(db, "products", p.id);
            const updatedCategories = (p.categories || []).filter(c => c !== 'Offer');

            const updatePayload = {
                offerPrice: null,
                offerStart: null,
                offerEnd: null,
                categories: updatedCategories,
                category: updatedCategories.length > 0 ? updatedCategories[0] : ''
            };

            await updateDoc(docRef, updatePayload);

            setProducts(prev => prev.map(item => {
                if (item.id === p.id) {
                    return { ...item, ...updatePayload };
                }
                return item;
            }));

            setEditedIds(prev => {
                const next = new Set(prev);
                next.delete(p.id);
                return next;
            });
            setRowSaveStates(prev => ({ ...prev, [p.id]: 'saved' }));
            setTimeout(() => {
                setRowSaveStates(prev => ({ ...prev, [p.id]: 'idle' }));
            }, 2000);
        } catch (error) {
            console.error("Error clearing offer:", error);
            setRowSaveStates(prev => ({ ...prev, [p.id]: 'error' }));
        }
    };

    // Save all pending edited rows at once
    const saveAllPendingChanges = async () => {
        if (editedIds.size === 0) return;
        setIsUpdating(true);

        try {
            const batch = writeBatch(db);
            const pendingList = products.filter(p => editedIds.has(p.id));

            for (const p of pendingList) {
                const docRef = doc(db, "products", p.id);
                const offerPriceVal = p.offerPrice ? parseFloat(p.offerPrice) : null;

                let updatedCategories = [...(p.categories || [])];
                if (offerPriceVal && offerPriceVal > 0) {
                    if (!updatedCategories.includes('Offer')) {
                        updatedCategories.push('Offer');
                    }
                } else {
                    updatedCategories = updatedCategories.filter(c => c !== 'Offer');
                }

                batch.update(docRef, {
                    offerPrice: offerPriceVal,
                    offerStart: p.offerStart || null,
                    offerEnd: p.offerEnd || null,
                    categories: updatedCategories,
                    category: updatedCategories.length > 0 ? updatedCategories[0] : ''
                });
            }

            await batch.commit();
            alert(`Successfully saved campaign offers for ${pendingList.length} products!`);
            fetchProducts();
        } catch (error) {
            console.error("Error batch updating offers:", error);
            alert("Failed to apply batch changes. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Discard/Reset all local changes
    const discardAllChanges = () => {
        if (confirm("Are you sure you want to discard your unsaved edits?")) {
            fetchProducts();
        }
    };

    // --- Excel Upload & Download handlers ---
    const downloadTemplate = () => {
        const filtered = selectedDownloadCategory === 'All' 
            ? products 
            : products.filter(p => {
                let cats = p.categories || [];
                if (p.category && !cats.includes(p.category)) {
                    cats = [p.category, ...cats];
                }
                return cats.includes(selectedDownloadCategory);
            });

        if (filtered.length === 0) {
            alert(`No products found for category: ${selectedDownloadCategory}`);
            return;
        }

        const data = filtered.map(p => {
            let cats = p.categories || [];
            if (p.category && !cats.includes(p.category)) {
                cats = [p.category, ...cats];
            }
            const catString = cats.filter(Boolean).join(', ');

            return {
                ID: p.id,
                Name: p.name || '',
                Category: catString,
                Price: p.price || p.mrp || 0,
                OfferPrice: p.offerPrice || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Offers");
        XLSX.writeFile(wb, "dichoos_offers_template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const updates = [];
                data.forEach(row => {
                    const productId = row.ID;
                    const newOfferPrice = row.OfferPrice;
                    
                    if (productId) {
                        const existingProduct = products.find(p => p.id === productId);
                        if (existingProduct) {
                            const oldOfferPrice = existingProduct.offerPrice || '';
                            const proposedOffer = newOfferPrice !== undefined && newOfferPrice !== null ? String(newOfferPrice).trim() : '';
                            
                            let oldCats = existingProduct.categories || [];
                            if (existingProduct.category && !oldCats.includes(existingProduct.category)) {
                                oldCats = [existingProduct.category, ...oldCats];
                            }
                            const oldCategoryString = oldCats.filter(Boolean).join(', ');
                            const proposedCategory = row.Category !== undefined && row.Category !== null ? String(row.Category).trim() : '';

                            if (oldOfferPrice !== proposedOffer || oldCategoryString !== proposedCategory) {
                                updates.push({
                                    id: productId,
                                    name: existingProduct.name,
                                    oldOffer: oldOfferPrice || '-',
                                    newOffer: proposedOffer || '-',
                                    oldCategory: oldCategoryString || '-',
                                    newCategory: proposedCategory || '-'
                                });
                            }
                        }
                    }
                });
                
                setPreviewUpdates(updates);
                if (updates.length === 0) {
                    alert("No changes detected in the uploaded Excel compared to your database.");
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing file. Please ensure it's a valid Excel/CSV template.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const applyExcelUpdates = async () => {
        if (previewUpdates.length === 0) return;
        
        if (!confirm(`Are you sure you want to apply ${previewUpdates.length} offer updates?`)) return;

        setIsUpdating(true);
        try {
            const batch = writeBatch(db);
            let count = 0;
            
            for (const update of previewUpdates) {
                const docRef = doc(db, "products", update.id);
                const updateData = {};
                
                if (update.newOffer !== update.oldOffer) {
                    if (update.newOffer === '-' || update.newOffer === '') {
                        updateData.offerPrice = null;
                        updateData.offerStart = null;
                        updateData.offerEnd = null;
                    } else {
                        updateData.offerPrice = parseFloat(update.newOffer);
                    }
                }
                
                if (update.newCategory !== update.oldCategory) {
                    const cats = update.newCategory.split(',').map(c => c.trim()).filter(Boolean);
                    updateData.categories = cats;
                    if (cats.length > 0) {
                        updateData.category = cats[0];
                    } else {
                        updateData.category = '';
                    }
                }

                // If offer is set from excel, ensure "Offer" category is added
                if (updateData.offerPrice && updateData.offerPrice > 0) {
                    const currentCats = updateData.categories || products.find(p => p.id === update.id)?.categories || [];
                    if (!currentCats.includes('Offer')) {
                        updateData.categories = [...currentCats, 'Offer'];
                        if (!updateData.category) {
                            updateData.category = updateData.categories[0];
                        }
                    }
                }

                if (Object.keys(updateData).length > 0) {
                    batch.update(docRef, updateData);
                }
                count++;
                
                if (count === 500) {
                    await batch.commit();
                    count = 0;
                }
            }
            
            if (count > 0) {
                await batch.commit();
            }
            
            alert("Offers updated successfully from Excel!");
            setPreviewUpdates([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchProducts();
        } catch (error) {
            console.error("Error updating offers:", error);
            alert("Failed to update offers. Check console.");
        } finally {
            setIsUpdating(false);
        }
    };

    const clearAllOffers = async () => {
        const activeOffers = products.filter(p => p.offerPrice && parseFloat(p.offerPrice) > 0);
        
        if (activeOffers.length === 0) {
            alert("No active offers to clear.");
            return;
        }
        
        if (!confirm(`Are you sure you want to completely CLEAR all ${activeOffers.length} active offers?`)) return;
        
        setIsUpdating(true);
        try {
            const batch = writeBatch(db);
            activeOffers.forEach(p => {
                const docRef = doc(db, "products", p.id);
                const updatedCategories = (p.categories || []).filter(c => c !== 'Offer');

                batch.update(docRef, {
                    offerPrice: null,
                    offerStart: null,
                    offerEnd: null,
                    categories: updatedCategories,
                    category: updatedCategories.length > 0 ? updatedCategories[0] : ''
                });
            });
            await batch.commit();
            alert(`All ${activeOffers.length} offers cleared successfully!`);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert("Error clearing offers.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
            <p className="font-bold text-gray-600">Fetching products & active campaigns...</p>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen p-6 md:p-8 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-500/30">Admin Panel</span>
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-yellow-500/30">Campaigns</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Campaign & Special Offers</h1>
                        <p className="text-gray-400 text-sm mt-1 font-medium">Configure time-based discount offers, set item-level pricing campaigns, and manage catalog rates.</p>
                    </div>
                </div>

                {/* Section 1: Excel Bulk Import/Export */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export / Template Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                                    <FaDownload className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-850">1. Download Campaign Template</h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">Download your catalog to Excel. Easily insert or update the `OfferPrice` column, then re-upload below.</p>
                            
                            <div className="mb-4">
                                <label className="block mb-2 text-xs font-extrabold uppercase text-gray-500 tracking-wider">Select Category Filter</label>
                                <select 
                                    value={selectedDownloadCategory}
                                    onChange={(e) => setSelectedDownloadCategory(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-xl p-3 bg-white text-sm focus:ring-primary focus:border-primary text-black"
                                >
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <button 
                                onClick={downloadTemplate}
                                className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                <FaDownload /> Download Products Template (Excel)
                            </button>
                            <button 
                                onClick={clearAllOffers}
                                disabled={isUpdating}
                                className="bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <FaTrash /> Remove All Store Campaign Offers
                            </button>
                        </div>
                    </div>

                    {/* Excel Upload Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                                    <FaUpload className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-850">2. Upload Modified Template</h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">Upload your edited spreadsheet file here. The system will detect and preview changes before modifying the database.</p>
                            
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <label className="block mb-2 text-xs font-extrabold uppercase text-gray-500 tracking-wider">Select Excel file (.xlsx, .xls, .csv)</label>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv" 
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    className="block w-full text-sm text-gray-500 mt-2
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-xl file:border-0
                                        file:text-xs file:font-bold
                                        file:bg-primary file:text-white
                                        hover:file:bg-green-700 cursor-pointer border border-gray-300 rounded-xl p-2 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Excel Upload Preview Table */}
                {previewUpdates.length > 0 && (
                    <div className="bg-white border border-gray-250 rounded-3xl shadow-md overflow-hidden animate-fadeIn">
                        <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-lg">Excel Update Preview</h3>
                                <p className="text-gray-500 text-xs mt-0.5">Found changes in <span className="font-bold">{previewUpdates.length}</span> item(s). Confirm to save edits.</p>
                            </div>
                            <button 
                                onClick={applyExcelUpdates}
                                disabled={isUpdating}
                                className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-opacity-95 transition shadow-md flex items-center justify-center gap-2"
                            >
                                <FaSave /> {isUpdating ? 'Updating Database...' : 'Confirm & Apply Excel Changes'}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-bold text-gray-700">Product Name</th>
                                        <th className="p-4 font-bold text-gray-700">Old Categories</th>
                                        <th className="p-4 font-bold text-blue-700">New Categories</th>
                                        <th className="p-4 font-bold text-gray-700">Old Offer</th>
                                        <th className="p-4 font-bold text-green-700">New Offer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {previewUpdates.map((u, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="p-4 max-w-[300px] font-bold text-gray-800">{u.name}</td>
                                            <td className="p-4 text-gray-400 text-xs font-semibold">{u.oldCategory}</td>
                                            <td className="p-4 font-bold text-blue-600 text-xs">{u.newCategory}</td>
                                            <td className="p-4 text-red-400 line-through font-medium">{u.oldOffer}</td>
                                            <td className="p-4 font-extrabold text-green-600 text-base">{u.newOffer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Floating Batch Save Panel (for interactive edit mode) */}
                {editedIds.size > 0 && (
                    <div className="bg-yellow-50 border border-yellow-250 rounded-2xl p-4 md:p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 animate-fadeIn sticky top-4 z-40">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400 p-2.5 rounded-xl text-yellow-950">
                                <FaExclamationTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-yellow-950 text-base">Unsaved Grid Modifications</h3>
                                <p className="text-yellow-800 text-xs mt-0.5">You have edited offer pricing or schedules for <span className="font-bold">{editedIds.size}</span> item(s). Save all to apply.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={discardAllChanges}
                                className="flex-1 sm:flex-initial px-5 py-2.5 border border-yellow-300 rounded-xl font-bold text-sm text-yellow-800 hover:bg-yellow-100 transition bg-white"
                            >
                                Discard Edits
                            </button>
                            <button
                                onClick={saveAllPendingChanges}
                                disabled={isUpdating}
                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-primary hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                            >
                                <FaSave /> {isUpdating ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Section 3: Interactive Campaigns Grid */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                    <div className="border-b border-gray-150 pb-4">
                        <h2 className="text-2xl font-extrabold text-gray-805 flex items-center gap-2">
                            <FaPercentage className="text-primary" /> Search & Manage Campaign Offers
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">Search for individual items by name, category or status, and update their offers immediately below.</p>
                    </div>

                    {/* Live Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                        <div className="relative col-span-1 md:col-span-2">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by product name, brand, or barcode..."
                                className="w-full bg-white rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-black placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-white rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-black"
                            >
                                <option value="All">All Categories</option>
                                {uniqueCategories.filter(cat => cat !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-black"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">🟢 Active Campaigns</option>
                                <option value="Scheduled">🔵 Scheduled Campaigns</option>
                                <option value="Expired">🔴 Expired Campaigns</option>
                                <option value="None">⚪ Standard Price (No Offer)</option>
                            </select>
                        </div>
                    </div>

                    {/* Interactive Data List */}
                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Desktop Table View */}
                        <div className="hidden xl:block overflow-x-auto max-h-[600px]">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="p-4 w-[280px]">Product Information</th>
                                        <th className="p-4 w-[120px] text-center">Regular Rate</th>
                                        <th className="p-4 w-[160px] text-center">Offer Price (₹)</th>
                                        <th className="p-4 w-[220px]">Campaign Start Time</th>
                                        <th className="p-4 w-[220px]">Campaign End Time</th>
                                        <th className="p-4 w-[130px] text-center">Live Status</th>
                                        <th className="p-4 text-right w-[150px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((p) => {
                                            const statusInfo = getOfferStatusInfo(p);
                                            const isEdited = editedIds.has(p.id);
                                            const rowSaveState = rowSaveStates[p.id] || 'idle';

                                            return (
                                                <tr 
                                                    key={p.id} 
                                                    className={`hover:bg-gray-55/50 transition-colors ${
                                                        isEdited ? 'bg-yellow-50/20' : ''
                                                    }`}
                                                >
                                                    {/* Product Info */}
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                                <img 
                                                                    src={p.image || '/categories/default.png'} 
                                                                    alt={p.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = '/categories/default.png'; }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-gray-800 truncate text-sm">{p.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-semibold">
                                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{p.unit}</span>
                                                                    {p.brand && (
                                                                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-150">{p.brand}</span>
                                                                    )}
                                                                    {p.barcode && (
                                                                        <span className="font-mono text-gray-400">#{p.barcode}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Base price */}
                                                    <td className="p-4 text-center">
                                                        <div className="relative flex items-center justify-center">
                                                            <span className="absolute left-2 text-gray-455 font-bold text-xs">₹</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={p.price || ''}
                                                                onChange={(e) => handleFieldChange(p.id, 'price', e.target.value)}
                                                                className={`w-24 text-center pl-5 font-bold rounded-lg border text-sm p-2 text-black focus:ring-1 focus:ring-primary ${
                                                                    isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                                }`}
                                                            />
                                                        </div>
                                                        {p.mrp && p.mrp > p.price && (
                                                            <div className="text-[10px] text-gray-400 line-through font-medium mt-1">MRP: ₹{p.mrp}</div>
                                                        )}
                                                    </td>

                                                    {/* Offer Price Input */}
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={p.offerPrice || ''}
                                                            onChange={(e) => handleFieldChange(p.id, 'offerPrice', e.target.value)}
                                                            placeholder="None"
                                                            className={`w-32 mx-auto text-center font-bold rounded-lg border text-sm p-2 text-black focus:ring-1 focus:ring-primary ${
                                                                isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                            }`}
                                                        />
                                                    </td>

                                                    {/* Offer Start Date */}
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="datetime-local"
                                                            value={p.offerStart || ''}
                                                            onChange={(e) => handleFieldChange(p.id, 'offerStart', e.target.value)}
                                                            className={`w-48 mx-auto rounded-lg border text-xs p-2 text-black focus:ring-1 focus:ring-primary ${
                                                                isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                            }`}
                                                        />
                                                    </td>

                                                    {/* Offer End Date */}
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="datetime-local"
                                                            value={p.offerEnd || ''}
                                                            onChange={(e) => handleFieldChange(p.id, 'offerEnd', e.target.value)}
                                                            className={`w-48 mx-auto rounded-lg border text-xs p-2 text-black focus:ring-1 focus:ring-primary ${
                                                                isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                            }`}
                                                        />
                                                    </td>

                                                    {/* Status */}
                                                    <td className="p-4 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Row Actions */}
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Save Single Row */}
                                                            <button
                                                                onClick={() => saveSingleProductOffer(p)}
                                                                disabled={!isEdited || rowSaveState === 'saving'}
                                                                className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                                                                    isEdited 
                                                                    ? 'bg-primary hover:bg-green-700 text-white border-transparent shadow-sm' 
                                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                }`}
                                                                title="Save Changes for this item"
                                                            >
                                                                    {rowSaveState === 'saving' ? (
                                                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                                                                    ) : rowSaveState === 'saved' ? (
                                                                        <FaCheckCircle className="w-3.5 h-3.5" />
                                                                    ) : (
                                                                        <FaSave className="w-3.5 h-3.5" />
                                                                    )}
                                                                <span>{rowSaveState === 'saving' ? 'Saving' : rowSaveState === 'saved' ? 'Saved' : 'Save'}</span>
                                                            </button>

                                                            {/* Clear Offer Fields */}
                                                            {p.offerPrice && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`Remove campaign offer from "${p.name}"?`)) {
                                                                            clearSingleProductOffer(p);
                                                                        }
                                                                    }}
                                                                    disabled={rowSaveState === 'saving'}
                                                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 rounded-lg transition"
                                                                    title="Clear Offer Campaign"
                                                                >
                                                                    <FaTrash className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-10 text-center text-gray-500 font-semibold">
                                                No products found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="block xl:hidden max-h-[600px] overflow-y-auto p-2 space-y-4 bg-gray-50/50">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => {
                                    const statusInfo = getOfferStatusInfo(p);
                                    const isEdited = editedIds.has(p.id);
                                    const rowSaveState = rowSaveStates[p.id] || 'idle';

                                    return (
                                        <div 
                                            key={p.id} 
                                            className={`bg-white rounded-2xl border p-4 space-y-4 shadow-sm transition-all relative ${
                                                isEdited ? 'border-yellow-400 bg-yellow-50/5' : 'border-gray-200'
                                            }`}
                                        >
                                            {/* Product Info Block */}
                                            <div className="flex items-start gap-3">
                                                <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <img 
                                                        src={p.image || '/categories/default.png'} 
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = '/categories/default.png'; }}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-gray-800 text-sm leading-snug">{p.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-semibold">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{p.unit}</span>
                                                        {p.brand && (
                                                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-150">{p.brand}</span>
                                                        )}
                                                        {p.barcode && (
                                                            <span className="font-mono text-gray-400">#{p.barcode}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Pricing and Input Details */}
                                            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Regular Rate (₹)</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={p.price || ''}
                                                        onChange={(e) => handleFieldChange(p.id, 'price', e.target.value)}
                                                        className={`w-full font-bold rounded-lg border text-xs p-1.5 text-black focus:ring-1 focus:ring-primary ${
                                                            isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {p.mrp && p.mrp > p.price && (
                                                        <div className="text-[10px] text-gray-400 line-through font-medium mt-1">MRP: ₹{p.mrp}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Offer Price (₹)</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={p.offerPrice || ''}
                                                        onChange={(e) => handleFieldChange(p.id, 'offerPrice', e.target.value)}
                                                        placeholder="None"
                                                        className={`w-full font-bold rounded-lg border text-xs p-1.5 text-black focus:ring-1 focus:ring-primary ${
                                                            isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Scheduling Inputs */}
                                            <div className="space-y-2 bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> Start Time</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={p.offerStart || ''}
                                                        onChange={(e) => handleFieldChange(p.id, 'offerStart', e.target.value)}
                                                        className={`w-40 rounded-lg border text-[11px] p-1 text-black focus:ring-1 focus:ring-primary bg-white ${
                                                            isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> End Time</span>
                                                    <input
                                                        type="datetime-local"
                                                        value={p.offerEnd || ''}
                                                        onChange={(e) => handleFieldChange(p.id, 'offerEnd', e.target.value)}
                                                        className={`w-40 rounded-lg border text-[11px] p-1 text-black focus:ring-1 focus:ring-primary bg-white ${
                                                            isEdited ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 border-t border-gray-100 pt-3">
                                                <button
                                                    onClick={() => saveSingleProductOffer(p)}
                                                    disabled={!isEdited || rowSaveState === 'saving'}
                                                    className={`flex-1 py-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                                                        isEdited 
                                                        ? 'bg-primary hover:bg-green-700 text-white border-transparent shadow-sm' 
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {rowSaveState === 'saving' ? (
                                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                                                    ) : rowSaveState === 'saved' ? (
                                                        <FaCheckCircle className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <FaSave className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>{rowSaveState === 'saving' ? 'Saving' : rowSaveState === 'saved' ? 'Saved' : 'Save'}</span>
                                                </button>

                                                {p.offerPrice && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Remove campaign offer from "${p.name}"?`)) {
                                                                clearSingleProductOffer(p);
                                                            }
                                                        }}
                                                        disabled={rowSaveState === 'saving'}
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition"
                                                        title="Clear Offer Campaign"
                                                    >
                                                        <FaTrash className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center text-gray-500 font-semibold bg-white rounded-2xl border border-gray-200">
                                    No products found matching filters.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                        <p>Showing {filteredProducts.length} of {products.length} products</p>
                        <p>🟢 Active Now items automatically display discount badge to store customers.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
