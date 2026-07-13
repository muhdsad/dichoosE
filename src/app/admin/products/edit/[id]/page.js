"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useCategories } from '../../../../../context/CategoryContext';
import { getDirectDriveLink } from '../../../../../utils/productUtils';
import { FaBarcode, FaPlus, FaTag, FaBoxes, FaStar } from 'react-icons/fa';

const PASTEL_COLORS = [
    { name: "Orange", value: "bg-orange-50 border-orange-200 text-orange-700" },
    { name: "Green", value: "bg-green-50 border-green-200 text-green-700" },
    { name: "Red", value: "bg-red-50 border-red-200 text-red-700" },
    { name: "Yellow", value: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { name: "Teal", value: "bg-teal-50 border-teal-200 text-teal-700" },
    { name: "Blue", value: "bg-blue-50 border-blue-200 text-blue-700" },
    { name: "Purple", value: "bg-purple-50 border-purple-200 text-purple-700" },
    { name: "Pink", value: "bg-pink-50 border-pink-200 text-pink-700" },
    { name: "Indigo", value: "bg-indigo-50 border-indigo-200 text-indigo-700" },
    { name: "Gray", value: "bg-gray-50 border-gray-200 text-gray-700" }
];

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

export default function EditProductPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const { categories, addCategory } = useCategories();
    const [product, setProduct] = useState({
        name: '',
        price: '',
        mrp: '',
        unit: '',
        stock: '',
        description: '',
        image: '',
        categories: [],
        subcategory: '',
        offerPrice: '',
        offerStart: '',
        offerEnd: '',
        // Hypermarket Fields
        barcode: '',
        brand: '',
        reorderLevel: '5',
        location: '',
        dietary: 'None',
        expiryDate: '',
        batchNumber: '',
        isPublished: true
    });

    const [activeTab, setActiveTab] = useState('general'); // 'general', 'offers', 'hypermarket'
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');

    // Modal state for adding new category
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('bg-green-50 border-green-200 text-green-700');
    const [newCatImage, setNewCatImage] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    let loadedCategories = data.categories || (data.category ? [data.category] : []);

                    // Lazy Cleanup: If offer is expired, remove 'Offer' from categories
                    if (data.offerEnd && new Date(data.offerEnd) < new Date()) {
                        loadedCategories = loadedCategories.filter(c => c !== 'Offer');
                    }

                    setProduct({
                        id: docSnap.id,
                        name: data.name || '',
                        price: data.price || '',
                        mrp: data.mrp || '',
                        unit: data.unit || '',
                        stock: data.stock !== undefined ? data.stock : '', // Handle 0 correctly
                        description: data.description || '',
                        image: data.image || '',
                        categories: loadedCategories,
                        category: data.category === 'Offer' && loadedCategories.length > 0 ? loadedCategories[0] : (data.category || ''),
                        subcategory: data.subcategory || '',
                        offerPrice: data.offerPrice || '',
                        offerStart: data.offerStart || '',
                        offerEnd: data.offerEnd || '',
                        // Hypermarket Fields
                        barcode: data.barcode || '',
                        brand: data.brand || '',
                        reorderLevel: data.reorderLevel !== undefined ? String(data.reorderLevel) : '5',
                        location: data.location || '',
                        dietary: data.dietary || 'None',
                        expiryDate: data.expiryDate || '',
                        batchNumber: data.batchNumber || '',
                        isPublished: data.isPublished !== undefined ? data.isPublished : true
                    });
                } else {
                    setMessage('Product not found');
                }
            } catch (error) {
                console.error("Error fetching product: ", error);
                setMessage('Error fetching product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-check "Offer" category when offer price is entered
            if (name === 'offerPrice') {
                const val = parseFloat(value);
                const hasOffer = !isNaN(val) && val > 0;
                let cats = prev.categories || [];
                if (hasOffer) {
                    if (!cats.includes('Offer')) {
                        cats = [...cats, 'Offer'];
                    }
                    if (!prev.offerStart || prev.offerStart === '') {
                        updated.offerStart = getTodayDateTimeString();
                    }
                    if (!prev.offerEnd || prev.offerEnd === '') {
                        updated.offerEnd = getNextDay1145PMString();
                    }
                } else {
                    cats = cats.filter(c => c !== 'Offer');
                }
                updated.categories = cats;
            }

            return updated;
        });
    };

    const toggleCategory = (categoryValue) => {
        setProduct(prev => {
            const currentCategories = prev.categories || [];
            let nextCategories = [];
            if (currentCategories.includes(categoryValue)) {
                nextCategories = currentCategories.filter(c => c !== categoryValue);
            } else {
                nextCategories = [...currentCategories, categoryValue];
            }

            // Check if current subcategory is still valid under new categories
            let nextSubcategory = prev.subcategory || '';
            if (nextSubcategory) {
                const isValid = nextCategories.some(catVal => {
                    const cat = categories.find(c => c.value === catVal);
                    return cat?.subcategories?.some(s => s.value === nextSubcategory);
                });
                if (!isValid) {
                    nextSubcategory = '';
                }
            }

            return {
                ...prev,
                categories: nextCategories,
                subcategory: nextSubcategory
            };
        });
    };

    const generateRandomBarcode = () => {
        let barcode = '890';
        for (let i = 0; i < 10; i++) {
            barcode += Math.floor(Math.random() * 10);
        }
        setProduct(prev => ({ ...prev, barcode }));
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setCreatingCategory(true);

        try {
            const colorObj = PASTEL_COLORS.find(c => c.value === newCatColor) || PASTEL_COLORS[1];
            const baseColorClass = colorObj.value.split(' ')[0].replace('-50', '-100');

            const created = await addCategory({
                name: newCatName.trim(),
                value: newCatName.trim(),
                image: newCatImage.trim() || "/categories/default.png",
                color: baseColorClass
            });

            setProduct(prev => ({
                ...prev,
                categories: [...(prev.categories || []), created.value]
            }));

            setNewCatName('');
            setNewCatImage('');
            setIsCatModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create category");
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');

        if (product.categories.length === 0) {
            setMessage('Error: Please select at least one category.');
            setUpdating(false);
            return;
        }

        const imageUrl = getDirectDriveLink(product.image);

        try {
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, {
                name: product.name,
                price: parseFloat(product.price),
                mrp: product.mrp ? parseFloat(product.mrp) : 0,
                unit: product.unit || '',
                stock: product.stock !== '' ? parseInt(product.stock) : 0,
                description: product.description || '',
                image: imageUrl,
                categories: product.categories,
                category: product.categories.length > 0 ? product.categories[0] : '',
                subcategory: product.subcategory || '',
                offerPrice: product.offerPrice ? parseFloat(product.offerPrice) : null,
                offerStart: product.offerStart || null,
                offerEnd: product.offerEnd || null,
                // Hypermarket Fields
                barcode: product.barcode || '',
                brand: product.brand || '',
                reorderLevel: product.reorderLevel ? parseInt(product.reorderLevel) : 5,
                location: product.location || '',
                dietary: product.dietary || 'None',
                expiryDate: product.expiryDate || null,
                batchNumber: product.batchNumber || '',
                isPublished: product.isPublished
            });
            setMessage('Product updated successfully!');
            setTimeout(() => router.push('/admin/products'), 1500);
        } catch (error) {
            console.error("Error updating product: ", error);
            setMessage('Error updating product. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const getAvailableSubcategories = () => {
        if (!product.categories || product.categories.length === 0) return [];
        const subcats = [];
        product.categories.forEach(catVal => {
            const cat = categories.find(c => c.value === catVal);
            if (cat && cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    if (!subcats.some(s => s.value === sub.value)) {
                        subcats.push(sub);
                    }
                });
            }
        });
        return subcats;
    };

    if (loading) return <div className="text-center py-10">Loading Product details...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/80 to-indigo-600 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Edit Hypermarket Product</h1>
                        <p className="text-indigo-50 text-sm mt-1">Modify info, campaigns, and internal hypermarket logs.</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                        <FaStar className="w-6 h-6 text-yellow-300 animate-pulse" />
                    </div>
                </div>

                <div className="p-8">
                    {message && (
                        <div className={`p-4 mb-6 rounded-xl flex items-center ${message.includes('Error') || message.includes('not found') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                            <span className="font-semibold">{message}</span>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 mb-8 space-x-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaTag /> General Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('offers')}
                            className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'offers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <span>%</span> Campaign & Offers
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('hypermarket')}
                            className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'hypermarket' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaBoxes /> Hypermarket Options
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tab 1: General Details */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={product.name}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={product.brand}
                                            onChange={handleChange}
                                            placeholder="e.g. Britannia"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            step="0.01"
                                            value={product.price}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">MRP (₹)</label>
                                        <input
                                            type="number"
                                            name="mrp"
                                            step="0.01"
                                            value={product.mrp}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Unit (e.g. 500g, 1 pc) *</label>
                                        <input
                                            type="text"
                                            name="unit"
                                            required
                                            value={product.unit}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Available Stock (Qty) *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            value={product.stock}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Image URL *</label>
                                        <input
                                            type="url"
                                            name="image"
                                            required
                                            value={product.image}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-gray-700">Categories (Select Multiple) *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCatModalOpen(true)}
                                            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 transition"
                                        >
                                            <FaPlus className="w-2.5 h-2.5" /> Add New Category
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <label key={cat.value} className={`flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-lg border transition ${product.categories?.includes(cat.value) ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    value={cat.value}
                                                    checked={product.categories?.includes(cat.value)}
                                                    onChange={() => toggleCategory(cat.value)}
                                                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 border-gray-300"
                                                />
                                                <span className="text-xs font-semibold text-gray-755">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subcategory</label>
                                    <select
                                        name="subcategory"
                                        value={product.subcategory}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black bg-white"
                                        disabled={!product.categories || product.categories.length === 0}
                                    >
                                        <option value="">No Subcategory / Unassigned</option>
                                        {getAvailableSubcategories().map((sub) => (
                                            <option key={sub.value} value={sub.value}>{sub.name}</option>
                                        ))}
                                    </select>
                                    {(!product.categories || product.categories.length === 0) && (
                                        <span className="text-[10px] text-gray-400 mt-1 block">Please select at least one category above to enable subcategory options.</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        value={product.description}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Special Offers */}
                        {activeTab === 'offers' && (
                            <div className="space-y-6 animate-fadeIn bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100">
                                <div className="border-l-4 border-yellow-400 pl-4 mb-4">
                                    <h3 className="text-base font-bold text-yellow-800">Time-based Campaign & Discount Pricing</h3>
                                    <p className="text-xs text-yellow-700">Set discount price parameters. The system automatically switches prices on active dates.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Offer Price (₹)</label>
                                        <input
                                            type="number"
                                            name="offerPrice"
                                            step="0.01"
                                            value={product.offerPrice}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Offer Start Date</label>
                                        <input
                                            type="datetime-local"
                                            name="offerStart"
                                            value={product.offerStart}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Offer End Date</label>
                                        <input
                                            type="datetime-local"
                                            name="offerEnd"
                                            value={product.offerEnd}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-yellow-250/60 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-gray-700">Categories (Select Multiple) *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCatModalOpen(true)}
                                            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 transition shadow-sm"
                                        >
                                            <FaPlus className="w-2.5 h-2.5" /> Add New Category
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                                        {categories.map((cat) => (
                                            <label key={cat.value} className={`flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-lg border transition ${product.categories?.includes(cat.value) ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    value={cat.value}
                                                    checked={product.categories?.includes(cat.value)}
                                                    onChange={() => toggleCategory(cat.value)}
                                                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 border-gray-300"
                                                />
                                                <span className="text-xs font-semibold text-gray-755">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Hypermarket Options */}
                        {activeTab === 'hypermarket' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Barcode / SKU</label>
                                        <div className="flex shadow-sm rounded-lg overflow-hidden">
                                            <input
                                                type="text"
                                                name="barcode"
                                                value={product.barcode}
                                                onChange={handleChange}
                                                placeholder="Scan or enter barcode"
                                                className="flex-1 rounded-l-lg border-gray-300 border focus:border-primary focus:ring-primary sm:text-sm p-3 text-black"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateRandomBarcode}
                                                className="bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 px-4 flex items-center gap-1.5 text-xs font-semibold text-gray-700 transition"
                                            >
                                                <FaBarcode /> Generate
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Aisle / Shelf Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={product.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Aisle 4, Shelf C"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Dietary Tag (Groceries)</label>
                                        <select
                                            name="dietary"
                                            value={product.dietary}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        >
                                            <option value="None">None / General</option>
                                            <option value="Veg">Veg (Green Label)</option>
                                            <option value="Non-Veg">Non-Veg (Red Label)</option>
                                            <option value="Egg">Egg (Yellow Label)</option>
                                            <option value="Vegan">Vegan (Dark Green Label)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Stock Alert Level (Reorder)</label>
                                        <input
                                            type="number"
                                            name="reorderLevel"
                                            value={product.reorderLevel}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Batch Number</label>
                                        <input
                                            type="text"
                                            name="batchNumber"
                                            value={product.batchNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. BATCH-2026A"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={product.expiryDate}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                        />
                                    </div>
                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                name="isPublished"
                                                checked={product.isPublished}
                                                onChange={handleChange}
                                                className="rounded text-primary focus:ring-primary h-5 w-5 border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="text-sm font-bold text-gray-900 block">Publish Product to Store</span>
                                                <span className="text-xs text-gray-500">Uncheck to set as draft (hidden from clients).</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Actions */}
                        <div className="flex justify-end gap-4 border-t border-gray-100 pt-6 mt-8">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-350 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className={`px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {updating ? 'Updating Product...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal for Adding New Category */}
            {isCatModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-150 transform transition-all animate-scaleUp">
                        <div className="bg-gradient-to-r from-primary to-green-600 px-6 py-4 text-white">
                            <h3 className="font-bold text-lg">Add New Category</h3>
                            <p className="text-green-50 text-xs mt-0.5">Define a category. This will save to Firestore immediately.</p>
                        </div>
                        <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Snacks & Biscuits"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={newCatImage}
                                    onChange={(e) => setNewCatImage(e.target.value)}
                                    placeholder="https://drive.google.com/thumbnail?id=..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Leave empty to use a standard category placeholder icon.</span>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Badge Style</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {PASTEL_COLORS.map((col) => (
                                        <button
                                            key={col.value}
                                            type="button"
                                            onClick={() => setNewCatColor(col.value)}
                                            className={`p-2.5 rounded-lg border text-[10px] font-bold text-center transition ${newCatColor === col.value ? 'ring-2 ring-primary ring-offset-2' : ''} ${col.value.split(' ')[0]} ${col.value.split(' ')[1]}`}
                                        >
                                            {col.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Badge */}
                            {newCatName && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <span className="text-xs text-gray-400 block mb-1">Preview Badge:</span>
                                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border ${newCatColor}`}>
                                        {newCatName}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCatModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingCategory || !newCatName.trim()}
                                    className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-green-700 rounded-lg shadow-sm transition disabled:opacity-50"
                                >
                                    {creatingCategory ? "Creating..." : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
