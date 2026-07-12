"use client";
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaWhatsapp, FaSpinner } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) {
                    throw new Error('Failed to load order details');
                }
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="bg-white py-12 px-6 shadow-xl rounded-2xl text-center flex flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-green-500 text-5xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Loading Order Details...</h3>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="bg-white py-12 px-6 shadow-xl rounded-2xl text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4 font-sans">Something went wrong</h2>
                <p className="text-gray-600 mb-8">
                    We placed your order, but could not load the details on this screen.
                    {orderId && <span className="block mt-2 font-medium">Order ID: #{orderId}</span>}
                </p>
                <Link href="/products" className="inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // Format WhatsApp message
    const adminPhone = '918547246183';
    const itemsText = order.items
        ?.map(item => `• ${item.name} (x${item.quantity}) - ₹${Number(item.price * item.quantity || 0).toFixed(2)}`)
        .join('\n') || '';

    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN');

    const whatsappMessage = `*New Order Confirmation - Dichoos* 🛍️

*Order ID:* #${order.id}
*Date:* ${orderDate}

👤 *Customer Details:*
- *Name:* ${order.customer?.name || 'N/A'}
- *Phone:* +91 ${order.customer?.phone || 'N/A'}
- *Email:* ${order.customer?.email || 'N/A'}

📍 *Delivery Address:*
${order.customer?.address || 'N/A'}

📦 *Items ordered:*
${itemsText}

💰 *Total Amount:* ₹${Number(order.total || 0).toFixed(2)} (Cash on Delivery)

Thank you for shopping with us!`;

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="bg-white py-10 px-6 sm:px-10 shadow-2xl rounded-3xl text-center border border-gray-100 max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <FaCheckCircle className="text-green-500 text-7xl animate-bounce" />
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans tracking-tight">Order Placed Successfully!</h2>
            <p className="text-gray-500 mb-6 text-sm">
                Thank you for your purchase. We have received your order and are preparing it.
            </p>

            {/* Order Card Info */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-200 shadow-inner">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Summary</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2.5 py-1 rounded">#{order.id.slice(0, 8)}...</span>
                </div>
                
                <div className="space-y-2.5 mb-4 max-h-40 overflow-y-auto pr-1">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-medium">
                                {item.name} <span className="text-xs text-gray-400 font-normal">x{item.quantity}</span>
                            </span>
                            <span className="text-gray-950 font-semibold">₹{Number(item.price * item.quantity || 0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-3 mb-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Total Amount</span>
                    <span className="text-lg font-black text-green-600">₹{Number(order.total || 0).toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
                    <p className="font-bold text-gray-700 mb-1">Delivery Address:</p>
                    <p className="leading-relaxed">{order.customer?.name} • {order.customer?.phone}</p>
                    <p className="leading-relaxed mt-0.5">{order.customer?.address}</p>
                </div>
            </div>

            {/* WhatsApp Confirmation Section */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 text-center shadow-sm">
                <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center justify-center gap-1.5">
                    <FaWhatsapp className="text-green-500 text-lg animate-pulse" /> Confirm Your Order via WhatsApp
                </h4>
                <p className="text-xs text-green-700 mb-4 leading-relaxed">
                    To expedite your delivery, please click the button below to send your order details directly to our WhatsApp support team.
                </p>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 active:scale-98 transform transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                >
                    <FaWhatsapp size={18} />
                    Confirm Order on WhatsApp
                </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/profile/orders"
                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    View My Orders
                </Link>
                <Link
                    href="/products"
                    className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <Suspense fallback={<div>Loading...</div>}>
                    <CheckoutSuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
