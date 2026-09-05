"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaPhone, FaSearch, FaUser, FaHeart, FaArrowRight, FaChevronRight, FaLeaf, FaShieldAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoryContext';
import { useWishlist } from '../context/WishlistContext';

const POPULAR_BRANDS = [
    "Amul", "Bakers", "Boost", "Britannia", "Double Horse", "Eastern",
    "Elite", "Gold Winner", "Himalaya", "India Gate", "Nirapara", "Pepsi"
];

const Navbar = () => {
    const { categories } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsOpen(false);
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 transition-all duration-300">
            {/* Top Micro Ticker Announcement Bar */}
            <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center text-emerald-400 font-semibold gap-1">
                            <FaLeaf className="w-3 h-3 animate-pulse" /> 100% Organic & Farm Fresh
                        </span>
                        <span className="hidden sm:inline text-slate-400">|</span>
                        <span className="hidden sm:inline text-slate-300">⚡ Express Delivery in 2 Hours</span>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-400">
                        <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
                            <FaShieldAlt className="text-emerald-400" /> Safe & Secure Checkout
                        </span>
                        <a href="tel:+918547246183" className="hover:text-emerald-400 transition">
                            Support: +91 8547246183
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navbar - Glassmorphism Container */}
            <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="group flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                                <FaLeaf className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">
                                    dichoos<span className="text-emerald-500">.</span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Fresh Grocery</span>
                            </div>
                        </Link>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                        <form onSubmit={handleSearch} className="flex w-full">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search fresh vegetables, fruits, daily essential..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-100/80 border border-slate-200 rounded-full py-2.5 pl-11 pr-24 text-sm text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white focus:border-emerald-500 transition-all duration-200"
                                />
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 gradient-emerald text-white px-5 py-1.5 rounded-full text-xs font-bold hover:shadow-md hover:shadow-emerald-500/30 transition-all active:scale-95"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Phone Hotline */}
                        <div className="flex items-center space-x-3 pr-4 border-r border-slate-200">
                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <FaPhone className="text-sm" />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[11px] text-slate-600 font-semibold">Call Hotline</span>
                                <span className="text-xs font-bold text-slate-900">+91 8547246183</span>
                            </div>
                        </div>

                        {/* Wishlist Icon */}
                        <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition group" title="Wishlist">
                            <FaHeart className="w-5 h-5 transition-transform group-hover:scale-110" />
                            {mounted && wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white animate-pulse">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Icon */}
                        <Link href="/cart" className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition group" title="Cart">
                            <FaShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Account Menu */}
                        {user ? (
                            <div className="flex items-center space-x-2 pl-2">
                                <Link href="/profile" className="flex items-center space-x-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border border-slate-200">
                                    <FaUser className="text-emerald-600" />
                                    <span>My Profile</span>
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="text-xs font-semibold text-slate-600 hover:text-red-600 transition px-2 py-1"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center space-x-2 gradient-emerald text-white px-4 py-2 rounded-full text-xs font-bold hover:shadow-md hover:shadow-emerald-500/20 transition active:scale-95">
                                <FaUser />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center space-x-3">
                        <Link href="/cart" className="relative p-2 text-slate-700 hover:text-emerald-600">
                            <FaShoppingCart className="w-6 h-6" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={toggleMenu}
                            className="p-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-slate-100 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Category Bar */}
            <div className="bg-slate-900 border-b border-slate-800 text-slate-200 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-12 items-center">
                        {/* All Categories Dropdown Trigger */}
                        <div className="relative group w-64">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full gradient-emerald text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between px-4 h-12 rounded-t-lg transition hover:brightness-105"
                            >
                                <span className="flex items-center space-x-2">
                                    <FaBars className="text-sm" />
                                    <span>All Categories</span>
                                </span>
                                <FaChevronRight className={`text-xs transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Dropdown Menu Overlay */}
                            {isDropdownOpen && (
                                <div className="absolute top-12 left-0 w-full bg-white shadow-xl z-50 rounded-b-xl border border-slate-200 text-slate-800 overflow-hidden py-2 animate-in fade-in duration-150">
                                    <ul>
                                        {categories.map((category) => (
                                            <li key={category.value} className="relative group/sub">
                                                <Link
                                                    href={`/products?category=${encodeURIComponent(category.value)}`}
                                                    className="flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition group-hover/sub:bg-emerald-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <div className="w-7 h-7 mr-3 relative flex-shrink-0 rounded-full overflow-hidden border border-slate-200">
                                                        <Image
                                                            src={category.image}
                                                            alt={category.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span>{category.name}</span>
                                                    {category.subcategories && category.subcategories.length > 0 && (
                                                        <FaChevronRight className="ml-auto text-[10px] text-slate-400 group-hover/sub:text-emerald-600" />
                                                    )}
                                                </Link>

                                                {/* Subcategories Flyout */}
                                                {category.subcategories && category.subcategories.length > 0 && (
                                                    <div className="absolute top-0 left-full w-60 bg-white shadow-2xl border border-slate-200 border-l-2 border-l-emerald-500 rounded-r-xl py-2 z-50 hidden group-hover/sub:block">
                                                        <ul>
                                                            {category.subcategories.map((sub) => (
                                                                <li key={sub.value}>
                                                                    <Link
                                                                        href={`/products?category=${encodeURIComponent(category.value)}&subcategory=${encodeURIComponent(sub.value)}`}
                                                                        className="block px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition"
                                                                        onClick={() => setIsDropdownOpen(false)}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-1 items-center space-x-8 pl-8 text-xs font-bold uppercase tracking-wider text-slate-300">
                            <Link href="/" className="hover:text-emerald-400 transition py-3">Home</Link>
                            <Link href="/products" className="hover:text-emerald-400 transition py-3">All Products</Link>
                            <Link href="/products?category=Vegetables" className="hover:text-emerald-400 transition py-3">Vegetables</Link>
                            <Link href="/products?category=Fruits" className="hover:text-emerald-400 transition py-3">Fruits</Link>
                            <Link href="/products?category=Offer" className="text-amber-400 hover:text-amber-300 transition py-3 flex items-center gap-1">
                                🔥 Offers
                            </Link>
                            <Link href="/brands" className="hover:text-emerald-400 transition py-3">Brands</Link>
                            <Link href="/contact" className="hover:text-emerald-400 transition py-3 ml-auto text-slate-400 hover:text-slate-200">Contact</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-6 shadow-xl animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        </div>
                    </form>
                    <div className="space-y-1 text-sm font-semibold text-slate-800">
                        <Link href="/" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>Home</Link>
                        <Link href="/products" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>All Products</Link>
                        <Link href="/products?category=Vegetables" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>Vegetables</Link>
                        <Link href="/products?category=Fruits" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>Fruits</Link>
                        <Link href="/products?category=Offer" className="block px-3 py-2 rounded-lg text-amber-600 font-bold hover:bg-amber-50" onClick={toggleMenu}>Special Offers</Link>
                        <Link href="/brands" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>Brands</Link>
                        <Link href="/about" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>About Us</Link>
                        <Link href="/contact" className="block px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600" onClick={toggleMenu}>Contact Us</Link>
                    </div>
                    {user ? (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                            <Link href="/profile" className="block w-full text-center gradient-emerald text-white py-2.5 rounded-lg text-xs font-bold" onClick={toggleMenu}>
                                My Profile & Orders
                            </Link>
                            <button
                                onClick={() => { logout(); toggleMenu(); }}
                                className="block w-full text-center bg-slate-100 text-slate-700 py-2.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <Link href="/login" className="block w-full text-center gradient-emerald text-white py-2.5 rounded-lg text-xs font-bold" onClick={toggleMenu}>
                                Login / Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
