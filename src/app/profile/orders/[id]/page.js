"use client";
import { useState, useEffect, use } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { getDirectDriveLink } from '../../../../utils/productUtils';
import Link from 'next/link';

export default function OrderDetailsPage({ params }) {
    // Unwrap params for Next.js 15+
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && id) {
            fetchOrder(id);
        }
    }, [user, authLoading, id, router]);

    const fetchOrder = async (orderId) => {
        try {
            const docRef = doc(db, "orders", orderId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const orderData = docSnap.data();

                // Security Check: Ensure this order belongs to the logged-in user
                if (orderData.userId !== user.uid) {
                    setError("You are not authorized to view this order.");
                    return;
                }

                setOrder({ id: docSnap.id, ...orderData });
            } else {
                setError("Order not found.");
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-red-600">
                <p className="text-xl font-bold mb-4">{error}</p>
                <Link href="/profile" className="text-indigo-600 hover:text-indigo-800">
                    &larr; Back to My Orders
                </Link>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Order Details</h1>
                        <p className="text-gray-400 text-sm">#{order.id}</p>
                    </div>
                    <Link href="/profile" className="text-gray-300 hover:text-white text-sm">
                        &larr; Back
                    </Link>
                </div>

                {/* Status Bar */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <p className="text-sm text-gray-500">Placed on</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize
                             ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    {/* Items */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
                    <ul className="divide-y divide-gray-200 mb-8 border border-gray-200 rounded-lg">
                        {order.items.map((item, index) => (
                            <li key={index} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    {/* Optional: Add Image here if available in item data */}
                                    {item.image && (
                                        <img src={getDirectDriveLink(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        ₹{item.price} x {item.quantity}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Order Summary & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Shipping Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                                <p className="font-bold">{order.customer?.name}</p>
                                <p>{order.customer?.email}</p>
                                <p className="mt-2">{order.customer?.houseNo}, {order.customer?.street}</p>
                                <p>{order.customer?.landmark}</p>
                                <p>{order.customer?.city} - {order.customer?.zip}</p>
                                <p className="mt-2 font-bold">Phone: {order.customer?.phone}</p>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between py-3 border-t border-gray-300 mt-2">
                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                    <span className="text-lg font-bold text-primary">₹{order.total.toFixed(2)}</span>
                                </div>
                                <div className="mt-2 text-center text-xs text-gray-500 bg-white p-2 border rounded">
                                    Payment Method: Cash on Delivery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
