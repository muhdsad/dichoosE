"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';

export default function PrintOffersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOfferProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const allProducts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const now = new Date();

                // Filter logic:
                // 1. Must have offerPrice
                // 2. Offer must not be expired (if dates are set)
                const activeOffers = allProducts.filter(product => {
                    const hasOfferPrice = product.offerPrice && parseFloat(product.offerPrice) > 0;
                    if (!hasOfferPrice) return false;

                    const offerStart = product.offerStart ? new Date(product.offerStart) : null;
                    const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

                    const isStarted = !offerStart || now >= offerStart;
                    const isEnded = offerEnd && now > offerEnd;

                    return isStarted && !isEnded;
                });

                setProducts(activeOffers);
            } catch (error) {
                console.error("Error fetching offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferProducts();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Offers...</div>;

    if (products.length === 0) return <div className="text-center p-10">No active offers found to print.</div>;

    return (
        <div className="bg-white min-h-screen text-black">
            {/* Print Instructions - Hidden when printing */}
            <div className="print:hidden p-4 bg-blue-50 border-b border-blue-200 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-blue-800">Offer Price List</h1>
                    <p className="text-sm text-blue-600">Press <strong>Ctrl + P</strong> (or Cmd + P) to print or save as PDF.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md"
                >
                    Print / Save as PDF
                </button>
            </div>

            {/* A4 Container */}
            <div className="max-w-[210mm] mx-auto p-4 print:p-0 print:max-w-none">
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-4xl font-black text-primary uppercase tracking-wider">Offer Price List</h1>
                    <div className="h-1 w-32 bg-primary mx-auto mt-2"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="border-4 border-black p-4 flex flex-col items-center justify-center text-center h-[240px] page-break-inside-avoid relative"
                            style={{
                                // Force page break after every 12th item (4 rows x 3 cols)
                                breakAfter: (index + 1) % 12 === 0 ? 'page' : 'auto'
                            }}
                        >
                            <div className="relative w-32 h-32 mb-2">
                                <img
                                    src={getDirectDriveLink(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                />
                                {/* MRP Top Left Overlay */}
                                <span className="absolute top-0 left-0 bg-white bg-opacity-90 px-1 rounded text-xs font-bold text-gray-500 line-through border border-gray-200 shadow-sm">
                                    MRP: ₹{product.mrp || product.price}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold leading-tight mb-2 line-clamp-2 h-12 overflow-hidden flex items-center justify-center">
                                {product.name}
                            </h2>
                            <div className="mt-auto">
                                <p className="text-4xl font-extrabold text-black tracking-tight">
                                    ₹{product.offerPrice}
                                </p>
                            </div>

                            {/* Optional: Add unit if needed */}
                            {product.unit && <span className="absolute top-2 right-2 text-xs bg-gray-100 px-1 rounded">{product.unit}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        background: white;
                    }
                    /* Ensure grid layout holds in print */
                    .grid {
                        display: grid !important;
                    }
                }
            `}</style>
        </div>
    );
}
