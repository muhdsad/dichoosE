"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowRight, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { getDirectDriveLink } from '../../utils/productUtils';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const freeShippingThreshold = 499;
    const isFreeShipping = cartTotal >= freeShippingThreshold;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

    if (cart.length === 0) {
        return (
            <div className="bg-slate-50 min-h-[70vh] py-16 px-4 flex flex-col items-center justify-center font-sans">
                <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-soft max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                        <FaShoppingCart />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Your Shopping Cart is Empty</h1>
                    <p className="text-xs text-slate-500 mt-2 mb-6">Looks like you haven't added any farm fresh produce to your cart yet.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 gradient-emerald text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition"
                    >
                        <span>Start Grocery Shopping</span>
                        <FaArrowRight className="text-xs" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cart Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Shopping Cart <span className="text-sm font-semibold text-slate-500">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">Review your fresh items before proceeding to checkout.</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 underline self-start sm:self-auto"
                    >
                        Empty Entire Cart
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Free Shipping Progress Indicator */}
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <FaTruck className="text-emerald-600 text-lg shrink-0" />
                                <div className="text-xs text-emerald-950 font-semibold">
                                    {isFreeShipping ? (
                                        <span>🎉 You unlocked <strong className="text-emerald-700">FREE Express Delivery!</strong></span>
                                    ) : (
                                        <span>Add <strong className="text-emerald-700">₹{remainingForFreeShipping.toFixed(0)}</strong> more for FREE Express Delivery!</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items Loop */}
                        <ul className="space-y-4">
                            {cart.map((product) => (
                                <li key={product.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4 transition hover:border-emerald-500/30">
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <Image
                                            src={getDirectDriveLink(product.image)}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${product.id}`} className="block">
                                            <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition truncate">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            Unit Price: ₹{Number(product.price || 0).toFixed(0)}
                                        </p>
                                        <div className="mt-2 text-sm font-extrabold text-slate-900">
                                            Subtotal: ₹{(Number(product.price || 0) * product.quantity).toFixed(0)}
                                        </div>
                                    </div>

                                    {/* Quantity & Delete Controls */}
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <button
                                            onClick={() => removeFromCart(product.id)}
                                            className="text-slate-400 hover:text-red-500 transition p-1"
                                            title="Remove item"
                                        >
                                            <FaTrash size={14} />
                                        </button>

                                        <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                                            <button
                                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                className="w-6 h-6 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition"
                                                disabled={product.quantity <= 1}
                                            >
                                                <FaMinus size={9} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-slate-900">
                                                {product.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                className="w-6 h-6 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition"
                                            >
                                                <FaPlus size={9} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Order Summary Sticky Card */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft sticky top-28 space-y-6">
                            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">₹{Number(cartTotal || 0).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Estimated Delivery</span>
                                    <span className="font-bold text-emerald-600">
                                        {isFreeShipping ? 'FREE' : '₹40'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Taxes & Handling</span>
                                    <span className="font-bold text-emerald-600">Included</span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="text-sm font-extrabold text-slate-900">Grand Total</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        ₹{(Number(cartTotal || 0) + (isFreeShipping ? 0 : 40)).toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full py-4 gradient-emerald text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-500/30 hover:scale-102 transition flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <FaArrowRight className="text-xs" />
                            </Link>

                            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                                <FaShieldAlt className="text-emerald-500" />
                                <span>Guaranteed Safe & Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
