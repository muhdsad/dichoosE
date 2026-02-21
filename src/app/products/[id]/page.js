"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getCleanProduct, getDirectDriveLink } from '../../../utils/productUtils';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct(getCleanProduct({ id: docSnap.id, ...data }));
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
                    {/* Image */}
                    <div className="flex flex-col-reverse">
                        <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                            {/* Thumbnails could go here */}
                        </div>
                        <div className="w-full aspect-w-1 aspect-h-1 relative h-96 rounded-lg bg-gray-100 overflow-hidden sm:h-[500px]">
                            <Image
                                src={getDirectDriveLink(product.image)}
                                alt={product.name}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <div className="flex items-end">
                                <p className="text-3xl text-gray-900">₹{product.price.toFixed(2)}</p>
                                {product.mrp && product.mrp > product.price && (
                                    <>
                                        <p className="ml-2 text-lg text-gray-500 line-through">₹{product.mrp.toFixed(2)}</p>
                                        <p className="ml-2 text-sm text-green-600 font-bold">
                                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                        </p>
                                    </>
                                )}
                            </div>
                            {product.unit && <p className="mt-1 text-sm text-gray-500">Per {product.unit}</p>}

                            <div className="mt-2">
                                {product.stock > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                <p>{product.description}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <span className="mr-2 text-gray-500">Category:</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                    {product.category}
                                </span>
                            </div>
                        </div>

                        <div className="mt-10">
                            {product.stock > 0 ? (
                                <>
                                    <div className="flex items-center mb-6">
                                        <span className="mr-3 text-gray-700 font-medium">Quantity:</span>
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                            >-</button>
                                            <span className="px-3 py-1 text-gray-900 font-medium w-12 text-center">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                            >+</button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className={`w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                    >
                                        {added ? (
                                            <>
                                                <FaCheck className="mr-2" /> Added to Cart
                                            </>
                                        ) : (
                                            <>
                                                <FaShoppingCart className="mr-2" /> Add to Cart
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-500 cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
