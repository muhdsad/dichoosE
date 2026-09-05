import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaTruck, FaHeadset, FaLeaf } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-800">
            {/* Top Value Banner */}
            <div className="gradient-emerald py-10 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
                        <div className="flex items-center space-x-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                                <FaTruck />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Express 2-Hour Delivery</h4>
                                <p className="text-xs text-emerald-100">Free delivery on orders over ₹499</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                                <FaLeaf />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">100% Organic & Fresh</h4>
                                <p className="text-xs text-emerald-100">Directly sourced from verified farms</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">100% Safe Payments</h4>
                                <p className="text-xs text-emerald-100">Encrypted UPI, Cards & Netbanking</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                                <FaHeadset />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">24/7 Dedicated Support</h4>
                                <p className="text-xs text-emerald-100">Call +91 8547246183 anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    {/* Brand Info Column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center space-x-2">
                            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center text-white font-bold">
                                <FaLeaf />
                            </div>
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                dichoos<span className="text-emerald-500">.</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                            Dichoos is your trusted neighborhood online grocery store committed to delivering farm-fresh vegetables, organic fruits, daily essentials, and brand products straight to your kitchen.
                        </p>
                        <div className="flex space-x-3 pt-2">
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition">
                                <FaFacebookF size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition">
                                <FaTwitter size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition">
                                <FaInstagram size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition">
                                <FaLinkedinIn size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-4">Quick Links</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link href="/" className="hover:text-emerald-400 transition">Home</Link></li>
                            <li><Link href="/products" className="hover:text-emerald-400 transition">Shop All Products</Link></li>
                            <li><Link href="/products?category=Vegetables" className="hover:text-emerald-400 transition">Fresh Vegetables</Link></li>
                            <li><Link href="/products?category=Fruits" className="hover:text-emerald-400 transition">Seasonal Fruits</Link></li>
                            <li><Link href="/products?category=Offer" className="hover:text-emerald-400 transition">Special Deals</Link></li>
                            <li><Link href="/brands" className="hover:text-emerald-400 transition">Popular Brands</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-4">Customer Care</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link href="/profile" className="hover:text-emerald-400 transition">My Account & Orders</Link></li>
                            <li><Link href="/cart" className="hover:text-emerald-400 transition">Shopping Cart</Link></li>
                            <li><Link href="/wishlist" className="hover:text-emerald-400 transition">Saved Wishlist</Link></li>
                            <li><Link href="/about" className="hover:text-emerald-400 transition">About Dichoos</Link></li>
                            <li><Link href="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-emerald-400 transition">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Location Column */}
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-4">Contact Info</h3>
                        <ul className="space-y-3 text-xs text-slate-400">
                            <li className="flex items-start space-x-2.5">
                                <FaMapMarkerAlt className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>Dilsha Athirakam, Mundayad P.O., Kannur, Kerala - 670594</span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                                <FaPhoneAlt className="text-emerald-500 shrink-0" />
                                <span>+91 8547246183</span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                                <FaEnvelope className="text-emerald-500 shrink-0" />
                                <span>muhdsad@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Strip */}
            <div className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>&copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Dichoos Fresh Grocery. All rights reserved.</p>
                    <div className="flex items-center space-x-4 text-[10px] uppercase font-semibold text-slate-500">
                        <span>UPI Payment</span>
                        <span>•</span>
                        <span>Visa / Mastercard</span>
                        <span>•</span>
                        <span>Cash on Delivery</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
