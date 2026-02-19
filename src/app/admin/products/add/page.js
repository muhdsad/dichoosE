"use client";
import { useState } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { categories } from '../../../../utils/categories';

export default function AddProductPage() {
    const [product, setProduct] = useState({
        name: '',
        price: '',
        mrp: '',
        unit: '',
        stock: '',
        name: '',
        price: '',
        mrp: '',
        unit: '',
        stock: '',
        description: '',
        image: '',
        categories: [], // Store as array
        offerPrice: '',
        offerStart: '',
        offerEnd: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const toggleCategory = (categoryValue) => {
        setProduct(prev => {
            const currentCategories = prev.categories || [];
            if (currentCategories.includes(categoryValue)) {
                return { ...prev, categories: currentCategories.filter(c => c !== categoryValue) };
            } else {
                return { ...prev, categories: [...currentCategories, categoryValue] };
            }
        });
    };

    // Helper to convert Google Drive links to direct images
    const getDirectDriveLink = (url) => {
        if (url && url.includes('drive.google.com') && url.includes('/file/d/')) {
            const id = url.split('/file/d/')[1].split('/')[0];
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const imageUrl = getDirectDriveLink(product.image);

        try {
            // Create a timeout promise that rejects after 10 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. Please check your internet connection or Firebase configuration.')), 10000);
            });

            // Race the addDoc operation against the timeout
            await Promise.race([
                addDoc(collection(db, "products"), {
                    ...product,
                    image: imageUrl,
                    price: parseFloat(product.price),
                    mrp: product.mrp ? parseFloat(product.mrp) : 0,
                    unit: product.unit || '',
                    categories: product.categories,
                    category: product.categories.length > 0 ? product.categories[0] : '', // Backward compatibility
                    offerPrice: product.offerPrice ? parseFloat(product.offerPrice) : null,
                    offerStart: product.offerStart || null,
                    offerEnd: product.offerEnd || null
                }),
                timeoutPromise
            ]);

            setMessage('Product added successfully!');
            setProduct({ name: '', price: '', mrp: '', unit: '', stock: '', description: '', image: '', categories: [], category: '', offerPrice: '', offerStart: '', offerEnd: '' });
        } catch (error) {
            console.error("Error adding product: ", error);
            // Check for specific Firestore error
            if (error.message.includes('Database') || error.message.includes('not found')) {
                setMessage('Error: Firestore Database not found. Please create it in Firebase Console.');
            } else {
                setMessage(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Product</h1>

                {message && (
                    <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={product.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                step="0.01"
                                value={product.price}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
                            <input
                                type="number"
                                name="mrp"
                                step="0.01"
                                value={product.mrp}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unit (e.g., 1 kg, 500g, 1 pc)</label>
                            <input
                                type="text"
                                name="unit"
                                value={product.unit}
                                onChange={handleChange}
                                placeholder="1 kg"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Available Stock (Qty)</label>
                            <input
                                type="number"
                                name="stock"
                                value={product.stock}
                                onChange={handleChange}
                                placeholder="100"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories (Select Multiple)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                            {categories.map((cat) => (
                                <label key={cat.value} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        value={cat.value}
                                        checked={product.categories?.includes(cat.value)}
                                        onChange={() => toggleCategory(cat.value)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                        {/* Hidden input for backward compatibility if needed, or just rely on state */}
                    </div>

                    {/* Time-Based Offer Section */}
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h3 className="text-sm font-medium text-yellow-800 mb-2">Special Offer (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Offer Price (₹)</label>
                                <input
                                    type="number"
                                    name="offerPrice"
                                    step="0.01"
                                    value={product.offerPrice || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. 99"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Offer Start</label>
                                <input
                                    type="datetime-local"
                                    name="offerStart"
                                    value={product.offerStart || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Offer End</label>
                                <input
                                    type="datetime-local"
                                    name="offerEnd"
                                    value={product.offerEnd || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                            type="url"
                            name="image"
                            required
                            value={product.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="3"
                            value={product.description}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </form >
            </div >
        </div >
    );
}
