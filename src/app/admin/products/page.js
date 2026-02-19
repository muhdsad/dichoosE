"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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

    // Helper to convert Google Drive links to direct images for display
    const getDirectDriveLink = (url) => {
        if (url && url.includes('drive.google.com') && url.includes('/file/d/')) {
            const id = url.split('/file/d/')[1].split('/')[0];
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        return url;
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <Link href="/admin/products/add" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center">
                    <FaPlus className="mr-2" /> Add New Product
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase leading-normal">
                                <th className="py-3 px-6">Image</th>
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Category</th>
                                <th className="py-3 px-6">Stock</th>
                                <th className="py-3 px-6">Price</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6">
                                            {product.image && (
                                                <div className="relative h-8 w-8 rounded-md overflow-hidden">
                                                    <Image
                                                        src={getDirectDriveLink(product.image)}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="32px"
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 font-medium">{product.name}</td>
                                        <td className="py-3 px-6">
                                            {product.categories && product.categories.length > 0
                                                ? product.categories.join(', ')
                                                : product.category}
                                        </td>
                                        <td className="py-3 px-6">
                                            {product.stock !== undefined ? (
                                                <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.stock}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 font-bold">₹{product.price}</td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center space-x-4">
                                                <Link href={`/admin/products/edit/${product.id}`} className="text-blue-500 hover:text-blue-700 transform hover:scale-110 transition">
                                                    <FaEdit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:text-red-700 transform hover:scale-110 transition"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
