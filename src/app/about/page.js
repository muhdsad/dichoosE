import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-green-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Dichoos</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Delivering the freshest organic produce directly from local farms to your kitchen table.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                            {/* Placeholder for About Image - using a color block or generic image if available */}
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                                <span className="text-lg">Farm Image Placeholder</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                At Dichoos, we believe that everyone deserves access to healthy, chemical-free food.
                                Our mission is to bridge the gap between sustainable farmers and health-conscious consumers.
                            </p>
                            <h2 className="text-3xl font-bold text-gray-900 pt-4">Why Choose Us?</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="text-green-500 font-bold mr-2">✓</span>
                                    <span className="text-gray-700">100% Organic & Fresh</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 font-bold mr-2">✓</span>
                                    <span className="text-gray-700">Farm-to-Table Transparency</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 font-bold mr-2">✓</span>
                                    <span className="text-gray-700">Support Local Farmers</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
