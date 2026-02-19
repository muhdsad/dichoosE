"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchOrders(user.uid);
        }
    }, [user, authLoading, router]);

    const fetchOrders = async (userId) => {
        try {
            // Simplified query: No compound index needed (userId + createdAt)
            const q = query(
                collection(db, "orders"),
                where("userId", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const userOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort by date (newest first)
            userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(userOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    if (!user) return null; // Redirecting...

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">My Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

                {orders.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                        <p>You haven't placed any orders yet.</p>
                        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
                            Start Shopping &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order Placed</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total</p>
                                        <p className="text-sm font-bold text-gray-900">₹{order.total?.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order #</p>
                                        <p className="text-sm font-bold text-gray-900">{order.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                        <Link href={`/profile/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50 transition">
                                            View Details
                                        </Link>
                                    </div>
                                    <ul className="divide-y divide-gray-200">
                                        {order.items.slice(0, 2).map((item, index) => (
                                            <li key={index} className="py-2 flex justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                                                    <span className="ml-2 text-sm text-gray-500">x {item.quantity}</span>
                                                </div>
                                                <span className="text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        {order.items.length > 2 && (
                                            <li className="py-2 text-sm text-gray-500 italic">
                                                + {order.items.length - 2} more items...
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
