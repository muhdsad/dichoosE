"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';
import Link from 'next/link';
import Image from 'next/image';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaEye, FaEyeSlash, FaSearch, FaBarcode } from 'react-icons/fa';

const DietDot = ({ type }) => {
    if (!type || type === 'None') return null;
    let color = 'bg-green-600';
    if (type === 'Non-Veg') color = 'bg-red-600';
    else if (type === 'Egg') color = 'bg-yellow-500';
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} border border-white ml-1`} title={`Dietary: ${type}`}></span>;
};

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(p => p.name && p.name.trim() !== '');
            setProducts(productsList);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, "products", id));
                setProducts(products.filter(product => product.id !== id));
            } catch (error) {
                console.error("Error deleting product: ", error);
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        const matchesName = product.name?.toLowerCase().includes(term);
        const matchesBrand = product.brand?.toLowerCase().includes(term);
        const matchesBarcode = product.barcode?.toLowerCase().includes(term);
        const matchesCategory = (product.categories && product.categories.join(' ').toLowerCase().includes(term)) || product.category?.toLowerCase().includes(term);
        const matchesSubcategory = product.subcategory?.toLowerCase().includes(term);
        return matchesName || matchesBrand || matchesBarcode || matchesCategory || matchesSubcategory;
    });

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-500 font-bold">Loading Products List...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Store Catalog</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage product lists, stock thresholds, expiry, and active status.</p>
                </div>
                <Link href="/admin/products/add" className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-md transition flex items-center gap-2 font-bold text-sm">
                    <FaPlus /> Add New Product
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex items-center gap-3">
                <FaSearch className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, brand, barcode (EAN), or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-250 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-155 overflow-hidden animate-fadeIn">
                {/* Desktop Table View */}
                <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-150">
                                <th className="py-4 px-6 w-16">Image</th>
                                <th className="py-4 px-6">Product Details</th>
                                <th className="py-4 px-6">Category & Status</th>
                                <th className="py-4 px-6">Inventory status</th>
                                <th className="py-4 px-6">Pricing</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">No products found in catalog.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const reorder = product.reorderLevel !== undefined ? Number(product.reorderLevel) : 5;
                                    const isOutOfStock = product.stock === undefined || product.stock === '' || Number(product.stock) <= 0;
                                    const isLowStock = !isOutOfStock && Number(product.stock) <= reorder;

                                    return (
                                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-55 transition">
                                            <td className="py-4 px-6">
                                                {product.image ? (
                                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                                        <Image
                                                            src={getDirectDriveLink(product.image)}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 bg-gray-50 font-semibold">No Image</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-gray-800 text-base">{product.name}</span>
                                                    {product.dietary && product.dietary !== 'None' && (
                                                        <DietDot type={product.dietary} />
                                                    )}
                                                </div>
                                                {product.brand && (
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide block mt-0.5">{product.brand}</span>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {product.barcode && (
                                                        <span className="text-[10px] bg-gray-100 border border-gray-200 text-gray-500 font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <FaBarcode size={8} /> {product.barcode}
                                                        </span>
                                                    )}
                                                    {product.location && (
                                                        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-650 px-1.5 py-0.5 rounded font-semibold">
                                                            Aisle: {product.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-xs font-semibold text-gray-600 uppercase">
                                                    {product.categories && product.categories.length > 0
                                                        ? product.categories.join(', ')
                                                        : product.category || 'Unassigned'}
                                                </div>
                                                {product.subcategory && (
                                                    <div className="mt-1">
                                                        <span className="inline-block text-[9px] text-gray-500 font-extrabold bg-gray-100 border border-gray-250 px-2 py-0.5 rounded">
                                                            Sub: {product.subcategory}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="mt-1.5">
                                                    {product.isPublished !== false ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                                            <FaEye size={10} /> Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-50 border border-yellow-250 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                                            <FaEyeSlash size={10} /> Draft
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {isOutOfStock ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-red-700">
                                                        Out of Stock (0)
                                                    </span>
                                                ) : isLowStock ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-250 text-amber-700" title={`Reorder Alert: <= ${reorder}`}>
                                                            <FaExclamationTriangle className="text-amber-500" /> Low Stock ({product.stock})
                                                        </span>
                                                        <span className="block text-[10px] text-gray-400 pl-1">Threshold: {reorder}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 border border-green-205 text-green-700">
                                                        In Stock ({product.stock})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 text-base">₹{Number(product.price || 0).toFixed(2)}</div>
                                                {product.mrp && Number(product.mrp) > Number(product.price) && (
                                                    <div className="text-[10px] text-gray-400 line-through mt-0.5">MRP: ₹{Number(product.mrp).toFixed(2)}</div>
                                                )}
                                                {product.unit && (
                                                    <span className="text-[10px] text-gray-450 font-semibold uppercase mt-1 block">Per {product.unit}</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition" title="Edit Product">
                                                        <FaEdit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Product"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List View */}
                <div className="block xl:hidden divide-y divide-gray-150">
                    {filteredProducts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-medium bg-white">No products found in catalog.</div>
                    ) : (
                        filteredProducts.map((product) => {
                            const reorder = product.reorderLevel !== undefined ? Number(product.reorderLevel) : 5;
                            const isOutOfStock = product.stock === undefined || product.stock === '' || Number(product.stock) <= 0;
                            const isLowStock = !isOutOfStock && Number(product.stock) <= reorder;

                            return (
                                <div key={product.id} className="p-4.5 space-y-3.5 bg-white hover:bg-gray-50 transition">
                                    {/* Product Details Header */}
                                    <div className="flex items-start gap-3.5">
                                        {product.image ? (
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex-shrink-0">
                                                <img
                                                    src={getDirectDriveLink(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-gray-50 font-bold flex-shrink-0">No Image</div>
                                        )}
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <span className="font-extrabold text-gray-800 text-sm leading-snug">{product.name}</span>
                                                {product.dietary && product.dietary !== 'None' && (
                                                    <DietDot type={product.dietary} />
                                                )}
                                            </div>
                                            {product.brand && (
                                                <span className="text-[9px] font-extrabold text-primary uppercase tracking-wide block mt-0.5">{product.brand}</span>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                {product.barcode && (
                                                    <span className="text-[9px] bg-gray-100 border border-gray-200 text-gray-500 font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        <FaBarcode size={8} /> {product.barcode}
                                                    </span>
                                                )}
                                                {product.location && (
                                                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-650 px-1.5 py-0.5 rounded font-semibold">
                                                        Aisle: {product.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                            <span className="font-extrabold text-gray-900 text-sm">₹{Number(product.price || 0).toFixed(2)}</span>
                                            {product.mrp && Number(product.mrp) > Number(product.price) && (
                                                <span className="text-[9px] text-gray-400 line-through">MRP: ₹{Number(product.mrp).toFixed(2)}</span>
                                            )}
                                            {product.unit && (
                                                <span className="text-[9px] text-gray-450 font-semibold uppercase">Per {product.unit}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category and Stock Badges */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase">
                                                {product.categories && product.categories.length > 0
                                                    ? product.categories.join(', ')
                                                    : product.category || 'Unassigned'}
                                            </div>
                                            {product.subcategory && (
                                                <span className="inline-block text-[8px] text-gray-500 font-bold bg-gray-100 border border-gray-250 px-1.5 py-0.5 rounded mt-0.5">
                                                    Sub: {product.subcategory}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Publish status */}
                                            {product.isPublished !== false ? (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                                    <FaEye size={8} /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-yellow-50 border border-yellow-250 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                                    <FaEyeSlash size={8} /> Draft
                                                </span>
                                            )}

                                            {/* Stock status */}
                                            {isOutOfStock ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 border border-red-200 text-red-700">
                                                    Out of Stock (0)
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-250 text-amber-700 animate-pulse" title={`Reorder Alert: <= ${reorder}`}>
                                                    <FaExclamationTriangle className="text-amber-500" size={8} /> Low ({product.stock})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 border border-green-205 text-green-700">
                                                    Stock: {product.stock}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 border-t border-gray-100 pt-2.5">
                                        <Link 
                                            href={`/admin/products/edit/${product.id}`} 
                                            className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition font-bold text-xs flex items-center justify-center gap-1 border border-blue-150 shadow-sm"
                                        >
                                            <FaEdit size={12} /> Edit Product
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition font-bold text-xs flex items-center justify-center gap-1 border border-red-150"
                                        >
                                            <FaTrash size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
