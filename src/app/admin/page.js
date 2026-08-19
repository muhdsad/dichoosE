"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave, FaStore, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { categories } from '../../utils/categories';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { name: 'Total Sales', value: '₹0', icon: FaMoneyBillWave, color: 'bg-green-500' },
        { name: 'Total Orders', value: '0', icon: FaShoppingBag, color: 'bg-blue-500' },
        { name: 'Total Products', value: '...', icon: FaBox, color: 'bg-orange-500' },
        { name: 'Total Users', value: '...', icon: FaUsers, color: 'bg-purple-500' },
    ]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allOrders, setAllOrders] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [productsList, setProductsList] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    // 1. Fetch Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Products
                const productsSnapshot = await getDocs(collection(db, "products"));
                setTotalProducts(productsSnapshot.size);

                const products = [];
                productsSnapshot.forEach(doc => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                setProductsList(products);

                // Fetch Orders
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const uniqueCustomers = new Set();
                const formattedOrders = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();

                    if (data.customer?.email) {
                        uniqueCustomers.add(data.customer.email);
                    }

                    formattedOrders.push({
                        id: doc.id,
                        rawTotal: Number(data.total) || 0,
                        status: data.status || 'Pending',
                        createdAt: data.createdAt, // Keep raw date for filtering
                        items: data.items || [],
                        customer: data.customer?.name || 'Guest',
                        amount: `₹${(Number(data.total) || 0).toFixed(2)}`,
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'
                    });
                });

                setTotalUsers(uniqueCustomers.size);
                setAllOrders(formattedOrders);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 2. Filter Data & Update Stats
    useEffect(() => {
        let filteredOrders = allOrders;

        // Date Filter
        if (startDate) {
            const start = new Date(startDate);
            filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) <= end);
        }

        // Category Filter
        if (selectedCategory) {
            filteredOrders = filteredOrders.filter(order =>
                order.items.some(item => {
                    // Special logic for Offer category: ignore if expired
                    if (selectedCategory === 'Offer' && item.offerEnd && new Date(item.offerEnd) < new Date()) {
                        return false;
                    }
                    return (item.categories && item.categories.includes(selectedCategory)) ||
                        item.category === selectedCategory;
                })
            );
        }

        // Product Filter
        if (selectedProduct) {
            filteredOrders = filteredOrders.filter(order =>
                order.items.some(item => item.name === selectedProduct)
            );
        }

        let totalSales = 0;
        let totalOrdersCount = 0;

        filteredOrders.forEach(order => {
            // Exclude cancelled orders from total sales
            if (order.status && order.status.toLowerCase() !== 'cancelled') {

                // If filtering by category or product, calculate partial total
                if (selectedCategory || selectedProduct) {
                    let orderPartialTotal = 0;
                    order.items.forEach(item => {
                        const matchesCategory = selectedCategory
                            ? (item.categories && item.categories.includes(selectedCategory)) || item.category === selectedCategory
                            : true;
                        const matchesProduct = selectedProduct ? item.name === selectedProduct : true;

                        if (matchesCategory && matchesProduct) {
                            orderPartialTotal += (Number(item.price) * Number(item.quantity));
                        }
                    });
                    totalSales += orderPartialTotal;
                } else {
                    // No deep filters, use full order total
                    totalSales += order.rawTotal;
                }
            }
            totalOrdersCount += 1;
        });

        // Update Stats
        setStats(prevStats => prevStats.map(stat => {
            if (stat.name === 'Total Sales') return { ...stat, value: `₹${totalSales.toFixed(2)}` };
            if (stat.name === 'Total Orders') return { ...stat, value: totalOrdersCount.toString() };
            if (stat.name === 'Total Products') return { ...stat, value: totalProducts.toString() };
            if (stat.name === 'Total Users') return { ...stat, value: totalUsers.toString() };
            return stat;
        }));

        setRecentOrders(filteredOrders);

    }, [allOrders, startDate, endDate, selectedCategory, selectedProduct, totalProducts, totalUsers]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Inputs */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700 w-20">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700 w-20">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="category" className="text-sm font-medium text-gray-700 w-20">Category:</label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Dropdown */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="product" className="text-sm font-medium text-gray-700 w-20">Product:</label>
                        <select
                            id="product"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                        >
                            <option value="">All Products</option>
                            {productsList.map((prod) => (
                                <option key={prod.id} value={prod.name}>{prod.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-md p-6 flex items-center">
                        <div className={`p-4 rounded-full text-white ${stat.color} mr-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity (Orders) */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase leading-normal">
                                    <th className="py-3 px-6">Order ID</th>
                                    <th className="py-3 px-6">Customer</th>
                                    <th className="py-3 px-6">Date</th>
                                    <th className="py-3 px-6">Amount</th>
                                    <th className="py-3 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-3 px-6 font-medium text-xs break-all max-w-[100px]">{order.id}</td>
                                            <td className="py-3 px-6">{order.customer}</td>
                                            <td className="py-3 px-6">{order.date}</td>
                                            <td className="py-3 px-6 font-bold">{order.amount}</td>
                                            <td className="py-3 px-6">
                                                <span className={`py-1 px-3 rounded-full text-xs ${order.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                                                    order.status === 'pending' || order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-blue-200 text-blue-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-gray-500">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Store Details Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                        <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                            <FaStore className="mr-2" /> Store Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600 mt-1">
                                <FaEnvelope />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-800 break-all">muhdsad@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600 mt-1">
                                <FaPhone />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-800">8547246183</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600 mt-1">
                                <FaMapMarkerAlt />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-gray-800">Dilsha, Athirakam</p>
                                <p className="font-medium text-gray-800">Mundayad p.o, Kannur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
