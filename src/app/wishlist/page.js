"use client";
import { useState, useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getCleanProduct } from '../../utils/productUtils';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';

export default function WishlistPage() {
    const { wishlist, loading: wishlistLoading } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (wishlistLoading) return;

            if (wishlist.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const productPromises = wishlist.map(id => getDoc(doc(db, "products", id)));
                const productSnapshots = await Promise.all(productPromises);

                const fetchedProducts = productSnapshots
                    .filter(snap => snap.exists())
                    .map(snap => getCleanProduct({ id: snap.id, ...snap.data() }));

                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching wishlist products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [wishlist, wishlistLoading]);

    if (wishlistLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white p-10 rounded-xl shadow-sm">
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-50 p-4 rounded-full">
                                <FaHeart className="text-red-400 text-4xl opacity-50" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
                        <p className="text-gray-500 mb-8">
                            Looks like you haven't added any items to your wishlist yet.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition transform hover:scale-105 shadow-md"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-8">
                    <FaHeart className="text-red-500 text-2xl mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist ({products.length})</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
