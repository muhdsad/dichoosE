"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getCleanProduct } from '../../utils/productUtils';
import Link from 'next/link';
import { FaSearch, FaTimes, FaTag, FaChevronRight } from 'react-icons/fa';

export default function BrandsPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.title = "Shop by Brand - Dichoos Hypermarket";
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return getCleanProduct({
                    id: doc.id,
                    ...data
                });
            }).filter(product => product.isPublished !== false);

            // Extract unique brands and count products per brand
            const counts = {};
            productsData.forEach(product => {
                if (product.brand) {
                    const brandName = product.brand.trim();
                    // Normalize casing for grouping, but keep original casing for display if possible.
                    // We'll store counts and sort.
                    counts[brandName] = (counts[brandName] || 0) + 1;
                }
            });

            const brandList = Object.keys(counts).map(name => ({
                name,
                count: counts[name],
                firstLetter: name.charAt(0).toUpperCase()
            })).sort((a, b) => a.name.localeCompare(b.name));

            setBrands(brandList);
        } catch (error) {
            console.error("Error fetching brands:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter brands based on search input
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    // Group filtered brands by their first letter
    const groupedBrands = filteredBrands.reduce((groups, brand) => {
        const letter = brand.firstLetter;
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(brand);
        return groups;
    }, {});

    // Generate list of alphabets A-Z for the index bar
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const activeLetters = Object.keys(groupedBrands);

    const scrollToLetter = (letter) => {
        const element = document.getElementById(`letter-${letter}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="bg-light min-h-screen">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-white py-16 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary mb-4">
                        <FaTag size={10} /> Brand Catalog
                    </span>
                    <h1 className="text-4xl md:text-5xl font-anton text-gray-900 tracking-tight mb-4">
                        Shop by Brand
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto font-sans font-medium text-base">
                        Browse our extensive selection of hypermarket brands. Click on any brand to discover all of its products instantly.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mt-8 relative">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-950 font-sans shadow-sm transition"
                            />
                            <FaSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <p className="text-gray-500 font-bold font-sans">Loading brands...</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xl font-bold font-sans">No brands found in the catalog.</p>
                        <p className="mt-2 text-sm">Make sure you have added products with brands in the admin panel.</p>
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xl font-bold font-sans">No matching brands found.</p>
                        <p className="mt-2 text-sm">Try typing a different brand name.</p>
                    </div>
                ) : (
                    <>
                        {/* Alphabetical Quick Links (A-Z Index) */}
                        {!searchTerm && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-10 overflow-x-auto scrollbar-hide">
                                <div className="flex justify-between items-center min-w-[700px] gap-1 px-2">
                                    {alphabets.map(letter => {
                                        const hasLetter = activeLetters.includes(letter);
                                        return (
                                            <button
                                                key={letter}
                                                disabled={!hasLetter}
                                                onClick={() => scrollToLetter(letter)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                                                    hasLetter
                                                        ? 'text-primary hover:bg-primary/10 cursor-pointer'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                            >
                                                {letter}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Brands Grid grouped by Letter */}
                        <div className="space-y-12">
                            {Object.keys(groupedBrands).sort().map(letter => (
                                <div 
                                    key={letter} 
                                    id={`letter-${letter}`} 
                                    className="scroll-mt-6"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-3xl font-anton text-primary bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                                            {letter}
                                        </h2>
                                        <div className="h-px bg-gray-200 flex-grow"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {groupedBrands[letter].map((brand) => (
                                            <Link
                                                key={brand.name}
                                                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                                                className="group bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary transition duration-350 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    {/* Avatar Icon */}
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-green-600 flex items-center justify-center text-white font-anton text-lg shadow-inner flex-shrink-0">
                                                        {letter}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-bold text-gray-800 font-sans group-hover:text-primary transition truncate text-base">
                                                            {brand.name}
                                                        </h3>
                                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 block mt-0.5 w-max">
                                                            {brand.count} {brand.count === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <FaChevronRight className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition duration-200 flex-shrink-0" size={12} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
