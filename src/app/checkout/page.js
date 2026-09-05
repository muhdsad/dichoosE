"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaShieldAlt, FaTruck, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { getDirectDriveLink } from '../../utils/productUtils';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        zip: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (cart.length === 0 && !isSubmitted) {
            router.push('/cart');
        }

        const savedData = localStorage.getItem('dichoos-customer');
        if (savedData) {
            setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
        } else if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || ''
            }));
        }
    }, [cart, router, user, isSubmitted]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phone || formData.phone.length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city} - ${formData.zip}`;

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order: {
                        items: cart,
                        total: cartTotal,
                        date: new Date().toISOString(),
                        userId: user.uid
                    },
                    customer: {
                        ...formData,
                        address: fullAddress
                    }
                }),
            });

            if (!response.ok) throw new Error('Failed to submit order. Please try again.');

            const data = await response.json();
            setIsSubmitted(true);
            localStorage.setItem('dichoos-customer', JSON.stringify(formData));
            clearCart();
            router.push(`/checkout/success?orderId=${data.orderId}`);
        } catch (err) {
            setError(err.message || 'Something went wrong while placing your order.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user || (cart.length === 0 && !isSubmitted)) return null;

    const deliveryFee = cartTotal >= 499 ? 0 : 40;
    const finalTotal = cartTotal + deliveryFee;

    return (
        <div className="bg-slate-50 min-h-screen font-sans py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Express Checkout</h1>
                    <p className="text-xs text-slate-500 mt-1">Complete your delivery address and confirm your order.</p>
                </div>

                {error && (
                    <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                        <FaExclamationCircle className="text-base shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start max-w-6xl mx-auto">
                    {/* Left Column - Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                        {/* Section 1: Customer Info */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center">1</span>
                                <h2 className="text-base font-extrabold text-slate-900">Personal & Contact Details</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                                <div>
                                    <label className="block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block mb-1">Mobile Phone Number</label>
                                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                        <span className="inline-flex items-center px-3 bg-slate-200 text-slate-600 text-xs font-bold">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="flex-1 py-2.5 px-3 bg-transparent text-slate-900 text-xs focus:outline-none focus:bg-white"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Delivery Address */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center">2</span>
                                <h2 className="text-base font-extrabold text-slate-900">Delivery Location</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                                <div className="sm:col-span-2">
                                    <label className="block mb-1">House No / Apartment / Building</label>
                                    <input
                                        type="text"
                                        name="houseNo"
                                        required
                                        value={formData.houseNo}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="Flat 3B, Sunshine Apartments"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block mb-1">Street / Area / Colony</label>
                                    <input
                                        type="text"
                                        name="street"
                                        required
                                        value={formData.street}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="Mundayad Road, Athirakam"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="Near School / Bus Stand"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">City / Town</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="Kannur"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">PIN Code</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        required
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                        placeholder="670594"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Option */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
                            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center">3</span>
                                <h2 className="text-base font-extrabold text-slate-900">Payment Option</h2>
                            </div>

                            <div className="bg-emerald-50/80 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <FaMoneyBillWave className="text-emerald-600 text-xl shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-900">Cash on Delivery (COD)</h4>
                                        <p className="text-[11px] text-slate-500">Pay cash or UPI upon home delivery</p>
                                    </div>
                                </div>
                                <FaCheckCircle className="text-emerald-600 text-lg" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 gradient-emerald text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-500/30 hover:scale-102 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Confirming Order...' : `Place Order (₹${finalTotal.toFixed(0)})`}
                        </button>
                    </form>

                    {/* Right Column - Order Review */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft sticky top-28 space-y-6">
                            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                Order Items Summary ({cart.length})
                            </h3>

                            {/* Cart List */}
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 text-xs">
                                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            <Image src={getDirectDriveLink(item.image)} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 truncate">
                                            <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                                            <span className="text-slate-400 font-medium">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="font-extrabold text-slate-900">₹{(Number(item.price || 0) * item.quantity).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-slate-600">
                                    <span>Items Total</span>
                                    <span className="font-bold text-slate-900">₹{cartTotal.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Express Home Delivery</span>
                                    <span className="font-bold text-emerald-600">
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="text-sm font-extrabold text-slate-900">Amount Payable</span>
                                    <span className="text-2xl font-black text-slate-900">₹{finalTotal.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                    <FaTruck className="text-emerald-600" /> Express 2-Hour Delivery Slot
                                </span>
                                <p className="text-[10px] text-slate-500">Your order will be packed carefully & dispatched from our nearest store.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
