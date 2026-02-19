"use client";

import React from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        We'd love to hear from you. Here's how you can reach us.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Email Card */}
                    <Link href="mailto:muhdsad@gmail.com" className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 md:col-span-1 group">
                        <div className="p-8 text-center flex flex-col items-center h-full justify-center">
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                                <FaEnvelope className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 break-all">muhdsad@gmail.com</p>
                            <span className="mt-4 text-sm text-blue-600 font-medium group-hover:underline">Send an email &rarr;</span>
                        </div>
                    </Link>

                    {/* Phone Card */}
                    <Link href="tel:8547246183" className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 md:col-span-1 group">
                        <div className="p-8 text-center flex flex-col items-center h-full justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
                                <FaPhoneAlt className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600">8547246183</p>
                            <span className="mt-4 text-sm text-green-600 font-medium group-hover:underline">Call now &rarr;</span>
                        </div>
                    </Link>

                    {/* Location Card */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 md:col-span-1 group flex flex-col">
                        <div className="p-8 text-center flex flex-col items-center h-full justify-center">
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors duration-300">
                                <FaMapMarkerAlt className="h-10 w-10 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
                            <p className="text-gray-600">Dilsha, Athirakam</p>
                            <p className="text-gray-600">Mundayad p.o, Kannur</p>
                        </div>
                    </div>
                </div>

                {/* Optional: Add a map embed or more details if needed below */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 h-96 w-full">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3904.426249457868!2d75.396!3d11.874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDUyJzI2LjQiTiA3NcKwMjMnNDUuNiJF!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Google Maps Location"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}
