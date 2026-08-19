"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaBox, FaShoppingBag, FaSignOutAlt, FaTachometerAlt, FaPrint, FaUpload, FaPlusCircle, FaListUl } from 'react-icons/fa';

export const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Products', href: '/admin/products', icon: FaBox },
    { name: 'Manage Categories', href: '/admin/categories', icon: FaListUl },
    { name: 'Orders', href: '/admin/orders', icon: FaShoppingBag },
    { name: 'Print Offers', href: '/admin/print-offers', icon: FaPrint },
    { name: 'Bulk Edit (Offers/Cats)', href: '/admin/bulk-offers', icon: FaUpload },
    { name: 'Add Products (Bulk)', href: '/admin/bulk-products', icon: FaPlusCircle },
    { name: 'Back to Store', href: '/', icon: FaHome },
];

const AdminSidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
            <div className="h-20 flex items-center justify-center border-b border-gray-800">
                <h1 className="text-2xl font-bold text-primary">Dichoos Admin</h1>
            </div>

            <nav className="flex-1 py-6">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${isActive ? 'bg-gray-800 text-white border-l-4 border-primary' : ''
                                        }`}
                                >
                                    <item.icon className={`mr-3 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600 rounded transition-colors cursor-pointer"
                >
                    <FaSignOutAlt className="mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
