"use client";
import { useState, useEffect, useRef } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "orders", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching order: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    if (!order) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
                <Link href="/admin/orders" className="text-indigo-600 hover:underline mt-4 block">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Admin Header - Hidden when printing */}
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">
                        <FaArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaPrint className="mr-2" /> Print Invoice
                </button>
            </div>

            {/* Standard Admin View - Hidden when printing */}
            <div className="space-y-6 print:hidden">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Order #{order.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                        </p>
                        <div className="mt-2">
                            <span className={`py-1 px-3 rounded-full text-xs font-semibold capitalize
                                ${order.status === 'delivered' ? 'bg-green-200 text-green-800' :
                                    order.status === 'processed' ? 'bg-blue-200 text-blue-800' :
                                        'bg-yellow-200 text-yellow-800'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                    {/* ... (Existing details view) ... */}
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer?.name}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer?.email}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer?.phone}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {order.customer?.address}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <ul role="list" className="divide-y divide-gray-200">
                            {order.items?.map((item, index) => (
                                <li key={index} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-16 w-16 relative">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.quantity} x ₹{item.price}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                        <div className="text-lg font-bold text-gray-900">
                            Total: ₹{order.total?.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable Invoice Section - Only visible when printing */}
            <div className="hidden print:block bg-white p-8" ref={invoiceRef}>
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-lg text-gray-500 mt-2">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-indigo-600">Dichoos</h2>
                        <p className="text-sm text-gray-500">Dilsha, Athirakam</p>
                        <p className="text-sm text-gray-500">Mundayad p.o, Kannur</p>
                        <p className="text-sm text-gray-500">Email: muhdsad@gmail.com</p>
                        <p className="text-sm text-gray-500">Phone: 8547246183</p>
                    </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-gray-600 uppercase text-xs font-semibold tracking-wider mb-2">Bill To:</h3>
                        <p className="font-bold text-gray-900">{order.customer.name}</p>
                        <p className="text-gray-600 text-sm">{order.customer.email}</p>
                        <p className="text-gray-600 text-sm">{order.customer.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-gray-600 uppercase text-xs font-semibold tracking-wider mb-2">Ship To:</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                            {order.customer.houseNo}, {order.customer.street}
                            <br />
                            {order.customer.landmark ? `${order.customer.landmark}, ` : ''}{order.customer.city}
                            <br />
                            {order.customer.zip}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                    <h3 className="text-gray-600 uppercase text-xs font-semibold tracking-wider mb-4">Order Details</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{item.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-end">
                        <div className="w-full sm:w-1/2 lg:w-1/3">
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">₹{order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-indigo-600">₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
                    <p>Thank you for shopping with Dichoos!</p>
                    <p className="mt-1">For any queries, please contact us at muhdsad@gmail.com</p>
                </div>
            </div>
        </div>
    );
}
