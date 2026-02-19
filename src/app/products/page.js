"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductCard from '../../components/ProductCard';
import { seedProducts } from '../../utils/seed';

function ProductsContent() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, searchTerm]); // Refetch/Re-filter when URL changes

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch all products first (Client-side filtering handles the rest to support multi-category + legacy)
            // Note: For larger datasets, this should use 'array-contains' query, but that requires data migration for old items.
            let q = collection(db, "products");
            const querySnapshot = await getDocs(q);

            let productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter by Category
            if (categoryFilter) {
                if (categoryFilter === 'Offer') {
                    // "Offer" Logic: Check for active time-based offer
                    productsData = productsData.filter(product => {
                        const now = new Date();
                        const hasOfferPrice = product.offerPrice;
                        const offerStart = product.offerStart ? new Date(product.offerStart) : null;
                        const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

                        const isStarted = !offerStart || now >= offerStart;
                        const isEnded = offerEnd && now > offerEnd; // Strictly ended

                        const hasActiveTimeOffer = hasOfferPrice && isStarted && !isEnded;

                        // "Offer" Category Rules:
                        // 1. Explicitly in "Offer" category AND NOT Expired (if end date exists)
                        // 2. OR Has a valid active time-based offer

                        const isExplicitlyOffer = (product.categories?.includes('Offer') || product.category === 'Offer');
                        const isDatesExpired = offerEnd && now > offerEnd;

                        if (isExplicitlyOffer && !isDatesExpired) return true;
                        if (hasActiveTimeOffer) return true;

                        return false;
                    });
                } else {
                    // Standard Category Logic (Backward Compatible)
                    productsData = productsData.filter(product =>
                        (product.categories && product.categories.includes(categoryFilter)) ||
                        product.category === categoryFilter
                    );
                }
            }

            // Client-side filtering for search (starts with, case-insensitive)
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                productsData = productsData.filter(product =>
                    product.name.toLowerCase().startsWith(lowerTerm)
                );
            }

            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setSeeding(true);
        await seedProducts();
        await fetchProducts(); // Refresh list after seeding
        setSeeding(false);
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {searchTerm
                            ? `Search Results for "${searchTerm}"`
                            : categoryFilter
                                ? `${categoryFilter} Products`
                                : 'All Products'}
                    </h1>
                    {products.length === 0 && !loading && !searchTerm && !categoryFilter && (
                        <button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {seeding ? "Seeding..." : "Seed Sample Data"}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No products found.</p>
                        <p className="mt-2 text-sm">Click "Seed Sample Data" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
