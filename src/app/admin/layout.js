"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminEmails } from '../../utils/admins';
import AdminSidebar, { navItems } from "../../components/AdminSidebar";
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaSignOutAlt } from 'react-icons/fa';

export default function AdminLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Allow access to login page without checks
        if (pathname === '/admin/login') {
            setIsAuthorized(true);
            return;
        }

        if (!user) {
            router.push('/admin/login');
        } else if (!adminEmails.includes(user.email.toLowerCase())) {
            // User logged in but not an admin
            // Optional: redirect to home or show specific unauthorized page
            router.push('/admin/login');
        } else {
            setIsAuthorized(true);
        }
    }, [user, loading, pathname, router]);

    // Find active nav item for the mobile header title (handles nested routes like edit/[id])
    const currentNavItem = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/admin') 
        || navItems.find(item => item.href === '/admin') 
        || navItems[0];

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
            {/* Dropdown navigation is used for all screen sizes (desktop, tablet, mobile) */}
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
                {/* Header for All Screen Sizes */}
                <header className="bg-white shadow-sm z-30 p-4 flex justify-between items-center print:hidden relative border-b border-gray-200">
                    <span className="font-bold text-gray-800 text-base">Admin Panel</span>
                    
                    {/* Mobile Menu Dropdown Button */}
                    <div className="relative">
                        <button 
                             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-sm"
                        >
                            {currentNavItem && <currentNavItem.icon className="text-primary text-sm" />}
                            <span>{currentNavItem ? currentNavItem.name : 'Menu'}</span>
                            {isMobileMenuOpen ? <FaChevronUp className="text-gray-400 text-[10px]" /> : <FaChevronDown className="text-gray-400 text-[10px]" />}
                        </button>

                        {/* Mobile Menu Items Overlay */}
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 divide-y divide-gray-150">
                                <div className="py-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center px-4 py-2.5 text-xs font-bold transition-colors ${
                                                    isActive 
                                                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                                                    : 'text-gray-600 hover:bg-gray-55'
                                                }`}
                                            >
                                                <item.icon className={`mr-2.5 text-base ${isActive ? 'text-primary' : 'text-gray-450'}`} />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <div className="pt-1 px-2">
                                    <button 
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <FaSignOutAlt className="mr-2.5 text-base text-red-500" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 xl:p-6 print:p-0 print:bg-white print:overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
