"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminEmails } from '../../utils/admins';
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Allow access to login page without checks
        if (pathname === '/admin/login') {
            setIsAuthorized(true);
            return;
        }

        if (!user) {
            router.push('/admin/login');
        } else if (!adminEmails.includes(user.email)) {
            // User logged in but not an admin
            // Optional: redirect to home or show specific unauthorized page
            router.push('/admin/login');
        } else {
            setIsAuthorized(true);
        }
    }, [user, loading, pathname, router]);


    // Show loading state while checking auth (except for login page)
    if (loading || (!isAuthorized && pathname !== '/admin/login')) {
        return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;
    }

    // Login Page Layout (Simplified, no sidebar)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Protected Admin Layout
    return (
        <div className="flex min-h-screen bg-gray-100 font-sans print:bg-white">
            <div className="print:hidden">
                <AdminSidebar />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
                {/* Top Header for Admin could go here if needed */}
                <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center md:hidden print:hidden">
                    <span className="font-bold text-gray-700">Admin Panel</span>
                    {/* Mobile menu toggle would go here */}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 print:p-0 print:bg-white print:overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
