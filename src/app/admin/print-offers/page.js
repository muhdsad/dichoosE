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
};const getDynamicTitleStyle = (name, isNarrow = false) => {
    const len = (name || '').length;
    let fontSize = '16px';
    if (len <= 12) {
        fontSize = isNarrow ? '28px' : '36px';
    } else if (len <= 18) {
        fontSize = isNarrow ? '24px' : '30px';
    } else if (len <= 28) {
        fontSize = isNarrow ? '18px' : '24px';
    } else if (len <= 40) {
        fontSize = isNarrow ? '14px' : '18px';
    } else {
        fontSize = isNarrow ? '12px' : '16px';
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

const getDynamicPriceStyle = (price, isNarrow = false) => {
    const text = `₹${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let fontSize = '24px';
    if (len <= 6) {
        fontSize = isNarrow ? '30px' : '40px';
    } else if (len <= 8) {
        fontSize = isNarrow ? '26px' : '34px';
    } else if (len <= 10) {
        fontSize = isNarrow ? '22px' : '28px';
    } else {
        fontSize = isNarrow ? '18px' : '24px';
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
    } else if (layout === '12') {
        baseSize = 18;
    } else if (layout === '16') {
        baseSize = 14;
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
        WebkitTextStroke: (layout === '4' || layout === '6') ? '1.5px #ffffff' : '1px #ffffff',
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
    } else if (layout === '12') {
        baseSize = 26;
    } else if (layout === '16') {
        baseSize = 20;
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
        WebkitTextStroke: (layout === '4' || layout === '6') ? '1.8px #ffffff' : '1.2px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 6px #ffffff, 0px 0px 6px #ffffff, 0px 0px 6px #ffffff'
    };
};

const getUnitFontSize = (layout) => {
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    if (layout === '8') return '12px';
    if (layout === '12') return '10px';
    return '8px';
};

const getBrandFontSize = (layout) => {
    if (layout === '4') return '14px';
    if (layout === '6') return '11px';
    if (layout === '8') return '10px';
    if (layout === '12') return '8px';
    return '7px';
};

const getMrpFontSize = (layout) => {
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    if (layout === '8') return '12px';
    if (layout === '12') return '10px';
    return '8px';
};

const getDiscountFontSize = (layout) => {
    if (layout === '4') return '16px';
    if (layout === '6') return '13px';
    if (layout === '8') return '11px';
    if (layout === '12') return '9px';
    return '8px';
};

const getPosterBadgeStyle = (layout) => {
    let size = 90;
    let rupeeSize = 15;
    let integerSize = 44;
    let decimalSize = 18;
    let rightOffset = '8%';
    let topOffset = '35%';

    if (layout === '4') {
        size = 135;
        rupeeSize = 22;
        integerSize = 64;
        decimalSize = 26;
        rightOffset = '12%';
        topOffset = '35%';
    } else if (layout === '6') {
        size = 110;
        rupeeSize = 18;
        integerSize = 52;
        decimalSize = 22;
        rightOffset = '10%';
        topOffset = '35%';
    } else if (layout === '8') {
        size = 90;
        rupeeSize = 15;
        integerSize = 44;
        decimalSize = 18;
        rightOffset = '8%';
        topOffset = '35%';
    } else if (layout === '12') {
        size = 72;
        rupeeSize = 12;
        integerSize = 34;
        decimalSize = 14;
        rightOffset = '6%';
        topOffset = '35%';
    } else if (layout === '16') {
        size = 60;
        rupeeSize = 10;
        integerSize = 28;
        decimalSize = 12;
        rightOffset = '5%';
        topOffset = '35%';
    }

    return { size, rupeeSize, integerSize, decimalSize, rightOffset, topOffset };
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
    const [logoImage, setLogoImage] = useState(null);
    const [logoLocationText, setLogoLocationText] = useState('KAKKAD');
    const [decorImage, setDecorImage] = useState(null);

    // Load custom configuration defaults from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLogo = localStorage.getItem('dichoose_poster_logo');
            if (savedLogo) {
                setLogoImage(savedLogo);
            }
            const savedDecor = localStorage.getItem('dichoose_poster_decor');
            if (savedDecor) {
                setDecorImage(savedDecor);
            }
            const savedLogoLocation = localStorage.getItem('dichoose_poster_logo_location');
            if (savedLogoLocation) {
                setLogoLocationText(savedLogoLocation);
            }
        }
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                setLogoImage(dataUrl);
                localStorage.setItem('dichoose_poster_logo', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoImage(null);
        localStorage.removeItem('dichoose_poster_logo');
    };

    const handleLogoLocationChange = (e) => {
        const val = e.target.value;
        setLogoLocationText(val);
        localStorage.setItem('dichoose_poster_logo_location', val);
    };

    const handleDecorUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                setDecorImage(dataUrl);
                localStorage.setItem('dichoose_poster_decor', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveDecor = () => {
        setDecorImage(null);
        localStorage.removeItem('dichoose_poster_decor');
    };

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
    const posterCols = posterLayout === '12' ? 3 : (posterLayout === '16' ? 4 : 2);
    const posterRows = totalRequired / posterCols;
    // Mathematically split remaining A4 height: A4 = 297mm. Banner = 57mm. Footer = 12mm. Remaining = 228mm.
    const posterCardHeight = `${228 / posterRows}mm`;

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
        },
        '12': {
            imageTop: '30px',
            imageBottom: '75px',
            titleFontSize: 'text-[13px] sm:text-[14.5px] md:text-[16px]',
            priceFontSize: 'text-[15px] sm:text-[17px] md:text-[19px]',
            oldPriceFontSize: 'text-[10px] sm:text-[11.5px]',
            unitFontSize: 'text-[9.5px] sm:text-[11px]',
            discountFontSize: 'text-[8.5px] sm:text-[10px]'
        },
        '16': {
            imageTop: '25px',
            imageBottom: '65px',
            titleFontSize: 'text-[11px] sm:text-[12.5px] md:text-[14px]',
            priceFontSize: 'text-[13px] sm:text-[15px] md:text-[17px]',
            oldPriceFontSize: 'text-[8.5px] sm:text-[10px]',
            unitFontSize: 'text-[8px] sm:text-[9.5px]',
            discountFontSize: 'text-[7.5px] sm:text-[9px]'
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-4 border-b border-gray-150">
                            {/* Layout Selection */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Poster Grid Layout</label>
                                <div className="flex gap-2">
                                    {['4', '6', '8', '12', '16'].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handlePosterLayoutChange(num)}
                                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border cursor-pointer ${posterLayout === num ? 'bg-indigo-650 text-white border-transparent' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
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

                            {/* Logo Box Settings */}
                            <div className="space-y-3">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Logo Box Settings</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Upload Shop Logo</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleLogoUpload}
                                                className="hidden" 
                                                id="logo-file-input"
                                            />
                                            <label 
                                                htmlFor="logo-file-input" 
                                                className="flex-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg font-bold text-[11px] text-center cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                                            >
                                                <FaImage /> {logoImage ? 'Change Logo' : 'Upload Logo'}
                                            </label>
                                            {logoImage && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-2 rounded-lg transition"
                                                    title="Remove Logo"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Location / Subtext</label>
                                        <input
                                            type="text"
                                            value={logoLocationText}
                                            onChange={handleLogoLocationChange}
                                            placeholder="e.g. KAKKAD"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Header Decoration Settings */}
                            <div className="space-y-3">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Header Decoration</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Upload Custom Decoration</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleDecorUpload}
                                                className="hidden" 
                                                id="decor-file-input"
                                            />
                                            <label 
                                                htmlFor="decor-file-input" 
                                                className="flex-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg font-bold text-[11px] text-center cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                                            >
                                                <FaImage /> {decorImage ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            {decorImage && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveDecor}
                                                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-2 rounded-lg transition"
                                                    title="Reset to Fruit Basket"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold leading-normal pt-1">
                                        Defaults to fruit basket graphic if no custom image is uploaded.
                                    </div>
                                </div>
                            </div>
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
                    <div className="w-full h-[297mm] flex flex-col bg-white overflow-hidden select-none border border-gray-150 shadow-sm relative">
                        
                        {/* Top Poster Banner */}
                        <div className="w-full h-[57mm] relative flex-shrink-0 bg-white">
                            {bannerType === 'image' && bannerImage ? (
                                <img src={bannerImage} alt="Poster Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div 
                                    className="w-full h-full flex items-center justify-between px-6 relative overflow-hidden"
                                    style={textBannerBgImage ? { 
                                        backgroundImage: `url(${textBannerBgImage})`, 
                                        backgroundPosition: 'center', 
                                        backgroundSize: 'cover' 
                                    } : { 
                                        background: 'radial-gradient(circle, #ffffff 0%, #f0fdf4 100%)' 
                                    }}
                                >
                                    {/* Overlay for legibility if there is a background image */}
                                    {textBannerBgImage && (
                                        <div className="absolute inset-0 bg-black/15 z-0" />
                                    )}
                                    
                                    {/* Left Side: Fruit Basket or Custom Decoration */}
                                    <div className="w-[28%] h-[90%] relative flex-shrink-0 flex items-center justify-start select-none z-10">
                                        <img 
                                            src={decorImage || "/images/fruit_basket.png"} 
                                            alt="Header Decoration" 
                                            className="h-full object-contain max-h-[50mm] drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
                                        />
                                    </div>

                                    {/* Center: Title & Validity */}
                                    <div className="flex flex-col items-center justify-center text-center flex-1 max-w-[45%] z-10 leading-none">
                                        {/* Date/Validity on top */}
                                        <div className="text-black font-extrabold text-xs sm:text-sm tracking-widest mb-1.5 font-sans">
                                            {posterSubtitle || 'JULY 18'}
                                        </div>

                                        {/* 3D Styled Title */}
                                        {(() => {
                                            const words = (posterTitle || 'Fresh Market').trim().split(/\s+/);
                                            const firstWord = words[0] || 'Fresh';
                                            const remainingWords = words.slice(1).join(' ') || 'Market';
                                            return (
                                                <div className="flex flex-col items-center justify-center leading-[0.85]">
                                                    <span 
                                                        className="font-anton tracking-tight text-[48px] text-[#16a34a] filter drop-shadow-[0_2px_0_#15803d] drop-shadow-[0_3px_0_#15803d] drop-shadow-[0_4px_0_#14532d]"
                                                        style={{ 
                                                            WebkitTextStroke: '1.5px #ffffff', 
                                                            paintOrder: 'stroke fill',
                                                        }}
                                                    >
                                                        {firstWord}
                                                    </span>
                                                    {remainingWords && (
                                                        <span 
                                                            className="font-anton tracking-tight text-[48px] text-[#ea580c] mt-1 filter drop-shadow-[0_2px_0_#b45309] drop-shadow-[0_3px_0_#b45309] drop-shadow-[0_4px_0_#7c2d12]"
                                                            style={{ 
                                                                WebkitTextStroke: '1.5px #ffffff', 
                                                                paintOrder: 'stroke fill',
                                                            }}
                                                        >
                                                            {remainingWords}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Right Side: Logo Box */}
                                    <div className="w-[24%] h-[90%] relative flex-shrink-0 flex items-center justify-end z-10 select-none">
                                        <div className="w-[110px] h-[48mm] bg-white border border-gray-250 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between p-2 pb-3 text-center">
                                            {logoImage ? (
                                                <div className="flex-1 flex items-center justify-center w-full min-h-0">
                                                    <img src={logoImage} className="max-w-full max-h-[85%] object-contain" alt="Logo" />
                                                </div>
                                            ) : (
                                                // Premium Fallback Logo
                                                <div className="flex-1 flex flex-col items-center justify-center w-full">
                                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200 mb-1">
                                                        <svg className="w-4.5 h-4.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
                                                        </svg>
                                                    </div>
                                                    <span className="text-[13px] font-black text-primary tracking-tight leading-none">Dichoos</span>
                                                    <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Hypermarket</span>
                                                </div>
                                            )}
                                            
                                            {/* Tagline / Subtitle */}
                                            <div className="w-full">
                                                <div className="bg-blue-600 text-white text-[6px] font-black uppercase py-0.5 rounded tracking-wide leading-none select-none mb-1">
                                                    Save More Live Better
                                                </div>
                                                <div className="text-[9px] font-black text-gray-800 tracking-wider leading-none uppercase">
                                                    {logoLocationText || 'KAKKAD'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Poster Grid of Cards */}
                        <div 
                            className={`grid ${posterLayout === '12' ? 'grid-cols-3' : (posterLayout === '16' ? 'grid-cols-4' : 'grid-cols-2')} flex-grow animate-fadeIn`}
                            style={{ background: 'radial-gradient(circle, #ffffff 0%, #f7fdf9 100%)' }}
                        >
                            {paddedProducts.map((product, index) => {
                                const isPlaceholder = product.isPlaceholder;
                                const savingsVal = parseFloat(product.mrp || product.price || 0) - parseFloat(product.offerPrice || 0);
                                const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                                const hasSavings = savings > 0;

                                return (
                                    <div
                                        key={product.id}
                                        id={`offer-card-${product.id}`}
                                        className="p-2 flex flex-col items-center justify-between text-center relative overflow-hidden bg-transparent group"
                                        style={{ height: posterCardHeight }}
                                    >
                                        {isPlaceholder ? (
                                            /* Placeholder Card */
                                            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-2xl bg-gray-50/50 p-4">
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
                                                        className="absolute z-[10] bg-[#e11b22] text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-wide shadow-sm"
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
                                                        className="max-w-[85%] max-h-[85%] object-contain animate-fadeIn"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                </div>

                                                {/* Red circular price badge overlapping the image */}
                                                {(() => {
                                                    const { size, rupeeSize, integerSize, decimalSize, rightOffset, topOffset } = getPosterBadgeStyle(posterLayout);
                                                    const priceVal = parseFloat(product.offerPrice || 0);
                                                    const isInteger = priceVal % 1 === 0;
                                                    const integerPart = Math.floor(priceVal).toString();
                                                    const decimalPart = isInteger ? '' : (priceVal % 1).toFixed(2).substring(1); // e.g. ".90"

                                                    return (
                                                        <div 
                                                            className="absolute z-[15] rounded-full bg-[#e11b22] text-white flex items-center justify-center font-anton border-2 border-white shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none"
                                                            style={{
                                                                width: `${size}px`,
                                                                height: `${size}px`,
                                                                right: rightOffset,
                                                                top: topOffset,
                                                                transform: 'translateY(-20%)',
                                                            }}
                                                        >
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                {/* Rupee Symbol */}
                                                                <span 
                                                                    className="absolute font-sans font-bold leading-none"
                                                                    style={{
                                                                        fontSize: `${rupeeSize}px`,
                                                                        top: decimalPart ? '18%' : '26%',
                                                                        left: '12%',
                                                                    }}
                                                                >
                                                                    ₹
                                                                </span>
                                                                
                                                                {/* Integer Part */}
                                                                <span 
                                                                    className="font-normal leading-none tracking-tighter"
                                                                    style={{
                                                                        fontSize: `${integerPart.length >= 3 ? integerSize * 0.8 : integerSize}px`,
                                                                        marginLeft: '12%',
                                                                        marginRight: decimalPart ? '22%' : '0%',
                                                                    }}
                                                                >
                                                                    {integerPart}
                                                                </span>

                                                                {/* Decimal Part */}
                                                                {decimalPart && (
                                                                    <span 
                                                                        className="absolute font-bold leading-none"
                                                                        style={{
                                                                            fontSize: `${decimalSize}px`,
                                                                            top: '20%',
                                                                            right: '10%',
                                                                        }}
                                                                    >
                                                                        {decimalPart}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Card Details Block */}
                                                <div 
                                                    className="absolute bottom-2 left-0 right-0 z-[10] px-2 text-center"
                                                >
                                                    <h2 
                                                        className="font-extrabold uppercase tracking-tight text-black leading-none" 
                                                        style={{ 
                                                            fontSize: getPosterDynamicTitleStyle(product.name, posterLayout).fontSize,
                                                            fontFamily: 'var(--font-sans), sans-serif'
                                                        }}
                                                    >
                                                        {product.name.toUpperCase()}
                                                        {product.unit && (
                                                            <span className="text-gray-600 font-bold"> / {product.unit.toUpperCase()}</span>
                                                        )}
                                                    </h2>
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

                        {/* Poster Footer Bar */}
                        <div className="w-full bg-[#15803d] text-white flex flex-col items-center justify-center p-3 select-none flex-shrink-0 leading-tight">
                            <p className="text-[7.5px] font-medium text-gray-100 opacity-90 mb-1 text-center font-sans">
                                *T&C Apply. Purchase limit may apply. Bulk purchase not allowed for promotional items. Offer valid while stock lasts.
                            </p>
                            <div className="w-full flex items-center justify-between px-6 text-[10px] sm:text-[11.5px] font-black tracking-wider uppercase text-yellow-300 font-sans">
                                <div>
                                    FREE HOME DELIVERY <span className="text-white text-[8px] font-bold opacity-90">(Order Before 11 am)</span>
                                </div>
                                <div>
                                    PURCHASE ABOVE 800 <span className="text-white text-[8px] font-bold opacity-90">with in 5 km</span>
                                </div>
                                <div>
                                    SK arcade, Kakkad <span className="text-white font-bold ml-1">82828 93434</span>
                                </div>
                            </div>
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
                                                    <h2 className="font-black leading-tight tracking-tight uppercase text-center" style={getDynamicTitleStyle(product.name, layout === 'landscape')}>
                                                        {product.name.toUpperCase()}
                                                    </h2>
                                                    <div className="font-bold mt-1" style={{ fontSize: layout === 'landscape' ? '11px' : '13px', color: '#374151', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                        {product.unit || '1 KG'}
                                                    </div>
                                                    <div className="flex items-baseline justify-center w-full mt-1.5">
                                                        <span style={getDynamicPriceStyle(product.offerPrice, layout === 'landscape')}>
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
