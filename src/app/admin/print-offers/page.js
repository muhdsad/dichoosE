"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';
import { FaImage, FaTrash, FaCheck, FaTimes, FaUndo, FaSearch, FaPencilAlt } from 'react-icons/fa';

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
    const [normalProducts, setNormalProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState('landscape'); // 'portrait' | 'landscape' (used for sheet mode)
    const [saving, setSaving] = useState(false);

    // Poster Mode States
    const [printMode, setPrintMode] = useState('sheet'); // 'sheet' | 'poster' | 'normal_poster'
    const [posterLayout, setPosterLayout] = useState('6'); // '4' | '6' | '8'
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [bannerImage, setBannerImage] = useState(null);
    const [textBannerBgImage, setTextBannerBgImage] = useState(null);
    const [bannerType, setBannerType] = useState('text'); // 'text' | 'image'
    const [posterTitle, setPosterTitle] = useState('SMILE\nHYPERMARKET');
    const [headerStyle, setHeaderStyle] = useState('vintage_headline');
    const [headerColorTheme, setHeaderColorTheme] = useState('brand'); // 'brand' | 'black_white' | 'solid_black' | 'solid_white' | 'black_gold' | 'red_yellow' | 'blue_indigo' | 'solid_red'
    const [posterSubtitle, setPosterSubtitle] = useState('OFFER VALIDITY: 14TH TO 20TH JULY');
    const [logoImage, setLogoImage] = useState(null);
    const [logoLocationText, setLogoLocationText] = useState('KAKKAD');
    const [decorImage, setDecorImage] = useState(null);
    const [showProductImages, setShowProductImages] = useState(true);

    // Quick Edit Modal States
    const [editingHeaderModal, setEditingHeaderModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editMrp, setEditMrp] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editOfferPrice, setEditOfferPrice] = useState('');
    const [editImage, setEditImage] = useState('');
    const [saveToDb, setSaveToDb] = useState(false);
    const [savingPrice, setSavingPrice] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(false);

    const handleOpenEditModal = (e, product) => {
        if (!product || product.isPlaceholder) return;
        e.stopPropagation();
        setEditingProduct(product);
        setEditMrp(product.mrp !== undefined && product.mrp !== null ? String(product.mrp) : '');
        setEditPrice(product.price !== undefined && product.price !== null ? String(product.price) : '');
        setEditOfferPrice(product.offerPrice !== undefined && product.offerPrice !== null ? String(product.offerPrice) : '');
        setEditImage(product.image || '');
        setSaveToDb(false);
    };

    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImageUrlChange = (e) => {
        const url = e.target.value;
        const converted = getDirectDriveLink(url);
        setEditImage(converted);
    };

    const handleSavePriceEdit = async () => {
        if (!editingProduct) return;

        const newMrp = editMrp !== '' ? parseFloat(editMrp) : '';
        const newPrice = editPrice !== '' ? parseFloat(editPrice) : '';
        const newOfferPrice = editOfferPrice !== '' ? parseFloat(editOfferPrice) : '';
        const newImage = editImage;

        setSavingPrice(true);
        try {
            const updateFn = (list) => list.map(p => {
                if (p.id === editingProduct.id) {
                    return {
                        ...p,
                        mrp: newMrp,
                        price: newPrice,
                        offerPrice: newOfferPrice,
                        image: newImage
                    };
                }
                return p;
            });

            setNormalProducts(prev => updateFn(prev));
            setProducts(prev => updateFn(prev));

            if (saveToDb && editingProduct.id && !editingProduct.id.startsWith('placeholder')) {
                const productRef = doc(db, "products", editingProduct.id);
                const updateData = {};
                if (newMrp !== '') updateData.mrp = newMrp;
                if (newPrice !== '') updateData.price = newPrice;
                if (newOfferPrice !== '') updateData.offerPrice = newOfferPrice;
                updateData.image = newImage || '';

                await updateDoc(productRef, updateData);
            }

            setEditingProduct(null);
        } catch (error) {
            console.error("Error updating product details:", error);
            alert("Failed to update product details. Please try again.");
        } finally {
            setSavingPrice(false);
        }
    };

    const handleDeleteProductFromDb = async () => {
        if (!editingProduct) return;

        const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${editingProduct.name}" from the database? This cannot be undone.`);
        if (!confirmDelete) return;

        setDeletingProduct(true);
        try {
            if (editingProduct.id && !editingProduct.id.startsWith('placeholder')) {
                const productRef = doc(db, "products", editingProduct.id);
                await deleteDoc(productRef);
            }

            // Remove deleted product from active lists and selection set
            setNormalProducts(prev => prev.filter(p => p.id !== editingProduct.id));
            setProducts(prev => prev.filter(p => p.id !== editingProduct.id));
            setSelectedProductIds(prev => {
                const next = new Set(prev);
                next.delete(editingProduct.id);
                return next;
            });

            setEditingProduct(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product from database. Please try again.");
        } finally {
            setDeletingProduct(false);
        }
    };

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

    const handleDeleteDecor = () => {
        setDecorImage('none');
        localStorage.setItem('dichoose_poster_decor', 'none');
    };

    const handleResetToDefaultDecor = () => {
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

                // Filter logic for active offers:
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

                // Filter logic for normal products (all products with valid name and price/mrp):
                const normalProds = allProducts.filter(product => {
                    const hasValidName = product.name && product.name.trim() !== '';
                    if (!hasValidName) return false;
                    const hasPrice = (product.price && parseFloat(product.price) > 0) || (product.mrp && parseFloat(product.mrp) > 0);
                    return hasPrice;
                });
                normalProds.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                setProducts(activeOffers);
                setNormalProducts(normalProds);

                // Auto select first items for poster mode
                if (activeOffers.length > 0) {
                    const initialIds = new Set(activeOffers.slice(0, 6).map(p => p.id));
                    setSelectedProductIds(initialIds);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferProducts();
    }, []);

    // Handle switching print mode
    const handleModeChange = (newMode) => {
        setPrintMode(newMode);
        setSearchTerm('');
        const pool = newMode === 'normal_poster' ? normalProducts : products;
        const count = parseInt(posterLayout);
        if (pool.length > 0) {
            setSelectedProductIds(new Set(pool.slice(0, count).map(p => p.id)));
        } else {
            setSelectedProductIds(new Set());
        }
    };

    // Auto update selection when layout changes
    const handlePosterLayoutChange = (newLayout) => {
        setPosterLayout(newLayout);
        const count = parseInt(newLayout);
        const pool = printMode === 'normal_poster' ? normalProducts : products;
        if (pool.length > 0) {
            const nextIds = new Set(pool.slice(0, count).map(p => p.id));
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
        const pool = printMode === 'normal_poster' ? normalProducts : products;
        const nextIds = new Set(pool.slice(0, count).map(p => p.id));
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
                scale: 4, // High resolution
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
                scale: 4, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: true
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = printMode === 'poster' 
                ? `offers-poster-${posterLayout}.png` 
                : (printMode === 'normal_poster' 
                    ? `normal-price-poster-${posterLayout}.png` 
                    : `offers-sheet-${layout}.png`);
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error saving sheet as PNG:", error);
            alert("Failed to save sheet as PNG. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center p-10">Loading Products...</div>;

    if (products.length === 0 && normalProducts.length === 0) return <div className="text-center p-10">No products found to print.</div>;

    // Filter and pad products for Poster Mode
    const currentPool = printMode === 'normal_poster' ? normalProducts : products;
    const selectableProducts = currentPool.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedProducts = currentPool.filter(p => selectedProductIds.has(p.id));
    const paddedProducts = [...selectedProducts];
    const totalRequired = parseInt(posterLayout);
    while (paddedProducts.length < totalRequired) {
        paddedProducts.push({
            id: `placeholder-${paddedProducts.length}`,
            isPlaceholder: true,
            name: printMode === 'normal_poster' ? 'Product Slot' : 'Offer Slot',
            offerPrice: '0.00',
            price: '0.00'
        });
    }

    // Grid details for Poster
    const posterCols = posterLayout === '12' ? 3 : (posterLayout === '16' ? 4 : 2);
    const posterRows = totalRequired / posterCols;
    // Mathematically split remaining A4 height: A4 = 297mm. Top HR = 4.5mm. Banner = 55mm. Footer = 20mm. Bottom HR = 4.5mm. Remaining Grid = 210mm.
    const posterCardHeight = `${210 / posterRows}mm`;

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
                        <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Price & Offer Poster Manager</h1>
                        <p className="text-sm text-blue-600">Select standard price tag sheets, offer posters, or normal price posters with MRP vs Price savings.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => handleModeChange('sheet')}
                            className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs sm:text-sm cursor-pointer ${printMode === 'sheet' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                        >
                            Standard Tag Sheet
                        </button>
                        <button
                            onClick={() => handleModeChange('poster')}
                            className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer ${printMode === 'poster' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-700 border border-gray-300'}`}
                        >
                            Promotional Offer Poster (A4)
                        </button>
                        <button
                            onClick={() => handleModeChange('normal_poster')}
                            className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer ${printMode === 'normal_poster' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-gray-700 border border-gray-300'}`}
                        >
                            Normal Price Poster (A4)
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
                        <div className="flex gap-3 items-center">
                            <label className="flex items-center gap-2 font-bold text-xs text-gray-700 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={showProductImages}
                                    onChange={(e) => setShowProductImages(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer accent-primary"
                                />
                                <span>Show Product Images</span>
                            </label>
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

                            {/* Product Images Toggle */}
                            <div className="space-y-2">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">Product Images</label>
                                <label className="flex items-center gap-2 font-bold text-xs text-gray-700 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors h-[38px] shadow-sm">
                                    <input
                                        type="checkbox"
                                        checked={showProductImages}
                                        onChange={(e) => setShowProductImages(e.target.checked)}
                                        className="w-4 h-4 text-indigo-650 rounded focus:ring-indigo-650 cursor-pointer accent-indigo-650"
                                    />
                                    <span>Print Product Images</span>
                                </label>
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
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Thick Main Header</label>
                                            <textarea
                                                rows={2}
                                                value={posterTitle}
                                                onChange={(e) => setPosterTitle(e.target.value)}
                                                placeholder={"e.g.\nSPECIAL OFFER"}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black resize-none"
                                            />
                                            <p className="text-[9px] text-gray-400 mt-0.5">Use Enter for line breaks.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Header Font Style</label>
                                            <select
                                                value={headerStyle}
                                                onChange={(e) => setHeaderStyle(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black cursor-pointer"
                                            >
                                                <option value="vintage_headline">Line 1 Vintage + Line 2 Headline</option>
                                                <option value="modern_montserrat">Modern Ultra-Bold (Montserrat)</option>
                                                <option value="modern_bebas">Modern Tall Headline (Bebas Neue)</option>
                                                <option value="modern_righteous">Modern Geometric (Righteous)</option>
                                                <option value="modern_poppins">Modern Heavy (Poppins)</option>
                                                <option value="modern_oswald">Modern Clean Condensed (Oswald)</option>
                                                <option value="vintage">Vintage Script (Pacifico)</option>
                                                <option value="headline">Headline Script (Dancing Script)</option>
                                                <option value="anton">3D Block Font (Anton)</option>
                                            </select>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Font style family.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Header Font Colors</label>
                                            <select
                                                value={headerColorTheme}
                                                onChange={(e) => setHeaderColorTheme(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black cursor-pointer"
                                            >
                                                <option value="brand">Brand (Green & Orange)</option>
                                                <option value="black_white">Black & White (Contrast)</option>
                                                <option value="solid_black">Solid Black</option>
                                                <option value="solid_white">Solid White</option>
                                                <option value="black_gold">Black & Gold</option>
                                                <option value="red_yellow">Red & Yellow</option>
                                                <option value="blue_indigo">Deep Blue & Indigo</option>
                                                <option value="solid_red">Solid Crimson Red</option>
                                            </select>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Color palette options.</p>
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
                                        <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Upload / Manage Decoration</label>
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
                                                <FaImage /> {decorImage && decorImage !== 'none' ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleDeleteDecor}
                                                disabled={decorImage === 'none'}
                                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                                    decorImage === 'none'
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                }`}
                                                title="Delete / Hide Decoration Image"
                                            >
                                                <FaTrash className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {decorImage !== null && (
                                        <button
                                            type="button"
                                            onClick={handleResetToDefaultDecor}
                                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 pt-0.5 cursor-pointer w-fit"
                                        >
                                            <FaUndo className="w-2.5 h-2.5" /> Restore Default Fruit Basket
                                        </button>
                                    )}

                                    <div className="text-[10px] text-gray-400 font-bold leading-normal pt-0.5">
                                        {decorImage === 'none' 
                                            ? 'Decoration image deleted (No image displayed).' 
                                            : (decorImage ? 'Custom decoration image active.' : 'Defaults to fruit basket graphic.')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Picker Horizontal List */}
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                                        Select exactly {posterLayout} {printMode === 'normal_poster' ? 'products' : 'offers'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${selectedProductIds.size === totalRequired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {selectedProductIds.size} / {totalRequired} Selected
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    {/* Search Bar Input */}
                                    <div className="relative flex-1 sm:w-64">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search items by name..."
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-7 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
                                        />
                                        <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={autoSelectProducts} 
                                        className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2.5 py-1.5 rounded-lg border border-gray-300 cursor-pointer"
                                    >
                                        Auto-select {posterLayout}
                                    </button>
                                    <button 
                                        onClick={clearProductSelection} 
                                        className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg border border-red-200 cursor-pointer"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                {selectableProducts.length === 0 ? (
                                    <div className="text-xs text-gray-500 py-3 px-2 italic">
                                        No products found matching &quot;{searchTerm}&quot;
                                    </div>
                                ) : (
                                    selectableProducts.map(p => {
                                        const isSelected = selectedProductIds.has(p.id);
                                        const displayPrice = printMode === 'normal_poster' ? p.price : p.offerPrice;
                                        const mrpVal = p.mrp ? parseFloat(p.mrp) : 0;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => toggleProductSelection(p.id)}
                                                className={`flex-shrink-0 flex items-center gap-2 p-2.5 rounded-xl border-2 transition relative text-left w-48 cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-indigo-650 bg-indigo-50/50' 
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <div 
                                                    onClick={(e) => handleOpenEditModal(e, p)}
                                                    className="relative w-9 h-9 bg-gray-50 rounded-lg overflow-hidden border border-gray-150 flex-shrink-0 cursor-pointer group/pickerImg"
                                                    title="Click image to edit image, price & MRP"
                                                >
                                                    <img src={getProxiedImageUrl(p.image)} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pickerImg:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px]">
                                                        <FaPencilAlt />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-800 truncate leading-snug">{p.name}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className="text-[10px] text-indigo-655 font-extrabold">₹{displayPrice || '0'}</span>
                                                        {printMode === 'normal_poster' && mrpVal > 0 && mrpVal > parseFloat(p.price || 0) && (
                                                            <span className="text-[9px] text-gray-400 line-through">₹{mrpVal}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <span className="absolute top-1.5 right-1.5 bg-indigo-650 text-white p-0.5 rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                                                        <FaCheck />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
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
            <div id="print-offers-container" className={`mx-auto print:p-0 print:max-w-none ${(printMode === 'poster' || printMode === 'normal_poster') ? 'max-w-[210mm] p-2 bg-white' : (layout === 'landscape' ? 'max-w-[297mm] p-2' : 'max-w-[210mm] p-2')}`}>
                
                {(printMode === 'poster' || printMode === 'normal_poster') ? (
                    /* POSTER LAYOUT CONTAINER */
                    <div className="w-full h-[297mm] flex flex-col bg-white overflow-hidden select-none border border-gray-150 shadow-sm relative">
                        
                        {/* Top HR Bars (Green 10px & Red 5px with narrow space) */}
                        <div className="w-full flex-shrink-0 flex flex-col gap-[2px] z-20">
                            <div className="w-full h-[10px] bg-[#16a34a]" />
                            <div className="w-full h-[5px] bg-[#e11b22]" />
                        </div>

                        {/* Top Poster Banner */}
                        <div className="w-full h-[55mm] relative flex-shrink-0 bg-white">
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
                                        {decorImage !== 'none' && (
                                            <img 
                                                src={decorImage || "/images/fruit_basket.png"} 
                                                alt="Header Decoration" 
                                                className="h-full object-contain max-h-[50mm] drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
                                            />
                                        )}
                                    </div>

                                    {/* Center: Title & Validity (Click to edit header text & validity) */}
                                    <div 
                                        onClick={() => setEditingHeaderModal(true)}
                                        className="flex flex-col items-center justify-center text-center flex-1 max-w-[45%] z-10 leading-none group/headerEdit cursor-pointer hover:bg-black/5 p-1 rounded-xl transition relative"
                                        title="Click to edit Header Text, Fonts & Validity"
                                    >
                                        <div className="absolute -top-2.5 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md opacity-0 group-hover/headerEdit:opacity-100 transition-opacity print:hidden flex items-center gap-1 pointer-events-none z-30 whitespace-nowrap">
                                            <FaPencilAlt className="text-[8px] text-yellow-300" /> Click to Edit Header Text & Validity
                                        </div>
                                        
                                        {/* Date/Validity on top */}
                                        <div className="text-black font-extrabold text-xs sm:text-sm tracking-widest mb-1.5 font-sans">
                                            {posterSubtitle}
                                        </div>

                                        {/* Header Title with Custom Fonts (Vintage for Line 1, Headline for Line 2) */}
                                        {(() => {
                                            if (!posterTitle) return null;
                                            const titleLines = posterTitle.includes('\n') 
                                                ? posterTitle.split('\n').map(l => l.trim()).filter(Boolean)
                                                : [posterTitle.trim()];

                                            if (titleLines.length === 0) return null;

                                            return (
                                                <div className="flex flex-col items-center justify-center leading-[0.9] py-1">
                                                    {titleLines.map((lineText, idx) => {
                                                        const isSecondLine = idx === 1;
                                                        const isOdd = idx % 2 === 1;

                                                        let fontStyleClass = 'font-vintage';
                                                        let fontFamilyStyle = "'Pacifico', cursive";
                                                        let textStroke = '1.2px #ffffff';
                                                        let fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');

                                                        // 1. Font Family & Size selection
                                                        if (headerStyle === 'vintage_headline') {
                                                            if (isSecondLine) {
                                                                fontStyleClass = 'font-headline';
                                                                fontFamilyStyle = "'Dancing Script', cursive";
                                                                textStroke = '0.8px #ffffff';
                                                                fontSize = lineText.length > 15 ? '32px' : (lineText.length > 10 ? '42px' : '52px');
                                                            } else {
                                                                fontStyleClass = 'font-vintage';
                                                                fontFamilyStyle = "'Pacifico', cursive";
                                                                textStroke = '1.2px #ffffff';
                                                                fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');
                                                            }
                                                        } else if (headerStyle === 'modern_montserrat') {
                                                            fontStyleClass = 'font-montserrat font-black';
                                                            fontFamilyStyle = "'Montserrat', sans-serif";
                                                            textStroke = '1.5px #ffffff';
                                                            fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');
                                                        } else if (headerStyle === 'modern_bebas') {
                                                            fontStyleClass = 'font-bebas tracking-wider';
                                                            fontFamilyStyle = "'Bebas Neue', sans-serif";
                                                            textStroke = '1px #ffffff';
                                                            fontSize = lineText.length > 15 ? '32px' : (lineText.length > 10 ? '42px' : '54px');
                                                        } else if (headerStyle === 'modern_righteous') {
                                                            fontStyleClass = 'font-righteous';
                                                            fontFamilyStyle = "'Righteous', cursive";
                                                            textStroke = '1.2px #ffffff';
                                                            fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');
                                                        } else if (headerStyle === 'modern_poppins') {
                                                            fontStyleClass = 'font-poppins font-black';
                                                            fontFamilyStyle = "'Poppins', sans-serif";
                                                            textStroke = '1.2px #ffffff';
                                                            fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');
                                                        } else if (headerStyle === 'modern_oswald') {
                                                            fontStyleClass = 'font-oswald font-bold tracking-wide';
                                                            fontFamilyStyle = "'Oswald', sans-serif";
                                                            textStroke = '1px #ffffff';
                                                            fontSize = lineText.length > 15 ? '30px' : (lineText.length > 10 ? '38px' : '48px');
                                                        } else if (headerStyle === 'vintage') {
                                                            fontStyleClass = 'font-vintage';
                                                            fontFamilyStyle = "'Pacifico', cursive";
                                                            fontSize = lineText.length > 15 ? '26px' : (lineText.length > 10 ? '34px' : '44px');
                                                        } else if (headerStyle === 'headline') {
                                                            fontStyleClass = 'font-headline';
                                                            fontFamilyStyle = "'Dancing Script', cursive";
                                                            textStroke = '0.8px #ffffff';
                                                            fontSize = lineText.length > 15 ? '32px' : (lineText.length > 10 ? '42px' : '52px');
                                                        } else {
                                                            fontStyleClass = 'font-anton';
                                                            fontFamilyStyle = "'Anton', sans-serif";
                                                            fontSize = lineText.length > 15 ? '28px' : (lineText.length > 10 ? '36px' : '48px');
                                                        }

                                                        // 2. Color Theme Selection
                                                        let textColorClass = 'text-[#16a34a]';
                                                        let shadowClass = 'drop-shadow-[0_3px_0_#15803d] drop-shadow-[0_4px_0_#14532d]';

                                                        if (headerColorTheme === 'black_white') {
                                                            textColorClass = isOdd ? 'text-white' : 'text-black';
                                                            textStroke = isOdd ? '1.5px #000000' : '1.5px #ffffff';
                                                            shadowClass = isOdd 
                                                                ? 'drop-shadow-[0_2px_0_#000000] drop-shadow-[0_3px_0_#000000]' 
                                                                : 'drop-shadow-[0_2px_0_#444444] drop-shadow-[0_3px_0_#666666]';
                                                        } else if (headerColorTheme === 'solid_black') {
                                                            textColorClass = 'text-black';
                                                            textStroke = '1.5px #ffffff';
                                                            shadowClass = 'drop-shadow-[0_2px_0_#333333] drop-shadow-[0_3px_0_#555555]';
                                                        } else if (headerColorTheme === 'solid_white') {
                                                            textColorClass = 'text-white';
                                                            textStroke = '1.5px #000000';
                                                            shadowClass = 'drop-shadow-[0_2px_0_#000000] drop-shadow-[0_3px_0_#000000]';
                                                        } else if (headerColorTheme === 'black_gold') {
                                                            textColorClass = isOdd ? 'text-[#d97706]' : 'text-black';
                                                            textStroke = '1.5px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_2px_0_#92400e]' : 'drop-shadow-[0_2px_0_#333333]';
                                                        } else if (headerColorTheme === 'red_yellow') {
                                                            textColorClass = isOdd ? 'text-[#eab308]' : 'text-[#e11b22]';
                                                            textStroke = '1.5px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_2px_0_#854d0e]' : 'drop-shadow-[0_2px_0_#991b1b]';
                                                        } else if (headerColorTheme === 'blue_indigo') {
                                                            textColorClass = isOdd ? 'text-[#4338ca]' : 'text-[#1d4ed8]';
                                                            textStroke = '1.5px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_2px_0_#312e81]' : 'drop-shadow-[0_2px_0_#1e40af]';
                                                        } else if (headerColorTheme === 'solid_red') {
                                                            textColorClass = 'text-[#e11b22]';
                                                            textStroke = '1.5px #ffffff';
                                                            shadowClass = 'drop-shadow-[0_2px_0_#991b1b]';
                                                        } else {
                                                            // Default Brand Colors
                                                            textColorClass = isOdd ? 'text-[#ea580c]' : 'text-[#16a34a]';
                                                            shadowClass = isOdd 
                                                                ? 'drop-shadow-[0_2px_0_#b45309] drop-shadow-[0_3px_0_#7c2d12]' 
                                                                : 'drop-shadow-[0_3px_0_#15803d] drop-shadow-[0_4px_0_#14532d]';
                                                        }

                                                        return (
                                                            <span 
                                                                key={idx}
                                                                className={`${fontStyleClass} tracking-tight text-center ${textColorClass} filter ${shadowClass} ${idx > 0 ? '-mt-1' : ''}`}
                                                                style={{ 
                                                                    fontFamily: fontFamilyStyle,
                                                                    fontSize,
                                                                    WebkitTextStroke: textStroke, 
                                                                    paintOrder: 'stroke fill',
                                                                }}
                                                            >
                                                                {lineText}
                                                            </span>
                                                        );
                                                    })}
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
                                                    <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center border border-green-200 mb-0.5">
                                                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
                                                        </svg>
                                                    </div>
                                                    <span className="text-[13px] font-black text-primary tracking-tight leading-none">Smile</span>
                                                    <span className="text-[10px] font-black text-orange-600 tracking-tight leading-none mt-0.5">Kakkad</span>
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
                            className={`grid ${posterLayout === '12' ? 'grid-cols-3' : (posterLayout === '16' ? 'grid-cols-4' : 'grid-cols-2')} flex-grow animate-fadeIn bg-white`}
                        >
                            {paddedProducts.map((product, index) => {
                                const isPlaceholder = product.isPlaceholder;
                                const isNormalPoster = printMode === 'normal_poster';
                                const mrpVal = product.mrp ? parseFloat(product.mrp) : 0;
                                const sellingPrice = isNormalPoster 
                                    ? (product.price ? parseFloat(product.price) : 0) 
                                    : (product.offerPrice ? parseFloat(product.offerPrice) : 0);

                                const savingsVal = (mrpVal > 0 ? mrpVal : 0) - sellingPrice;
                                const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                                const hasSavings = mrpVal > 0 && savingsVal > 0;
                                const discountPercent = hasSavings ? Math.round((savingsVal / mrpVal) * 100) : 0;

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
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{isNormalPoster ? 'Empty Product Slot' : 'Empty Offer Slot'}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Select a product to fill this poster position.</p>
                                            </div>
                                        ) : (
                                            /* Active Card */
                                            <>
                                                {/* Top Badges Bar (MRP & Save % OFF) */}
                                                <div 
                                                    className="absolute z-[10] flex items-center justify-center gap-2 pointer-events-none"
                                                    style={{
                                                        top: '12px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: 'max-content',
                                                        maxWidth: '95%'
                                                    }}
                                                >
                                                    {/* MRP Badge */}
                                                    {mrpVal > 0 && mrpVal > sellingPrice ? (
                                                        <div 
                                                            className="bg-[#ffff00] text-black border-none font-extrabold uppercase px-2 py-0.5 tracking-wide line-through whitespace-nowrap pointer-events-auto shrink-0"
                                                            style={{ 
                                                                fontSize: getDiscountFontSize(posterLayout),
                                                                fontFamily: 'var(--font-sans), sans-serif',
                                                                textDecorationColor: '#000000',
                                                                lineHeight: '1.1'
                                                            }}
                                                        >
                                                            MRP {mrpVal.toFixed(2)}
                                                        </div>
                                                    ) : null}

                                                    {/* Save Badge */}
                                                    {hasSavings ? (
                                                        <div 
                                                            className="bg-[#e11b22] text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-wide shadow-sm whitespace-nowrap pointer-events-auto shrink-0"
                                                            style={{ 
                                                                fontSize: getDiscountFontSize(posterLayout),
                                                                fontFamily: 'var(--font-sans), sans-serif',
                                                                lineHeight: '1.1'
                                                            }}
                                                        >
                                                            {discountPercent}% OFF
                                                        </div>
                                                    ) : null}
                                                </div>

                                                {/* Image Wrapper (Click image to edit image, price & MRP) */}
                                                {showProductImages && (
                                                    <div 
                                                        onClick={(e) => handleOpenEditModal(e, product)}
                                                        className="absolute inset-0 z-[1] flex items-center justify-center bg-transparent p-2.5 box-border cursor-pointer group/img"
                                                        title="Click product image to edit image, price & MRP"
                                                    >
                                                        <img
                                                            src={getProxiedImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="max-w-[85%] max-h-[85%] object-contain animate-fadeIn transition-transform group-hover/img:scale-105"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <div className="absolute top-2 left-2 bg-black/65 text-white text-[9px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 print:hidden pointer-events-none shadow-md z-[5]">
                                                            <FaPencilAlt className="text-[8px] text-yellow-300" /> Edit Image / Price / MRP
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Red circular price badge overlapping the image */}
                                                {(() => {
                                                    const { size, rupeeSize, integerSize, decimalSize, rightOffset, topOffset } = getPosterBadgeStyle(posterLayout);
                                                    const priceVal = sellingPrice;
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
                                                        className="font-extrabold tracking-tight text-black leading-none text-center" 
                                                        style={{ 
                                                            ...getPosterDynamicTitleStyle(product.name, posterLayout),
                                                            fontFamily: 'var(--font-sans), sans-serif'
                                                        }}
                                                    >
                                                        {product.name}
                                                    </h2>
                                                    {product.unit && (
                                                        <div 
                                                            className="text-blue-800 font-extrabold text-xs uppercase mt-0.5 text-center"
                                                            style={{
                                                                WebkitTextStroke: '0.8px #ffffff',
                                                                paintOrder: 'stroke fill',
                                                                textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff'
                                                            }}
                                                        >
                                                            / {product.unit.toUpperCase()}
                                                        </div>
                                                    )}
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
                        <div className="w-full bg-[#143d1a] text-white flex flex-col items-center justify-center p-3 select-none flex-shrink-0 leading-tight">
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

                        {/* Bottom HR Bars (Green 10px & Red 5px with narrow space) */}
                        <div className="w-full flex-shrink-0 flex flex-col gap-[2px] z-20">
                            <div className="w-full h-[10px] bg-[#16a34a]" />
                            <div className="w-full h-[5px] bg-[#e11b22]" />
                        </div>
                    </div>
                ) : (
                    /* STANDARD TAG SHEETS CONTAINER */
                    <div className="flex flex-col gap-6 print:gap-0">
                        {(() => {
                            const itemsPerPage = layout === 'landscape' ? 16 : 15;
                            const cardHeight = layout === 'landscape' ? '47.5mm' : '54mm';
                            
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

                            // Chunk products into pages/sheets
                            const pages = [];
                            for (let i = 0; i < sheetProducts.length; i += itemsPerPage) {
                                pages.push(sheetProducts.slice(i, i + itemsPerPage));
                            }

                            return pages.map((pageProducts, pageIdx) => (
                                <div 
                                    key={`sheet-page-${pageIdx}`}
                                    className="w-full flex flex-col bg-white overflow-hidden page-break-after-always print:break-after-page shadow-sm print:shadow-none border border-gray-150 print:border-none relative"
                                    style={{
                                        height: layout === 'landscape' ? '210mm' : '297mm',
                                        maxHeight: layout === 'landscape' ? '210mm' : '297mm',
                                        breakAfter: pageIdx < pages.length - 1 ? 'page' : 'auto',
                                        pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto'
                                    }}
                                >
                                    {/* Top HR Bars (Green 10px & Red 5px with narrow space) */}
                                    <div className="w-full flex-shrink-0 flex flex-col gap-[2px] z-20">
                                        <div className="w-full h-[10px] bg-[#16a34a]" />
                                        <div className="w-full h-[5px] bg-[#e11b22]" />
                                    </div>

                                    {/* Sheet Grid */}
                                    <div className={`grid gap-0 print:gap-0 border-none flex-grow ${layout === 'landscape' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                        {pageProducts.map((product, index) => {
                                            const isPlaceholder = product.isPlaceholder;
                                            const mrpVal = product.mrp ? parseFloat(product.mrp) : 0;
                                            const savingsVal = (mrpVal > 0 ? mrpVal : 0) - parseFloat(product.offerPrice || 0);
                                            const savings = isNaN(savingsVal) ? "0" : savingsVal.toFixed(0);
                                            const hasSavings = mrpVal > 0 && savings > 0;

                                            return (
                                                <div
                                                    key={product.id}
                                                    id={`offer-card-${product.id}`}
                                                    className="border-none p-1 flex flex-col items-center justify-between text-center page-break-inside-avoid relative overflow-hidden bg-white group"
                                                    style={{
                                                        height: cardHeight
                                                    }}
                                                >
                                                    {isPlaceholder ? (
                                                        /* Empty placeholder cell to maintain print shape for trimming */
                                                        <div className="w-full h-full bg-white" />
                                                    ) : (
                                                        /* Active tag card */
                                                        <>
                                                            {/* Top Badges Bar (MRP & Save % OFF) */}
                                                            <div 
                                                                className="absolute z-[10] flex items-center justify-center gap-1.5 pointer-events-none"
                                                                style={{
                                                                    top: '8px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)',
                                                                    width: 'max-content',
                                                                    maxWidth: '95%'
                                                                }}
                                                            >
                                                                {/* MRP Badge */}
                                                                {mrpVal > 0 ? (
                                                                    <div 
                                                                        className="bg-[#ffff00] text-black border-none font-extrabold uppercase px-1.5 py-0.5 tracking-wide line-through whitespace-nowrap pointer-events-auto shrink-0"
                                                                        style={{ 
                                                                            fontSize: '11px',
                                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                                            textDecorationColor: '#000000',
                                                                            lineHeight: '1.1'
                                                                        }}
                                                                    >
                                                                        MRP {mrpVal.toFixed(2)}
                                                                    </div>
                                                                ) : null}

                                                                {/* Save Badge */}
                                                                {hasSavings ? (
                                                                    <div 
                                                                        className="bg-red-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide shadow-sm whitespace-nowrap pointer-events-auto shrink-0"
                                                                        style={{ 
                                                                            fontSize: '11px',
                                                                            fontFamily: 'var(--font-sans), sans-serif',
                                                                            lineHeight: '1.1'
                                                                        }}
                                                                    >
                                                                        {Math.round(((mrpVal - parseFloat(product.offerPrice || 0)) / mrpVal) * 100)}% OFF
                                                                    </div>
                                                                ) : null}
                                                            </div>

                                                            {/* Image Wrapper */}
                                                            {showProductImages && (
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
                                                            )}

                                                            {/* Card Details Block */}
                                                            <div 
                                                                className="absolute inset-0 z-[2] flex flex-col justify-center items-center bg-transparent p-3 box-border text-center"
                                                            >
                                                                {product.brand && (
                                                                    <span className="font-bold uppercase tracking-wider mb-0.5" style={{ fontSize: '9px', color: '#9ca3af', textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff' }}>
                                                                        {product.brand}
                                                                    </span>
                                                                )}
                                                                <h2 className="font-black leading-tight tracking-tight text-center" style={getDynamicTitleStyle(product.name, layout === 'landscape')}>
                                                                    {product.name}
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
                                        })}
                                    </div>

                                    {/* Bottom HR Bars (Green 10px & Red 5px with narrow space) */}
                                    <div className="w-full flex-shrink-0 flex flex-col gap-[2px] z-20">
                                        <div className="w-full h-[10px] bg-[#16a34a]" />
                                        <div className="w-full h-[5px] bg-[#e11b22]" />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: ${(printMode === 'poster' || printMode === 'normal_poster') ? 'A4 portrait' : (layout === 'landscape' ? 'A4 landscape' : 'A4 portrait')};
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
            {/* Quick Edit Header Modal */}
            {editingHeaderModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fadeIn print:hidden">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-scaleUp">
                        <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                                    <FaPencilAlt className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-900 leading-tight">Edit Header Text</h3>
                                    <p className="text-xs text-indigo-600 font-bold">Customize Poster Title, Fonts & Validity</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setEditingHeaderModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-gray-600 tracking-wider mb-1">
                                    Thick Main Header (Title)
                                </label>
                                <textarea
                                    rows={3}
                                    value={posterTitle}
                                    onChange={(e) => setPosterTitle(e.target.value)}
                                    placeholder={"e.g.\nSMILE\nHYPERMARKET"}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black resize-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-[10px] text-gray-400 mt-0.5">Line 1 uses Vintage font, Line 2 uses Headline font. Press Enter for line breaks.</p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-gray-600 tracking-wider mb-1">
                                    Header Font Style
                                </label>
                                <select
                                    value={headerStyle}
                                    onChange={(e) => setHeaderStyle(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black cursor-pointer"
                                >
                                    <option value="vintage_headline">Line 1 Vintage + Line 2 Headline</option>
                                    <option value="modern_montserrat">Modern Ultra-Bold (Montserrat)</option>
                                    <option value="modern_bebas">Modern Tall Headline (Bebas Neue)</option>
                                    <option value="modern_righteous">Modern Geometric (Righteous)</option>
                                    <option value="modern_poppins">Modern Heavy (Poppins)</option>
                                    <option value="modern_oswald">Modern Clean Condensed (Oswald)</option>
                                    <option value="vintage">Vintage Script (Pacifico)</option>
                                    <option value="headline">Headline Script (Dancing Script)</option>
                                    <option value="anton">3D Block Font (Anton)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-gray-600 tracking-wider mb-1">
                                    Header Font Colors
                                </label>
                                <select
                                    value={headerColorTheme}
                                    onChange={(e) => setHeaderColorTheme(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black cursor-pointer"
                                >
                                    <option value="brand">Brand Colors (Green & Orange)</option>
                                    <option value="black_white">Black & White (High Contrast)</option>
                                    <option value="solid_black">Solid Black</option>
                                    <option value="solid_white">Solid White</option>
                                    <option value="black_gold">Black & Gold</option>
                                    <option value="red_yellow">Red & Yellow</option>
                                    <option value="blue_indigo">Deep Blue & Indigo</option>
                                    <option value="solid_red">Solid Crimson Red</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-gray-600 tracking-wider mb-1">
                                    Offer Duration / Validity Text
                                </label>
                                <input
                                    type="text"
                                    value={posterSubtitle}
                                    onChange={(e) => setPosterSubtitle(e.target.value)}
                                    placeholder="e.g. OFFER VALIDITY: 14TH TO 20TH JULY"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setEditingHeaderModal(false)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Edit Price, MRP & Image Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fadeIn print:hidden">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scaleUp">
                        <div className="flex justify-between items-start border-b border-gray-150 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img src={getProxiedImageUrl(editImage)} className="w-full h-full object-contain p-0.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-900 leading-tight line-clamp-1">{editingProduct.name}</h3>
                                    <p className="text-xs text-indigo-600 font-bold mt-0.5">Edit Poster Image, Price & MRP</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Edit Product Image Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-extrabold uppercase text-gray-600 tracking-wider">Product Image</label>
                                    {editImage && (
                                        <button
                                            type="button"
                                            onClick={() => setEditImage('')}
                                            className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <FaTrash className="w-2.5 h-2.5" /> Clear Image
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-300 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-xs">
                                        <img src={getProxiedImageUrl(editImage)} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="flex-1 space-y-1.5 min-w-0">
                                        {/* Upload from Local Device / Drive File */}
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleEditImageUpload}
                                                className="hidden" 
                                                id="edit-product-file-input"
                                            />
                                            <label 
                                                htmlFor="edit-product-file-input" 
                                                className="w-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-1.5 px-3 rounded-lg font-bold text-xs text-center cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5"
                                                title="Upload image from your local drive/device (Temporary for poster or saved to DB)"
                                            >
                                                <FaImage className="text-xs" /> Upload from Computer / My Drive
                                            </label>
                                        </div>
                                        {/* Google Drive or Web Image URL */}
                                        <div>
                                            <input
                                                type="text"
                                                value={editImage}
                                                onChange={handleEditImageUrlChange}
                                                placeholder="Or paste Google Drive share link / Image URL"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                    💡 <strong className="text-gray-700">Temporary:</strong> Upload from computer/drive for current poster. <strong className="text-gray-700">Permanent:</strong> Paste Google Drive share link & check &quot;Also update in Database&quot; below.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-extrabold uppercase text-gray-600 mb-1.5">MRP (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editMrp}
                                        onChange={(e) => setEditMrp(e.target.value)}
                                        placeholder="e.g. 150"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold uppercase text-gray-600 mb-1.5">Normal Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        placeholder="e.g. 120"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {printMode === 'poster' && (
                                <div>
                                    <label className="block text-xs font-extrabold uppercase text-gray-600 mb-1.5">Offer Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editOfferPrice}
                                        onChange={(e) => setEditOfferPrice(e.target.value)}
                                        placeholder="e.g. 99"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-indigo-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                                    />
                                </div>
                            )}

                            {/* Calculation Preview Pill */}
                            {(() => {
                                const mrpNum = parseFloat(editMrp) || 0;
                                const priceNum = printMode === 'poster' ? (parseFloat(editOfferPrice) || 0) : (parseFloat(editPrice) || 0);
                                const diff = mrpNum - priceNum;
                                const offPercent = mrpNum > 0 && diff > 0 ? Math.round((diff / mrpNum) * 100) : 0;

                                return (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
                                        <span className="font-bold text-emerald-800">Poster Card Preview:</span>
                                        <span className="font-extrabold text-emerald-900">
                                            {mrpNum > 0 && diff > 0 ? `Save ₹${diff.toFixed(2)} (${offPercent}% OFF)` : `Selling Price: ₹${priceNum.toFixed(2)}`}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Save to Firestore Checkbox */}
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={saveToDb}
                                    onChange={(e) => setSaveToDb(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span>Also update in Database (permanently)</span>
                            </label>
                        </div>

                        <div className="flex gap-2 justify-between items-center pt-2 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={handleDeleteProductFromDb}
                                disabled={deletingProduct || savingPrice}
                                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                title="Permanently delete this product from database"
                            >
                                <FaTrash className="w-3 h-3 text-red-500" /> {deletingProduct ? 'Deleting...' : 'Delete from DB'}
                            </button>

                            <div className="flex gap-2 items-center">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePriceEdit}
                                    disabled={savingPrice || deletingProduct}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {savingPrice ? 'Saving...' : 'Apply Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
