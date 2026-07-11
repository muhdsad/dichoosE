"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const ordersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const orderRef = doc(db, "orders", id);
            await updateDoc(orderRef, {
                status: newStatus
            });
            // Update local state
            setOrders(orders.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Error updating status: ", error);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Orders</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase leading-normal">
                                <th className="py-3 px-6">Order ID</th>
                                <th className="py-3 px-6">Date</th>
                                <th className="py-3 px-6">Customer</th>
                                <th className="py-3 px-6">Total</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 font-medium text-xs">{order.id}</td>
                                        <td className="py-3 px-6">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{order.customer?.name}</span>
                                                <span className="text-xs">{order.customer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 font-bold">₹{Number(order.total || 0).toFixed(2)}</td>
                                        <td className="py-3 px-6">
                                            <span className={`py-1 px-3 rounded-full text-xs font-semibold capitalize
                                                ${order.status === 'delivered' ? 'bg-green-200 text-green-800' :
                                                    order.status === 'processed' ? 'bg-blue-200 text-blue-800' :
                                                        'bg-yellow-200 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processed">Processed</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <a
                                                    href={`/admin/orders/${order.id}`}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
