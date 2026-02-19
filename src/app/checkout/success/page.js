"use client";
import { Suspense } from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="flex justify-center mb-6">
                <FaCheckCircle className="text-green-500 text-6xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-8">
                Thank you for your purchase. We have received your order and are processing it.
                {orderId && <span className="block mt-2 font-medium">Order ID: #{orderId}</span>}
            </p>

            <Link href="/products" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Continue Shopping
            </Link>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <CheckoutSuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
