"use client";
import { useState } from 'react';
import { useCategories } from '../../../context/CategoryContext';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaTags, FaPalette, FaImage } from 'react-icons/fa';

const PASTEL_COLORS = [
    { name: "Orange", value: "bg-orange-50 border-orange-200 text-orange-700", dbValue: "bg-orange-100 text-orange-800 border-orange-200" },
    { name: "Green", value: "bg-green-50 border-green-200 text-green-700", dbValue: "bg-green-100 text-green-800 border-green-200" },
    { name: "Red", value: "bg-red-50 border-red-200 text-red-700", dbValue: "bg-red-100 text-red-800 border-red-200" },
    { name: "Yellow", value: "bg-yellow-50 border-yellow-200 text-yellow-700", dbValue: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { name: "Teal", value: "bg-teal-50 border-teal-200 text-teal-700", dbValue: "bg-teal-100 text-teal-800 border-teal-200" },
    { name: "Blue", value: "bg-blue-50 border-blue-200 text-blue-700", dbValue: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "Purple", value: "bg-purple-50 border-purple-200 text-purple-700", dbValue: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "Pink", value: "bg-pink-50 border-pink-200 text-pink-700", dbValue: "bg-pink-100 text-pink-800 border-pink-200" },
    { name: "Indigo", value: "bg-indigo-50 border-indigo-200 text-indigo-700", dbValue: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { name: "Gray", value: "bg-gray-50 border-gray-200 text-gray-700", dbValue: "bg-gray-100 text-gray-800 border-gray-200" }
];

export default function AdminCategoriesPage() {
    const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
    
    // Category Modal / Form State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [catModalMode, setCatModalMode] = useState('add'); // 'add' or 'edit'
    const [editingCatId, setEditingCatId] = useState(null);
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('bg-green-100 text-green-800 border-green-200');
    const [catImage, setCatImage] = useState('');
    
    // Subcategory Form State
    const [activeCatId, setActiveCatId] = useState(null); // Expanded category ID for subcategories
    const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
    const [subcatModalMode, setSubcatModalMode] = useState('add'); // 'add' or 'edit'
    const [editingSubcatVal, setEditingSubcatVal] = useState('');
    const [subcatName, setSubcatName] = useState('');

    const [actionLoading, setActionLoading] = useState(false);

    // Toggle Category Subcategories Expand
    const toggleExpand = (catId) => {
        setActiveCatId(activeCatId === catId ? null : catId);
    };

    // Category Operations
    const handleOpenAddCat = () => {
        setCatModalMode('add');
        setCatName('');
        setCatColor('bg-green-100 text-green-800 border-green-200');
        setCatImage('');
        setIsCatModalOpen(true);
    };

    const handleOpenEditCat = (cat) => {
        setCatModalMode('edit');
        setEditingCatId(cat.id);
        setCatName(cat.name);
        // Find matching or default color
        setCatColor(cat.color || 'bg-green-100 text-green-800 border-green-200');
        setCatImage(cat.image || '');
        setIsCatModalOpen(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!catName.trim()) return;
        setActionLoading(true);
        try {
            if (catModalMode === 'add') {
                await addCategory({
                    name: catName.trim(),
                    value: catName.trim(),
                    image: catImage.trim() || "/categories/default.png",
                    color: catColor,
                    subcategories: []
                });
            } else {
                await updateCategory(editingCatId, {
                    name: catName.trim(),
                    value: catName.trim(),
                    image: catImage.trim() || "/categories/default.png",
                    color: catColor
                });
            }
            setIsCatModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save category");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCategory = async (catId, catName) => {
        if (!confirm(`Are you sure you want to delete category "${catName}"? This will not delete products under it, but they will become uncategorized.`)) return;
        setActionLoading(true);
        try {
            await deleteCategory(catId);
        } catch (err) {
            console.error(err);
            alert("Failed to delete category");
        } finally {
            setActionLoading(false);
        }
    };

    // Subcategory Operations
    const handleOpenAddSubcat = (catId) => {
        setSubcatModalMode('add');
        setSubcatName('');
        setIsSubcatModalOpen(true);
    };

    const handleOpenEditSubcat = (subcat) => {
        setSubcatModalMode('edit');
        setEditingSubcatVal(subcat.value);
        setSubcatName(subcat.name);
        setIsSubcatModalOpen(true);
    };

    const handleSaveSubcategory = async (e) => {
        e.preventDefault();
        if (!subcatName.trim()) return;
        setActionLoading(true);
        try {
            const currentCat = categories.find(c => c.id === activeCatId);
            if (!currentCat) return;

            let updatedSubcats = [...(currentCat.subcategories || [])];
            if (subcatModalMode === 'add') {
                // Prevent duplicate values
                if (updatedSubcats.some(s => s.value.toLowerCase() === subcatName.trim().toLowerCase())) {
                    alert("Subcategory already exists!");
                    setActionLoading(false);
                    return;
                }
                updatedSubcats.push({
                    name: subcatName.trim(),
                    value: subcatName.trim()
                });
            } else {
                updatedSubcats = updatedSubcats.map(s => 
                    s.value === editingSubcatVal ? { name: subcatName.trim(), value: subcatName.trim() } : s
                );
            }

            await updateCategory(activeCatId, { subcategories: updatedSubcats });
            setIsSubcatModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save subcategory");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSubcategory = async (subcatVal, subcatName) => {
        if (!confirm(`Are you sure you want to delete subcategory "${subcatName}"?`)) return;
        setActionLoading(true);
        try {
            const currentCat = categories.find(c => c.id === activeCatId);
            if (!currentCat) return;

            const updatedSubcats = (currentCat.subcategories || []).filter(s => s.value !== subcatVal);
            await updateCategory(activeCatId, { subcategories: updatedSubcats });
        } catch (err) {
            console.error(err);
            alert("Failed to delete subcategory");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 font-bold text-gray-500">Loading Categories & Subcategories...</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 text-black">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Category Options Editor</h1>
                    <p className="text-sm text-gray-500 mt-1">Add, edit, or delete categories and their subcategories for the product catalog.</p>
                </div>
                <button
                    onClick={handleOpenAddCat}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-md transition flex items-center gap-2 font-bold text-sm"
                >
                    <FaPlus /> Add New Category
                </button>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
                {categories.map((cat) => {
                    const isExpanded = activeCatId === cat.id;
                    const subcount = cat.subcategories?.length || 0;

                    return (
                        <div key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                            {/* Card Header */}
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-150">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden relative">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <FaTags className="text-gray-400 w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-lg text-gray-800">{cat.name}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${cat.color || 'bg-gray-100 text-gray-800'}`}>
                                                Badge Style
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Value (slug): <span className="font-mono text-gray-700 font-semibold">{cat.value}</span> | {subcount} subcategory options</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => toggleExpand(cat.id)}
                                        className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                                    >
                                        Subcategories {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenEditCat(cat)}
                                        className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit Category Info"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    {cat.name !== 'Offer' && (
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Category"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Subcategories Area */}
                            {isExpanded && (
                                <div className="p-6 bg-gray-50/50 border-t border-gray-100 animate-fadeIn">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Subcategory Options for {cat.name}</h4>
                                        <button
                                            onClick={() => handleOpenAddSubcat(cat.id)}
                                            className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                                        >
                                            <FaPlus className="w-2.5 h-2.5 text-primary" /> Add Subcategory
                                        </button>
                                    </div>

                                    {subcount === 0 ? (
                                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400 font-medium text-xs">
                                            No subcategories defined yet. Click "Add Subcategory" to define one.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {cat.subcategories.map((sub) => (
                                                <div key={sub.value} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-xs">
                                                    <div>
                                                        <span className="font-bold text-gray-800 text-sm">{sub.name}</span>
                                                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">Value: {sub.value}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleOpenEditSubcat(sub)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                                            title="Edit Name"
                                                        >
                                                            <FaEdit size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSubcategory(sub.value, sub.name)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                                            title="Delete Subcategory"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Category Add/Edit Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-150 transform transition-all animate-scaleUp">
                        <div className="bg-gradient-to-r from-primary to-green-600 px-6 py-4 text-white">
                            <h3 className="font-bold text-lg">{catModalMode === 'add' ? "Add New Category" : "Edit Category Options"}</h3>
                            <p className="text-green-50 text-xs mt-0.5">Define category attributes. These changes take effect immediately.</p>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="e.g. Household Care"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <FaImage className="text-gray-400" /> Icon / Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={catImage}
                                    onChange={(e) => setCatImage(e.target.value)}
                                    placeholder="e.g. /categories/household.png"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Specify a local path or external link.</span>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                                    <FaPalette className="text-gray-400" /> Badge Visual Style
                                </label>
                                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border rounded-lg bg-gray-50">
                                    {PASTEL_COLORS.map((col) => (
                                        <button
                                            key={col.dbValue}
                                            type="button"
                                            onClick={() => setCatColor(col.dbValue)}
                                            className={`p-2 rounded-lg border text-[10px] font-bold text-center transition ${catColor === col.dbValue ? 'ring-2 ring-primary ring-offset-1' : ''} ${col.value.split(' ')[0]} ${col.value.split(' ')[1]}`}
                                        >
                                            {col.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Badge */}
                            {catName && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <span className="text-xs text-gray-400 block mb-1">Preview Badge:</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${catColor}`}>
                                        {catName}
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
                                    disabled={actionLoading || !catName.trim()}
                                    className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-green-700 rounded-lg shadow-sm transition disabled:opacity-50"
                                >
                                    {actionLoading ? "Saving..." : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subcategory Add/Edit Modal */}
            {isSubcatModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-150 transform transition-all animate-scaleUp">
                        <div className="bg-gradient-to-r from-primary to-green-600 px-6 py-4 text-white">
                            <h3 className="font-bold text-base">{subcatModalMode === 'add' ? "Add Subcategory Option" : "Edit Subcategory Option"}</h3>
                            <p className="text-green-50 text-xs mt-0.5">Define subcategory name. Value/slug will match name.</p>
                        </div>
                        <form onSubmit={handleSaveSubcategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subcategory Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={subcatName}
                                    onChange={(e) => setSubcatName(e.target.value)}
                                    placeholder="e.g. Leafy Vegetables"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border text-black"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsSubcatModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading || !subcatName.trim()}
                                    className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-green-700 rounded-lg shadow-sm transition disabled:opacity-50"
                                >
                                    {actionLoading ? "Saving..." : "Save Subcategory"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
