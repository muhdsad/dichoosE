import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer>
            {/* Green CTA Bar */}
            <div className="bg-primary py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white">Get Fresh Products Delivered!</h3>
                        <p className="text-green-100">Order now and get it at your doorstep.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/products" className="bg-white text-primary px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                            SHOP NOW
                        </Link>
                        <div className="flex space-x-3 text-white">
                            <a href="#" className="hover:text-green-200 transition"><FaFacebook size={24} /></a>
                            <a href="#" className="hover:text-green-200 transition"><FaTwitter size={24} /></a>
                            <a href="#" className="hover:text-green-200 transition"><FaInstagram size={24} /></a>
                            <a href="#" className="hover:text-green-200 transition"><FaLinkedin size={24} /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="bg-white pt-12 pb-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <FaMapMarkerAlt className="text-primary mt-1 mr-2" />
                                    <span>Dilsha Athirakam Mundayad-P-O,<br />Kannur, Kerala - 670594</span>
                                </li>
                                <li className="flex items-center">
                                    <FaPhone className="text-primary mr-2" />
                                    <span>+91 8547246183</span>
                                </li>
                                <li className="flex items-center">
                                    <FaEnvelope className="text-primary mr-2" />
                                    <span>muhdsad@gmail.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Information Links */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Information</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-600 hover:text-primary transition">About Us</Link></li>
                                <li><Link href="/contact" className="text-gray-600 hover:text-primary transition">Contact Us</Link></li>
                                <li><Link href="/privacy" className="text-gray-600 hover:text-primary transition">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-600 hover:text-primary transition">Terms & Conditions</Link></li>
                                <li><Link href="/faq" className="text-gray-600 hover:text-primary transition">FAQ</Link></li>
                            </ul>
                        </div>

                        {/* My Account */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">My Account</h3>
                            <ul className="space-y-2">
                                <li><Link href="/login" className="text-gray-600 hover:text-primary transition">Sign In</Link></li>
                                <li><Link href="/cart" className="text-gray-600 hover:text-primary transition">View Cart</Link></li>
                                <li><Link href="/wishlist" className="text-gray-600 hover:text-primary transition">My Wishlist</Link></li>
                                <li><Link href="/orders" className="text-gray-600 hover:text-primary transition">Track My Order</Link></li>
                                <li><Link href="/help" className="text-gray-600 hover:text-primary transition">Help Ticket</Link></li>
                            </ul>
                        </div>

                        {/* Download App */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Download App</h3>
                            <p className="text-gray-600 mb-4 text-sm">Save more with our app! details coming soon.</p>
                            <div className="flex flex-col space-y-2">
                                <button className="bg-gray-900 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-gray-800 transition">
                                    {/* Placeholder for App Store */}
                                    <span className="text-sm font-semibold">App Store</span>
                                </button>
                                <button className="bg-gray-900 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-gray-800 transition">
                                    {/* Placeholder for Play Store */}
                                    <span className="text-sm font-semibold">Google Play</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-6 text-center text-gray-500 text-sm">
                    &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Dichoos. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
