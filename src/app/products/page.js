"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaFilter, FaTimes, FaSearch, FaTag, FaRedo } from 'react-icons/fa';
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
    const brandFilter = searchParams.get('brand');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, subcategoryFilter, brandFilter, searchTerm]);

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

            // Filter by Brand
            if (brandFilter) {
                productsData = productsData.filter(product => product.brand && product.brand.toLowerCase() === brandFilter.toLowerCase());
            }

            // Filter by Search Term
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                productsData = productsData.filter(product =>
                    product.name.toLowerCase().includes(lowerTerm)
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
        await fetchProducts();
        setSeeding(false);
    };

    const clearAllFilters = () => {
        router.push('/products');
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
    const hasActiveFilters = Boolean(categoryFilter || subcategoryFilter || brandFilter || searchTerm);

    return (
        <div className="bg-slate-50 min-h-screen font-sans py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Banner & Breadcrumbs */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-soft mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-1">
                                <Link href="/" className="hover:text-emerald-600">Home</Link>
                                <span>/</span>
                                <span className="text-slate-900 font-bold">Shop Products</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {searchTerm
                                    ? `Search: "${searchTerm}"`
                                    : brandFilter
                                        ? `Brand: ${brandFilter}`
                                        : categoryFilter
                                            ? subcategoryFilter
                                                ? `${categoryFilter} › ${subcategoryFilter}`
                                                : `${categoryFilter} Collection`
                                            : 'All Grocery & Products'}
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                Showing {products.length} fresh {products.length === 1 ? 'item' : 'items'} available for 2-hour home delivery.
                            </p>
                        </div>

                        {/* Clear Filters / Seed Action */}
                        <div className="flex items-center space-x-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full transition"
                                >
                                    <FaTimes className="text-xs" /> Clear Filters
                                </button>
                            )}
                            {products.length === 0 && !loading && !searchTerm && !categoryFilter && !brandFilter && (
                                <button
                                    onClick={handleSeed}
                                    disabled={seeding}
                                    className="gradient-emerald text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-md transition disabled:opacity-50"
                                >
                                    {seeding ? "Seeding..." : "Seed Sample Data"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filter Chips */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active:</span>
                            {categoryFilter && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                    <FaTag className="text-[10px]" /> Category: {categoryFilter}
                                </span>
                            )}
                            {subcategoryFilter && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                                    Subcategory: {subcategoryFilter}
                                </span>
                            )}
                            {brandFilter && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                                    Brand: {brandFilter}
                                </span>
                            )}
                            {searchTerm && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                                    Keyword: "{searchTerm}"
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Subcategory Filter Pills */}
                {categoryFilter && categoryFilter !== 'Offer' && subcategories.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-soft mb-8">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                            Filter by Subcategory
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                onClick={() => handleSubcategoryClick(null)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                                    !subcategoryFilter
                                        ? 'gradient-emerald text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All {categoryFilter}
                            </button>
                            {subcategories.map(sub => (
                                <button
                                    key={sub.value}
                                    onClick={() => handleSubcategoryClick(sub.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                                        subcategoryFilter === sub.value
                                            ? 'gradient-emerald text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft max-w-lg mx-auto my-12">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                            <FaSearch />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900">No Matching Products Found</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            We couldn't find any products matching your current filters. Try searching for something else or browse all products.
                        </p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-6 inline-flex items-center gap-2 gradient-emerald text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:scale-105 transition"
                        >
                            <FaRedo className="text-xs" /> Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64 text-slate-500 font-semibold">Loading shop...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
