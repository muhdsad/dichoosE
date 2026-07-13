"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';

export default function PrintOffersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState('landscape'); // 'portrait' | 'landscape'
    const [saving, setSaving] = useState(false);

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

    const handleSaveCardAsPng = async (productId, productName) => {
        setSaving(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const element = document.getElementById(`offer-card-${productId}`);
            if (!element) {
                alert("Error: Card element not found.");
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 3, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-offer.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error saving card as PNG:", error);
            alert("Failed to save card as PNG. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAllAsPng = async () => {
        setSaving(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const element = document.getElementById('print-offers-container');
            if (!element) {
                alert("Error: Print container not found.");
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2, // 2x scale for sheet is perfect
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `offers-sheet-${layout}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error saving sheet as PNG:", error);
            alert("Failed to save sheet as PNG. Please try again.");
        } finally {
            setSaving(false);
        }
    };

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
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setLayout('portrait')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all shadow-md cursor-pointer ${layout === 'portrait' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        3x6 Portrait (18 Tags)
                    </button>
                    <button
                        onClick={() => setLayout('landscape')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all shadow-md cursor-pointer ${layout === 'landscape' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        4x4 Landscape (16 Tags)
                    </button>
                    <button
                        onClick={handleSaveAllAsPng}
                        disabled={saving}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Sheet as PNG'}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md cursor-pointer"
                    >
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* A4 Container */}
            <div id="print-offers-container" className={`mx-auto print:p-0 print:max-w-none ${layout === 'landscape' ? 'max-w-[297mm] p-2' : 'max-w-[210mm] p-2'}`}>
                <div className={`grid gap-0 print:gap-0 border-t-[1.5px] border-l-[1.5px] border-black ${layout === 'landscape' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {products.map((product, index) => {
                        const itemsPerPage = layout === 'landscape' ? 16 : 18;
                        const savingsVal = parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0);
                        const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                        const hasSavings = savings > 0;
                        const cardHeight = layout === 'landscape' ? '52.5mm' : '49.5mm';

                        return (
                            <div
                                key={product.id}
                                id={`offer-card-${product.id}`}
                                className="border-r-[1.5px] border-b-[1.5px] border-black p-1 flex flex-col items-center justify-between text-center page-break-inside-avoid relative overflow-hidden bg-white group"
                                style={{
                                    height: cardHeight,
                                    breakAfter: (index + 1) % itemsPerPage === 0 ? 'page' : 'auto'
                                }}
                            >
                                {/* MRP Badge */}
                                {(product.mrp || product.price) && (
                                    <div className="absolute top-[3px] left-[3px] z-[3] bg-[#ffff00] text-black border border-black px-[4px] py-[2px] text-[10px] sm:text-[11px] font-bold uppercase line-through leading-none tracking-wide">
                                        MRP {product.mrp || product.price}
                                    </div>
                                )}
                                
                                {/* Save Badge */}
                                {hasSavings && (
                                    <div className="absolute top-[3px] right-[3px] z-[3] bg-[#ff0000] text-white border border-[#ff0000] px-[4px] py-[2px] text-[10px] sm:text-[11px] font-bold uppercase leading-none tracking-wide">
                                        SMILE SAVE ₹{savings}
                                    </div>
                                )}

                                {/* Image Wrapper */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] z-[1]">
                                    <img
                                        src={getDirectDriveLink(product.image)}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>

                                {/* Details Wrapper */}
                                <div className="w-full h-full flex flex-col items-center justify-between z-[2] relative">
                                    <h2 className="font-anton text-[28px] sm:text-[34px] md:text-[36px] leading-[1.2] uppercase text-black w-full pt-4 px-1"
                                        style={{ WebkitTextStroke: '1px white', textShadow: '0 0 3px white, 0 0 3px white' }}>
                                        {product.name}
                                    </h2>
                                    
                                    <div className="flex items-baseline justify-center w-full mt-auto mb-[-4px]">
                                        <span className="font-anton text-[48px] sm:text-[58px] md:text-[68px] leading-none text-black tracking-tighter"
                                              style={{ WebkitTextStroke: '1.5px white', textShadow: '0 0 4px white, 0 0 4px white' }}>
                                            {product.offerPrice}
                                        </span>
                                        {product.unit && (
                                            <span className="font-anton text-[14px] sm:text-[16px] text-black ml-1 uppercase"
                                                  style={{ WebkitTextStroke: '0.5px white' }}>
                                                /{product.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Individual Save as PNG Button (Hidden during print, visible on hover) */}
                                <button
                                    data-html2canvas-ignore
                                    onClick={() => handleSaveCardAsPng(product.id, product.name)}
                                    disabled={saving}
                                    className="absolute bottom-2 right-2 z-10 bg-primary hover:bg-green-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer disabled:opacity-50"
                                >
                                    Save PNG
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: ${layout === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
                        margin: 0 !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Container takes full width, no padding or max-width constraint */
                    #print-offers-container {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Grid holds layout and spans full width */
                    .grid {
                        display: grid !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-top: 1.5px solid black !important;
                        border-left: 1.5px solid black !important;
                    }
                    /* Ensure page breaks are clean */
                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}
