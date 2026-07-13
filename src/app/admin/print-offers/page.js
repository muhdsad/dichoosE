"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';
import { FaImage, FaTrash, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

const getProxiedImageUrl = (url) => {
    if (!url) return '/categories/default.png';
    const directLink = getDirectDriveLink(url);
    if (!directLink) return '/categories/default.png';
    if (directLink.startsWith('/') || directLink.startsWith('data:')) {
        return directLink;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/proxy-image?url=${encodeURIComponent(directLink)}`;
};

export default function PrintOffersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState('landscape'); // 'portrait' | 'landscape' (used for sheet mode)
    const [saving, setSaving] = useState(false);

    // Poster Mode States
    const [printMode, setPrintMode] = useState('sheet'); // 'sheet' | 'poster'
    const [posterLayout, setPosterLayout] = useState('6'); // '4' | '6' | '8'
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [bannerImage, setBannerImage] = useState(null);
    const [posterTitle, setPosterTitle] = useState('SMILE HYPERMARKET');
    const [posterSubtitle, setPosterSubtitle] = useState('WEEKEND SPECIAL OFFERS');

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
                // 3. Name must not be empty
                const activeOffers = allProducts.filter(product => {
                    const hasValidName = product.name && product.name.trim() !== '';
                    if (!hasValidName) return false;

                    const hasOfferPrice = product.offerPrice && parseFloat(product.offerPrice) > 0;
                    if (!hasOfferPrice) return false;

                    const offerStart = product.offerStart ? new Date(product.offerStart) : null;
                    const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

                    const isStarted = !offerStart || now >= offerStart;
                    const isEnded = offerEnd && now > offerEnd;

                    return isStarted && !isEnded;
                });

                // Sort alphabetically
                activeOffers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                setProducts(activeOffers);

                // Auto select first items for poster mode
                if (activeOffers.length > 0) {
                    const initialIds = new Set(activeOffers.slice(0, 6).map(p => p.id));
                    setSelectedProductIds(initialIds);
                }
            } catch (error) {
                console.error("Error fetching offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferProducts();
    }, []);

    // Auto update selection when layout changes
    const handlePosterLayoutChange = (newLayout) => {
        setPosterLayout(newLayout);
        const count = parseInt(newLayout);
        if (products.length > 0) {
            const nextIds = new Set(products.slice(0, count).map(p => p.id));
            setSelectedProductIds(nextIds);
        }
    };

    const toggleProductSelection = (id) => {
        setSelectedProductIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                // Check if we exceed limit
                const limit = parseInt(posterLayout);
                if (next.size < limit) {
                    next.add(id);
                } else {
                    alert(`You can only select up to ${limit} products for this poster layout. Deselect another product first.`);
                }
            }
            return next;
        });
    };

    const autoSelectProducts = () => {
        const count = parseInt(posterLayout);
        const nextIds = new Set(products.slice(0, count).map(p => p.id));
        setSelectedProductIds(nextIds);
    };

    const clearProductSelection = () => {
        setSelectedProductIds(new Set());
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBannerImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                logging: true
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
                logging: true
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = printMode === 'poster' ? `offers-poster-${posterLayout}.png` : `offers-sheet-${layout}.png`;
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

    // Filter and pad products for Poster Mode
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const paddedProducts = [...selectedProducts];
    const totalRequired = parseInt(posterLayout);
    while (paddedProducts.length < totalRequired) {
        paddedProducts.push({
            id: `placeholder-${paddedProducts.length}`,
            isPlaceholder: true,
            name: 'Offer Slot',
            offerPrice: '0.00'
        });
    }

    // Grid details for Poster
    const posterCols = 2;
    const posterRows = totalRequired / 2;
    // Mathematically split remaining A4 height: A4 = 297mm. Banner = 57mm. Remaining = 240mm.
    const posterCardHeight = `${240 / posterRows}mm`;

    return (
        <div className="bg-white min-h-screen text-black">
            {/* Print Instructions - Hidden when printing */}
            <div className="print:hidden p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 mb-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Offer Printout Manager</h1>
                        <p className="text-sm text-blue-600">Select standard price tag sheets or a unified promotional poster with a banner.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPrintMode('sheet')}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer ${printMode === 'sheet' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                        >
                            Standard Tag Sheet
                        </button>
                        <button
                            onClick={() => setPrintMode('poster')}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer ${printMode === 'poster' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-700 border border-gray-300'}`}
                        >
                            Promotional Poster (A4)
                        </button>
                    </div>
                </div>

                {/* Configurations Panel depending on Mode */}
                {printMode === 'sheet' ? (
                    <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setLayout('portrait')}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'portrait' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300'}`}
                            >
                                3x6 Portrait (18 Tags)
                            </button>
                            <button
                                onClick={() => setLayout('landscape')}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'landscape' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300'}`}
                            >
                                4x4 Landscape (16 Tags)
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAllAsPng}
                                disabled={saving}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Sheet as PNG'}
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer"
                            >
                                Print / Save as PDF
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                        {/* Poster Config Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 border-b border-gray-150">
                            {/* Layout Selection */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Poster Grid Layout</label>
                                <div className="flex gap-2">
                                    {['4', '6', '8'].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handlePosterLayoutChange(num)}
                                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border cursor-pointer ${posterLayout === num ? 'bg-indigo-600 text-white border-transparent' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                        >
                                            {num} Items
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Banner Image Settings */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Custom Poster Banner</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleBannerUpload}
                                        className="hidden" 
                                        id="banner-file-input"
                                    />
                                    <label 
                                        htmlFor="banner-file-input" 
                                        className="flex-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-bold text-xs text-center cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                                    >
                                        <FaImage /> {bannerImage ? 'Change Image' : 'Upload Image'}
                                    </label>
                                    {bannerImage && (
                                        <button
                                            onClick={() => setBannerImage(null)}
                                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-2.5 rounded-lg transition"
                                            title="Remove Banner"
                                        >
                                            <FaTrash className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Custom Text Banner Settings (Fallback) */}
                            {!bannerImage && (
                                <div className="space-y-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Poster Header Text</label>
                                        <input
                                            type="text"
                                            value={posterTitle}
                                            onChange={(e) => setPosterTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Subheader Text</label>
                                        <input
                                            type="text"
                                            value={posterSubtitle}
                                            onChange={(e) => setPosterSubtitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Picker Horizontal List */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Select exactly {posterLayout} offers</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${selectedProductIds.size === totalRequired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {selectedProductIds.size} / {totalRequired} Selected
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={autoSelectProducts} 
                                        className="text-[10px] bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold px-2.5 py-1 rounded border border-gray-300 cursor-pointer"
                                    >
                                        Auto-select {posterLayout}
                                    </button>
                                    <button 
                                        onClick={clearProductSelection} 
                                        className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded border border-red-200 cursor-pointer"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                {products.map(p => {
                                    const isSelected = selectedProductIds.has(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleProductSelection(p.id)}
                                            className={`flex-shrink-0 flex items-center gap-2 p-2.5 rounded-xl border-2 transition relative text-left w-44 cursor-pointer ${
                                                isSelected 
                                                    ? 'border-indigo-650 bg-indigo-50/50' 
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="relative w-9 h-9 bg-gray-50 rounded-lg overflow-hidden border border-gray-150 flex-shrink-0">
                                                <img src={getProxiedImageUrl(p.image)} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-800 truncate leading-snug">{p.name}</p>
                                                <p className="text-[10px] text-indigo-655 font-bold mt-0.5">₹{p.offerPrice}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="absolute top-1.5 right-1.5 bg-indigo-650 text-white p-0.5 rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                                                    <FaCheck />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t border-gray-150 pt-4">
                            <button
                                onClick={handleSaveAllAsPng}
                                disabled={saving || selectedProductIds.size === 0}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Poster as PNG'}
                            </button>
                            <button
                                onClick={() => window.print()}
                                disabled={selectedProductIds.size === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                Print / Save as PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* A4 Printable Container */}
            <div id="print-offers-container" className={`mx-auto print:p-0 print:max-w-none ${printMode === 'poster' ? 'max-w-[210mm] p-2 bg-white' : (layout === 'landscape' ? 'max-w-[297mm] p-2' : 'max-w-[210mm] p-2')}`}>
                
                {printMode === 'poster' ? (
                    /* POSTER LAYOUT CONTAINER */
                    <div className="w-full h-[297mm] border-2 border-black flex flex-col bg-white overflow-hidden select-none">
                        
                        {/* Top Poster Banner */}
                        <div className="w-full h-[57mm] border-b-2 border-black relative flex-shrink-0 bg-white">
                            {bannerImage ? (
                                <img src={bannerImage} alt="Poster Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-red-600 via-purple-700 to-indigo-950 flex flex-col items-center justify-center text-center p-3">
                                    <h1 className="font-anton text-white text-[38px] leading-tight tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                        {posterTitle}
                                    </h1>
                                    <h2 className="font-anton text-[#ffff00] text-[20px] tracking-widest mt-1 uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                        {posterSubtitle}
                                    </h2>
                                </div>
                            )}
                        </div>

                        {/* Poster Grid of Cards */}
                        <div className="grid grid-cols-2 flex-grow border-l-0 border-t-0 border-black bg-white animate-fadeIn">
                            {paddedProducts.map((product, index) => {
                                const isPlaceholder = product.isPlaceholder;
                                const savingsVal = parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0);
                                const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                                const hasSavings = savings > 0;

                                return (
                                    <div
                                        key={product.id}
                                        id={`offer-card-${product.id}`}
                                        className={`border-r-2 border-b-2 border-black p-2 flex flex-col items-center justify-between text-center relative overflow-visible bg-white group ${
                                            // Eliminate right border on right column (index is odd)
                                            (index % 2 === 1) ? 'border-r-0' : ''
                                        } ${
                                            // Eliminate bottom border on last row items
                                            (index >= totalRequired - 2) ? 'border-b-0' : ''
                                        }`}
                                        style={{ height: posterCardHeight }}
                                    >
                                        {isPlaceholder ? (
                                            /* Placeholder Card */
                                            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 p-4">
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Empty Offer Slot</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Select a product to fill this poster position.</p>
                                            </div>
                                        ) : (
                                            /* Active Offer Card */
                                            <>
                                                {/* MRP Badge */}
                                                {(product.mrp || product.price) && (
                                                    <div 
                                                        className="absolute z-[10] bg-[#ffff00] text-black border border-black px-[6px] py-[3.5px] text-[10px] sm:text-[11px] font-extrabold uppercase line-through leading-tight tracking-wide"
                                                        style={{ top: '8px', left: '8px' }}
                                                    >
                                                        MRP {product.mrp || product.price}
                                                    </div>
                                                )}
                                                
                                                {/* Save Badge */}
                                                {hasSavings && (
                                                    <div 
                                                        className="absolute z-[10] bg-[#ff0000] text-white border border-[#ff0000] px-[6px] py-[3.5px] text-[10px] sm:text-[11px] font-extrabold uppercase leading-tight tracking-wide"
                                                        style={{ top: '8px', right: '8px' }}
                                                    >
                                                        SMILE SAVE ₹{savings}
                                                    </div>
                                                )}

                                                {/* Product Title (H2) */}
                                                <h2 
                                                    className="absolute z-[5] text-center font-anton text-[30px] sm:text-[34px] md:text-[38px] leading-[1.1] uppercase text-black"
                                                    style={{ top: '14%', left: '8px', right: '8px', WebkitTextStroke: '1px white', textShadow: '0 0 3px white, 0 0 3px white' }}
                                                >
                                                    {product.name}
                                                </h2>

                                                {/* Image Wrapper */}
                                                <div 
                                                    className="absolute z-[1] flex items-center justify-center"
                                                    style={{ top: '34%', bottom: '26%', left: '8px', right: '8px' }}
                                                >
                                                    <img
                                                        src={getProxiedImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="max-w-full max-h-full object-contain"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </div>

                                                {/* Price Block */}
                                                <div 
                                                    className="absolute z-[5] flex items-baseline justify-center w-full"
                                                    style={{ top: '76%', left: '0', right: '0' }}
                                                >
                                                    <span className="font-anton text-[46px] sm:text-[54px] md:text-[64px] leading-none text-black tracking-tighter"
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

                                                {/* Individual Save as PNG Button */}
                                                <button
                                                    data-html2canvas-ignore
                                                    onClick={() => handleSaveCardAsPng(product.id, product.name)}
                                                    disabled={saving}
                                                    className="absolute bottom-2 right-2 z-10 bg-indigo-650 hover:bg-indigo-850 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer disabled:opacity-50"
                                                >
                                                    Save PNG
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* STANDARD TAG SHEETS CONTAINER */
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
                                    className="border-r-[1.5px] border-b-[1.5px] border-black p-1 flex flex-col items-center justify-between text-center page-break-inside-avoid relative overflow-visible bg-white group"
                                    style={{
                                        height: cardHeight,
                                        breakAfter: (index + 1) % itemsPerPage === 0 ? 'page' : 'auto'
                                    }}
                                >
                                    {/* MRP Badge */}
                                    {(product.mrp || product.price) && (
                                        <div 
                                            className="absolute z-[10] bg-[#ffff00] text-black border border-black px-[5px] py-[3px] text-[10px] sm:text-[11px] font-bold uppercase line-through leading-tight tracking-wide"
                                            style={{ top: '6px', left: '6px' }}
                                        >
                                            MRP {product.mrp || product.price}
                                        </div>
                                    )}
                                    
                                    {/* Save Badge */}
                                    {hasSavings && (
                                        <div 
                                            className="absolute z-[10] bg-[#ff0000] text-white border border-[#ff0000] px-[5px] py-[3px] text-[10px] sm:text-[11px] font-bold uppercase leading-tight tracking-wide"
                                            style={{ top: '6px', right: '6px' }}
                                        >
                                            SMILE SAVE ₹{savings}
                                        </div>
                                    )}

                                    {/* Product Title (H2) */}
                                    <h2 
                                        className="absolute z-[5] text-center font-anton text-[26px] sm:text-[32px] md:text-[34px] leading-[1.2] uppercase text-black"
                                        style={{ top: '12%', left: '4px', right: '4px', WebkitTextStroke: '1px white', textShadow: '0 0 3px white, 0 0 3px white' }}
                                    >
                                        {product.name}
                                    </h2>

                                    {/* Image Wrapper */}
                                    <div 
                                        className="absolute z-[1] flex items-center justify-center"
                                        style={{ top: '32%', bottom: '28%', left: '4px', right: '4px' }}
                                    >
                                        <img
                                            src={getProxiedImageUrl(product.image)}
                                            alt={product.name}
                                            className="max-w-full max-h-full object-contain"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>

                                    {/* Price Block */}
                                    <div 
                                        className="absolute z-[5] flex items-baseline justify-center w-full"
                                        style={{ top: '74%', left: '0', right: '0' }}
                                    >
                                        <span className="font-anton text-[36px] sm:text-[42px] md:text-[46px] leading-none text-black tracking-tighter"
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

                                    {/* Individual Save as PNG Button */}
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
                )}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: ${printMode === 'poster' ? 'A4 portrait' : (layout === 'landscape' ? 'A4 landscape' : 'A4 portrait')};
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
                    #print-offers-container {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .grid {
                        display: grid !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}
