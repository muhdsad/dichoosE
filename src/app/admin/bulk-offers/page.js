"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function BulkOffersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUpdates, setPreviewUpdates] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
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
            setProducts(allProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Failed to load products. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

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

    const downloadTemplate = () => {
        const filteredProducts = selectedDownloadCategory === 'All' 
            ? products 
            : products.filter(p => {
                let cats = p.categories || [];
                if (p.category && !cats.includes(p.category)) {
                    cats = [p.category, ...cats];
                }
                return cats.includes(selectedDownloadCategory);
            });

        if (filteredProducts.length === 0) {
            alert(`No products found for category: ${selectedDownloadCategory}`);
            return;
        }

        const data = filteredProducts.map(p => {
            // Create a clean comma-separated string of unique categories
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
                
                // Parse updates
                const updates = [];
                data.forEach(row => {
                    const productId = row.ID;
                    const newOfferPrice = row.OfferPrice;
                    
                    if (productId) {
                        const existingProduct = products.find(p => p.id === productId);
                        if (existingProduct) {
                            // Queue if offer price OR category has changed
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
                    alert("No changes detected in the uploaded file compared to current database.");
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing file. Please ensure it's a valid Excel/CSV.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const applyUpdates = async () => {
        if (previewUpdates.length === 0) return;
        
        if (!confirm(`Are you sure you want to apply ${previewUpdates.length} offer updates?`)) return;

        setIsUpdating(true);
        try {
            const batch = writeBatch(db);
            let count = 0;
            
            for (const update of previewUpdates) {
                const docRef = doc(db, "products", update.id);
                const updateData = {};
                
                // Handle Offer changes
                if (update.newOffer !== update.oldOffer) {
                    if (update.newOffer === '-' || update.newOffer === '') {
                        updateData.offerPrice = null;
                        updateData.offerStart = null;
                        updateData.offerEnd = null;
                    } else {
                        updateData.offerPrice = update.newOffer;
                    }
                }
                
                // Handle Category changes
                if (update.newCategory !== update.oldCategory) {
                    const cats = update.newCategory.split(',').map(c => c.trim()).filter(Boolean);
                    updateData.categories = cats;
                    if (cats.length > 0) {
                        updateData.category = cats[0];
                    } else {
                        updateData.category = '';
                    }
                }

                if (Object.keys(updateData).length > 0) {
                    batch.update(docRef, updateData);
                }
                count++;
                
                // Firestore batch limit is 500, if needed we can handle multiple batches
                if (count === 500) {
                    await batch.commit();
                    count = 0;
                }
            }
            
            if (count > 0) {
                await batch.commit();
            }
            
            alert("Offers updated successfully!");
            setPreviewUpdates([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchProducts(); // Refresh data
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
            let count = 0;
            activeOffers.forEach(p => {
                const docRef = doc(db, "products", p.id);
                batch.update(docRef, {
                    offerPrice: null,
                    offerStart: null,
                    offerEnd: null
                });
                count++;
            });
            await batch.commit();
            alert(`All ${count} offers cleared successfully!`);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert("Error clearing offers.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-10 font-bold text-gray-600">Loading Products from Database...</div>;

    return (
        <div className="bg-white min-h-screen p-8 text-black">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tight">Bulk Edit (Offers & Categories)</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Export & Clear Card */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <h2 className="text-xl font-bold text-blue-900 mb-2">1. Get Daily Template</h2>
                        <p className="text-blue-700 mb-4 text-sm font-medium">Download your current products, or quickly clear yesterday's offers.</p>
                        
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-bold text-blue-900">Filter by Category</label>
                            <select 
                                value={selectedDownloadCategory}
                                onChange={(e) => setSelectedDownloadCategory(e.target.value)}
                                className="block w-full text-sm border border-blue-300 rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                            >
                                {uniqueCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={downloadTemplate}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                Download Products (Excel)
                            </button>
                            <button 
                                onClick={clearAllOffers}
                                disabled={isUpdating}
                                className="bg-red-50 text-red-600 border-2 border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition"
                            >
                                Clear All Active Offers
                            </button>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                        <h2 className="text-xl font-bold text-green-900 mb-2">2. Upload Updates</h2>
                        <p className="text-green-700 mb-4 text-sm font-medium">Upload your edited Excel or CSV file to batch update prices.</p>
                        
                        <label className="block mb-2 text-sm font-bold text-green-900">Select File</label>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="block w-full text-sm text-green-800
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-bold
                                file:bg-green-600 file:text-white
                                hover:file:bg-green-700 cursor-pointer border border-green-300 rounded p-1 bg-white"
                        />
                    </div>
                </div>

                {/* Preview Table */}
                {previewUpdates.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b-2 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-lg">Preview Changes ({previewUpdates.length} items)</h2>
                            <button 
                                onClick={applyUpdates}
                                disabled={isUpdating}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm"
                            >
                                {isUpdating ? 'Updating Database...' : 'Confirm & Apply Updates'}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 font-bold text-gray-700">Product Name</th>
                                        <th className="p-4 font-bold text-gray-700">Old Categories</th>
                                        <th className="p-4 font-bold text-blue-700">New Categories</th>
                                        <th className="p-4 font-bold text-gray-700">Old Offer</th>
                                        <th className="p-4 font-bold text-green-700">New Offer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewUpdates.map((u, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="p-4 max-w-[250px] font-semibold">{u.name}</td>
                                            <td className="p-4 text-gray-500 text-xs">{u.oldCategory}</td>
                                            <td className="p-4 font-bold text-blue-600 text-xs">{u.newCategory}</td>
                                            <td className="p-4 text-red-500 line-through font-medium">{u.oldOffer}</td>
                                            <td className="p-4 font-black text-green-600 text-base">{u.newOffer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
