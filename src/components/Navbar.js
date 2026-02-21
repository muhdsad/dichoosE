"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaPhone, FaSearch, FaUser, FaHeart, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../utils/categories';

import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
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
            setIsOpen(false); // Close mobile menu if open
        }
    };

    return (
        <header className="w-full font-sans">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-4xl font-bold text-primary tracking-tighter">
                            Dichoos
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                        <form onSubmit={handleSearch} className="flex w-full">
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 border-r-0 rounded-l-sm py-2 px-4 focus:outline-none focus:border-primary font-abel text-sm"
                            />
                            <button type="submit" className="bg-primary text-white rounded-r-sm px-6 hover:bg-green-600 transition flex items-center justify-center">
                                <FaSearch size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-center space-x-2 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <FaPhone className="text-primary" size={16} />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500">Call Us Now</span>
                                <span className="text-sm font-bold font-abel">+91 8547246183</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link href="/wishlist" className="relative text-gray-700 hover:text-primary transition group">
                                <FaHeart size={24} />
                                {mounted && wishlist.length > 0 && (
                                    <span suppressHydrationWarning className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>
                            <Link href="/cart" className="relative text-gray-700 hover:text-primary transition group">
                                <FaShoppingCart size={24} />
                                {mounted && cartCount > 0 && (
                                    <span suppressHydrationWarning className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition font-abel font-bold">
                                        <FaUser size={20} />
                                        <span>My Orders</span>
                                    </Link>
                                    <button onClick={() => logout()} className="flex items-center space-x-1 text-gray-700 hover:text-primary transition font-abel font-bold ml-4">
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition font-abel font-bold">
                                    <FaUser size={20} />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Link href="/cart" className="relative text-gray-700 hover:text-primary transition mr-4">
                            <FaShoppingCart size={24} />
                            {mounted && cartCount > 0 && (
                                <span suppressHydrationWarning className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-b border-gray-200 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-12 items-center">
                        {/* All Categories Button */}
                        <div className="relative group w-64">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-primary text-white font-bold font-abel flex items-center justify-between px-4 h-12 rounded-t-sm focus:outline-none"
                            >
                                <span className="flex items-center"><FaBars className="mr-3" /> ALL CATEGORIES</span>
                                <FaArrowRight className={`text-sm transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-12 left-0 w-full bg-white shadow-lg z-50 rounded-b-sm border border-t-0 border-gray-200">
                                    <ul className="py-2">
                                        {categories.map((category) => (
                                            <li key={category.value}>
                                                <Link
                                                    href={`/products?category=${encodeURIComponent(category.value)}`}
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition font-abel font-bold uppercase text-sm"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <div className="w-8 h-8 mr-3 relative flex-shrink-0">
                                                        <Image
                                                            src={category.image}
                                                            alt={category.name}
                                                            fill
                                                            className="object-cover rounded-full"
                                                        />
                                                    </div>
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Nav Links */}
                        <div className="flex flex-1 items-center justify-start pl-8 space-x-8 font-abel font-bold text-gray-800 text-sm tracking-wide">
                            <Link href="/" className="hover:text-primary transition uppercase">Home</Link>
                            <Link href="/products" className="hover:text-primary transition uppercase">Shop</Link>
                            <Link href="/products?category=Vegetables" className="hover:text-primary transition uppercase">Vegetables</Link>
                            <Link href="/products?category=Fruits" className="hover:text-primary transition uppercase">Fruits</Link>
                            <Link href="/products?category=Offer" className="hover:text-primary transition uppercase text-red-600">Offers</Link>
                            <Link href="/contact" className="hover:text-primary transition uppercase ml-auto">Contact</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <form onSubmit={handleSearch} className="mb-4">
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-primary font-abel"
                            />
                        </form>
                        <Link href="/" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Home</Link>
                        <Link href="/products?category=Vegetables" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Vegetables</Link>
                        <Link href="/products?category=Fruits" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Fruits</Link>
                        <Link href="/products?category=Offer" className="block text-red-600 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Offers</Link>
                        <Link href="/about" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>About Us</Link>
                        <Link href="/contact" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Contact</Link>
                        {user ? (
                            <>
                                <Link href="/profile" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>My Orders</Link>
                                <button onClick={() => { logout(); toggleMenu(); }} className="block w-full text-left text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase">Logout</button>
                            </>
                        ) : (
                            <Link href="/login" className="block text-gray-700 hover:text-primary py-2 font-abel font-bold uppercase" onClick={toggleMenu}>Login</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
