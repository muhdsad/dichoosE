"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { FaBoxOpen } from 'react-icons/fa';

export default function TrackOrderPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Check if user is trying to redirect to a specific order, otherwise go to profile
            router.push('/profile');
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // If not logged in, show prompt
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
                    <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                        <FaBoxOpen className="text-blue-600 text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                    <p className="text-gray-600 mb-8">
                        Please log in to view your order history and track current shipments.
                    </p>
                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="block w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                        >
                            Log In to Track
                        </Link>
                        <Link
                            href="/signup"
                            className="block w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null; // Will redirect
}
