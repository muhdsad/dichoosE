"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getDirectDriveLink } from '../../utils/productUtils';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    <section className="lg:col-span-7">
                        <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                            {cart.map((product) => (
                                <li key={product.id} className="flex py-6 sm:py-10">
                                    <div className="flex-shrink-0">
                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden bg-gray-100">
                                            <Image
                                                src={getDirectDriveLink(product.image)}
                                                alt={product.name}
                                                fill
                                                className="object-cover object-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-sm">
                                                        <Link href={`/products/${product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                            {product.name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">₹{Number(product.price || 0).toFixed(2)}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                                                        disabled={product.quantity <= 1}
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <span className="text-gray-700 font-medium">{product.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>

                                                <div className="absolute top-0 right-0">
                                                    <button
                                                        onClick={() => removeFromCart(product.id)}
                                                        className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <FaTrash size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order Summary */}
                    <section className="lg:col-span-5 mt-16 lg:mt-0 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-gray-900">Order Total</dt>
                                <dd className="text-base font-medium text-gray-900">₹{Number(cartTotal || 0).toFixed(2)}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <Link href="/checkout" className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex justify-center">
                                Proceed to Checkout
                            </Link>
                        </div>
                        <div className="mt-4 flex justify-center text-sm text-center text-gray-500">
                            <p>
                                or{' '}
                                <Link href="/products" className="text-indigo-600 font-medium hover:text-indigo-500">
                                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
