"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { categories } from '../../../../../utils/categories';
import { getDirectDriveLink } from '../../../../../utils/productUtils';

export default function EditProductPage({ params }) {
    const router = useRouter();
    // unwrapping params using React.use()
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [product, setProduct] = useState({
        name: '',
        price: '',
        mrp: '',
        unit: '',
        description: '',
        image: '',
        category: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');

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
                        offerPrice: data.offerPrice || '',
                        offerStart: data.offerStart || '',
                        offerEnd: data.offerEnd || ''
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');

        const imageUrl = getDirectDriveLink(product.image);

        try {
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, {
                name: product.name,
                price: parseFloat(product.price),
                mrp: product.mrp ? parseFloat(product.mrp) : 0,
                unit: product.unit || '',
                stock: product.stock !== '' ? parseInt(product.stock) : 0,
                description: product.description,
                image: imageUrl,
                categories: product.categories,
                category: product.categories.length > 0 ? product.categories[0] : '', // Backward compatibility
                offerPrice: product.offerPrice ? parseFloat(product.offerPrice) : null,
                offerStart: product.offerStart || null,
                offerEnd: product.offerEnd || null
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

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Product</h1>

                {message && (
                    <div className={`p-4 mb-4 rounded ${message.includes('Error') || message.includes('not found') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
                        disabled={updating}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {updating ? 'Updating...' : 'Update Product'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
