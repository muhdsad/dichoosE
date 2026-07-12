"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../../components/ProductCard';
import { seedProducts } from '../../utils/seed';
import { getCleanProduct } from '../../utils/productUtils';
import { useCategories } from '../../context/CategoryContext';

function ProductsContent() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { categories } = useCategories();

    const categoryFilter = searchParams.get('category');
    const subcategoryFilter = searchParams.get('subcategory');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, subcategoryFilter, searchTerm]); // Refetch/Re-filter when URL changes

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let q = collection(db, "products");
            const querySnapshot = await getDocs(q);

            let productsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return getCleanProduct({
                    id: doc.id,
                    ...data
                });
            }).filter(product => product.isPublished !== false);

            // Filter by Category
            if (categoryFilter) {
                if (categoryFilter === 'Offer') {
                    // "Offer" Logic: Since we already cleaned products with getCleanProduct,
                    // we just need to check if 'Offer' is still in categories or is the main category.
                    // This handles both explicit 'Offer' category and active time-based offers
                    // (because getCleanProduct keeps 'Offer' and offerPrice if the date is valid).
                    productsData = productsData.filter(product => {
                        const hasOfferPrice = product.offerPrice && parseFloat(product.offerPrice) > 0;
                        if (!hasOfferPrice) return false;

                        const now = new Date();
                        const offerStart = product.offerStart ? new Date(product.offerStart) : null;
                        const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

                        const isStarted = !offerStart || now >= offerStart;
                        const isEnded = offerEnd && now > offerEnd;

                        return isStarted && !isEnded;
                    });
                } else {
                    // Standard Category Logic (Backward Compatible)
                    productsData = productsData.filter(product =>
                        (product.categories && product.categories.includes(categoryFilter)) ||
                        product.category === categoryFilter
                    );
                }
            }

            // Filter by Subcategory
            if (subcategoryFilter) {
                productsData = productsData.filter(product => product.subcategory === subcategoryFilter);
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

    const handleSubcategoryClick = (subVal) => {
        const params = new URLSearchParams(window.location.search);
        if (subVal) {
            params.set('subcategory', subVal);
        } else {
            params.delete('subcategory');
        }
        router.push(`/products?${params.toString()}`);
    };

    const activeCategory = categories.find(c => c.value === categoryFilter || c.name === categoryFilter);
    const subcategories = activeCategory ? (activeCategory.subcategories || []) : [];

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {searchTerm
                            ? `Search Results for "${searchTerm}"`
                            : categoryFilter
                                ? subcategoryFilter
                                    ? `${categoryFilter} > ${subcategoryFilter}`
                                    : `${categoryFilter} Products`
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

                {/* Subcategory Filter Chips */}
                {categoryFilter && categoryFilter !== 'Offer' && subcategories.length > 0 && (
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Filter by Subcategory</span>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            <button
                                onClick={() => handleSubcategoryClick(null)}
                                className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition border ${!subcategoryFilter ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                                All {categoryFilter}
                            </button>
                            {subcategories.map(sub => (
                                <button
                                    key={sub.value}
                                    onClick={() => handleSubcategoryClick(sub.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition border ${subcategoryFilter === sub.value ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                        <p className="mt-2 text-sm">Please check other categories or search terms.</p>
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
