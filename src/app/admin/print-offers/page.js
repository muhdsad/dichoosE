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
};const getDynamicTitleStyle = (name) => {
    const len = (name || '').length;
    let fontSize = '16px';
    if (len <= 12) {
        fontSize = '36px';
    } else if (len <= 18) {
        fontSize = '30px';
    } else if (len <= 28) {
        fontSize = '24px';
    } else if (len <= 40) {
        fontSize = '18px';
    } else {
        fontSize = '16px';
    }
    return {
        fontSize,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1.1',
        color: '#000000',
        textTransform: 'uppercase',
        textAlign: 'center',
        wordBreak: 'break-word',
        WebkitTextStroke: '1px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff, 0px 0px 4px #ffffff'
    };
};

const getDynamicPriceStyle = (price) => {
    const text = `₹${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let fontSize = '24px';
    if (len <= 6) {
        fontSize = '38px';
    } else if (len <= 8) {
        fontSize = '34px';
    } else if (len <= 10) {
        fontSize = '28px';
    } else {
        fontSize = '24px';
    }
    return {
        fontSize,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1',
        color: '#000000',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        WebkitTextStroke: '1.2px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff, 0px 0px 4px #ffffff'
    };
};

const getPosterDynamicTitleStyle = (name, layout) => {
    const len = (name || '').length;
    let baseSize = 24; // Default for '8'
    if (layout === '4') {
        baseSize = 48;
    } else if (layout === '6') {
        baseSize = 34;
    }

    let sizeFactor = 1.0;
    if (len > 30) {
        sizeFactor = 0.65;
    } else if (len > 18) {
        sizeFactor = 0.8;
    }

    const finalSize = Math.round(baseSize * sizeFactor);
    return {
        fontSize: `${finalSize}px`,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1.1',
        color: '#000000',
        textTransform: 'uppercase',
        textAlign: 'center',
        wordBreak: 'break-word',
        WebkitTextStroke: layout === '4' ? '1.5px #ffffff' : '1px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 6px #ffffff, 0px 0px 6px #ffffff, 0px 0px 6px #ffffff'
    };
};

const getPosterDynamicPriceStyle = (price, layout) => {
    const text = `₹${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let baseSize = 32; // Default for '8'
    if (layout === '4') {
        baseSize = 64;
    } else if (layout === '6') {
        baseSize = 46;
    }

    let sizeFactor = 1.0;
    if (len > 8) {
        sizeFactor = 0.8;
    } else if (len > 10) {
        sizeFactor = 0.65;
    }

    const finalSize = Math.round(baseSize * sizeFactor);
    return {
        fontSize: `${finalSize}px`,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1',
        color: '#000000',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        WebkitTextStroke: layout === '4' ? '1.8px #ffffff' : '1.2px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 6px #ffffff, 0px 0px 6px #ffffff, 0px 0px 6px #ffffff'
    };
};

const getUnitFontSize = (layout) => {
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    return '12px';
};

const getBrandFontSize = (layout) => {
    if (layout === '4') return '14px';
    if (layout === '6') return '11px';
    return '10px';
};

const getMrpFontSize = (layout) => {
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    return '12px';
};

const getDiscountFontSize = (layout) => {
    if (layout === '4') return '16px';
    if (layout === '6') return '13px';
    return '11px';
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
    const [textBannerBgImage, setTextBannerBgImage] = useState(null);
    const [bannerType, setBannerType] = useState('text'); // 'text' | 'image'
    const [posterTitle, setPosterTitle] = useState('SMILE HYPERMARKET');
    const [posterSubtitle, setPosterSubtitle] = useState('OFFER VALIDITY: 14TH TO 20TH JULY');

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

    const handleTextBannerBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setTextBannerBgImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCardAsPng = async (productId, productName) => {
        setSaving(true);
        try {
            const html2canvas = (await import('html2canvas-pro')).default;
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
            const html2canvas = (await import('html2canvas-pro')).default;
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

    const posterLayoutConfigs = {
        '4': {
            imageTop: '50px',
            imageBottom: '135px',
            titleFontSize: 'text-[22px] sm:text-[24px] md:text-[26px]',
            priceFontSize: 'text-[26px] sm:text-[30px] md:text-[34px]',
            oldPriceFontSize: 'text-base sm:text-lg',
            unitFontSize: 'text-sm sm:text-base',
            discountFontSize: 'text-xs sm:text-sm'
        },
        '6': {
            imageTop: '45px',
            imageBottom: '110px',
            titleFontSize: 'text-[18px] sm:text-[20px] md:text-[22px]',
            priceFontSize: 'text-[22px] sm:text-[24px] md:text-[26px]',
            oldPriceFontSize: 'text-xs sm:text-sm',
            unitFontSize: 'text-[11px] sm:text-xs',
            discountFontSize: 'text-[10px] sm:text-xs'
        },
        '8': {
            imageTop: '40px',
            imageBottom: '95px',
            titleFontSize: 'text-[15px] sm:text-[16px] md:text-[18px]',
            priceFontSize: 'text-[18px] sm:text-[20px] md:text-[22px]',
            oldPriceFontSize: 'text-[11px] sm:text-xs',
            unitFontSize: 'text-[10px] sm:text-[11px]',
            discountFontSize: 'text-[9px] sm:text-[10px]'
        }
    };

    const config = posterLayoutConfigs[posterLayout] || posterLayoutConfigs['6'];

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
                                3x5 Portrait (15 Tags)
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

                            {/* Banner Option Selection (Two-Way Option) */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Banner Option</label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setBannerType('text')}
                                        className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${bannerType === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        Custom Text Banner
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBannerType('image')}
                                        className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${bannerType === 'image' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        Uploaded Image Banner
                                    </button>
                                </div>
                            </div>

                            {/* Banner Image Settings */}
                            {bannerType === 'image' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Custom Poster Banner Image</label>
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
                                                type="button"
                                                onClick={() => setBannerImage(null)}
                                                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-2.5 rounded-lg transition"
                                                title="Remove Banner"
                                            >
                                                <FaTrash className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Custom Text Banner Settings */}
                            {bannerType === 'text' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Thick Main Header</label>
                                            <input
                                                type="text"
                                                value={posterTitle}
                                                onChange={(e) => setPosterTitle(e.target.value)}
                                                placeholder="e.g. SPECIAL OFFER"
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Offer Duration / Validity</label>
                                            <input
                                                type="text"
                                                value={posterSubtitle}
                                                onChange={(e) => setPosterSubtitle(e.target.value)}
                                                placeholder="e.g. VALIDITY: 14TH TO 20TH JULY"
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Banner Background Image (Optional)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleTextBannerBgUpload}
                                                className="hidden" 
                                                id="text-banner-bg-input"
                                            />
                                            <label 
                                                htmlFor="text-banner-bg-input" 
                                                className="flex-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg font-bold text-[11px] text-center cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                                            >
                                                <FaImage /> {textBannerBgImage ? 'Change BG Image' : 'Upload BG Image'}
                                            </label>
                                            {textBannerBgImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTextBannerBgImage(null)}
                                                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-2 rounded-lg transition"
                                                    title="Remove BG Image"
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
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
                            {bannerType === 'image' && bannerImage ? (
                                <img src={bannerImage} alt="Poster Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div 
                                    className="w-full h-full flex flex-col items-center justify-center text-center p-3 relative overflow-hidden"
                                    style={textBannerBgImage ? { 
                                        backgroundImage: `url(${textBannerBgImage})`, 
                                        backgroundPosition: 'center', 
                                        backgroundSize: 'cover' 
                                    } : { 
                                        background: 'linear-gradient(to right, #dc2626, #7e22ce, #1e1b4b)' 
                                    }}
                                >
                                    {/* Overlay for legibility if there is a background image */}
                                    {textBannerBgImage && (
                                        <div className="absolute inset-0 bg-black/35 z-0" />
                                    )}
                                    <div className="relative z-10 flex flex-col items-center justify-center">
                                        <h1 
                                            className="font-black text-[42px] leading-none tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                                            style={{ color: '#ffffff', fontWeight: '950' }}
                                        >
                                            {posterTitle || 'SMILE HYPERMARKET'}
                                        </h1>
                                        {posterSubtitle && (
                                            <div 
                                                className="mt-3 px-6 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-widest shadow-md border-2 border-black flex items-center justify-center"
                                                style={{ backgroundColor: '#facc15', color: '#000000', fontWeight: '900' }}
                                            >
                                                {posterSubtitle}
                                            </div>
                                        )}
                                    </div>
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
                                        className={`border-r-2 border-b-2 border-black p-2 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white group ${
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
                                                        className="absolute z-[10] bg-[#ffff00] text-black border border-black font-extrabold uppercase px-2 py-0.5 tracking-wide line-through"
                                                        style={{ 
                                                            top: '12px', 
                                                            left: '12px', 
                                                            fontSize: getDiscountFontSize(posterLayout),
                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                            textDecorationColor: '#000000',
                                                            lineHeight: '1.1'
                                                        }}
                                                    >
                                                        MRP {Number(product.mrp || product.price || 0).toFixed(2)}
                                                    </div>
                                                )}

                                                {/* Save Badge */}
                                                {hasSavings && (
                                                    <div 
                                                        className="absolute z-[10] bg-red-600 text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-wide shadow-sm"
                                                        style={{ 
                                                            top: '12px', 
                                                            right: '12px', 
                                                            fontSize: getDiscountFontSize(posterLayout),
                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                            lineHeight: '1.1'
                                                        }}
                                                    >
                                                        {Math.round(((parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0)) / parseFloat(product.mrp || product.price || 1)) * 100)}% OFF
                                                    </div>
                                                )}

                                                {/* Image Wrapper */}
                                                <div 
                                                    className="absolute inset-0 z-[1] flex items-center justify-center bg-transparent p-2.5 box-border"
                                                >
                                                    <img
                                                        src={getProxiedImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="max-w-[95%] max-h-[95%] object-contain animate-fadeIn"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </div>

                                                {/* Card Details Block */}
                                                <div 
                                                    className="absolute inset-0 z-[2] flex flex-col justify-center items-center bg-transparent p-4 box-border text-center"
                                                >
                                                    {product.brand && (
                                                        <span className="font-bold uppercase tracking-wider mb-1" style={{ fontSize: getBrandFontSize(posterLayout), color: '#9ca3af', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                            {product.brand}
                                                        </span>
                                                    )}
                                                    <h2 className="font-black leading-tight tracking-tight uppercase text-center" style={getPosterDynamicTitleStyle(product.name, posterLayout)}>
                                                        {product.name.toUpperCase()}
                                                    </h2>
                                                    <div className="font-bold mt-1" style={{ fontSize: getUnitFontSize(posterLayout), color: '#374151', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                        {product.unit || '1 KG'}
                                                    </div>
                                                    <div className="flex items-baseline justify-center w-full mt-2">
                                                        <span style={getPosterDynamicPriceStyle(product.offerPrice, posterLayout)}>
                                                            ₹{Number(product.offerPrice || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Individual Save as PNG Button */}
                                                <button
                                                    data-html2canvas-ignore
                                                    onClick={() => handleSaveCardAsPng(product.id, product.name)}
                                                    disabled={saving}
                                                    className="absolute bottom-2 right-2 z-[20] bg-indigo-650 hover:bg-indigo-850 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer disabled:opacity-50"
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
                        {(() => {
                            const itemsPerPage = layout === 'landscape' ? 16 : 15;
                            const cardHeight = layout === 'landscape' ? '52.5mm' : '58.5mm';
                            
                            // Pad products to a multiple of itemsPerPage with empty placeholders
                            const sheetProducts = [...products];
                            const remainder = sheetProducts.length % itemsPerPage;
                            if (remainder !== 0) {
                                const padCount = itemsPerPage - remainder;
                                for (let i = 0; i < padCount; i++) {
                                    sheetProducts.push({
                                        id: `sheet-placeholder-${i}`,
                                        isPlaceholder: true,
                                        name: 'Placeholder'
                                    });
                                }
                            }

                            return sheetProducts.map((product, index) => {
                                const isPlaceholder = product.isPlaceholder;
                                const savingsVal = parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0);
                                const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                                const hasSavings = savings > 0;

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
                                        {isPlaceholder ? (
                                            /* Empty placeholder cell to maintain print shape for trimming */
                                            <div className="w-full h-full bg-white" />
                                        ) : (
                                            /* Active tag card */
                                            <>
                                                {/* MRP Badge */}
                                                {(product.mrp || product.price) && (
                                                    <div 
                                                        className="absolute z-[10] bg-[#ffff00] text-black border border-black font-extrabold uppercase px-1.5 py-0.5 tracking-wide line-through"
                                                        style={{ 
                                                            top: '8px', 
                                                            left: '8px', 
                                                            fontSize: '11px',
                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                            textDecorationColor: '#000000',
                                                            lineHeight: '1.1'
                                                        }}
                                                    >
                                                        MRP {Number(product.mrp || product.price || 0).toFixed(2)}
                                                    </div>
                                                )}

                                                {/* Save Badge */}
                                                {hasSavings && (
                                                    <div 
                                                        className="absolute z-[10] bg-red-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide shadow-sm"
                                                        style={{ 
                                                            top: '8px', 
                                                            right: '8px', 
                                                            fontSize: '11px',
                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                            lineHeight: '1.1'
                                                        }}
                                                    >
                                                        {Math.round(((parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0)) / parseFloat(product.mrp || product.price || 1)) * 100)}% OFF
                                                    </div>
                                                )}

                                                {/* Image Wrapper */}
                                                <div 
                                                    className="absolute inset-0 z-[1] flex items-center justify-center bg-transparent p-1 box-border"
                                                >
                                                    <img
                                                        src={getProxiedImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="max-w-[95%] max-h-[95%] object-contain animate-fadeIn"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </div>

                                                {/* Card Details Block */}
                                                <div 
                                                    className="absolute inset-0 z-[2] flex flex-col justify-center items-center bg-transparent p-3 box-border text-center"
                                                >
                                                    {product.brand && (
                                                        <span className="font-bold uppercase tracking-wider mb-0.5" style={{ fontSize: '9px', color: '#9ca3af', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                            {product.brand}
                                                        </span>
                                                    )}
                                                    <h2 className="font-black leading-tight tracking-tight uppercase text-center" style={getDynamicTitleStyle(product.name)}>
                                                        {product.name.toUpperCase()}
                                                    </h2>
                                                    <div className="font-bold mt-1" style={{ fontSize: '13px', color: '#374151', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                        {product.unit || '1 KG'}
                                                    </div>
                                                    <div className="flex items-baseline justify-center w-full mt-1.5">
                                                        <span style={getDynamicPriceStyle(product.offerPrice)}>
                                                            ₹{Number(product.offerPrice || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Individual Save as PNG Button */}
                                                <button
                                                    data-html2canvas-ignore
                                                    onClick={() => handleSaveCardAsPng(product.id, product.name)}
                                                    disabled={saving}
                                                    className="absolute bottom-2 right-2 z-[20] bg-primary hover:bg-green-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer disabled:opacity-50"
                                                >
                                                    Save PNG
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            });
                        })()}
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
