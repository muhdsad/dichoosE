"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getCleanProduct, getDirectDriveLink, getProductPricing } from '../../../utils/productUtils';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { FaShoppingCart, FaCheck, FaHeart, FaRegHeart, FaTruck, FaShieldAlt, FaLeaf, FaArrowLeft, FaPercentage } from 'react-icons/fa';

const DietaryIndicator = ({ type }) => {
    if (!type || type === 'None') return null;

    let borderColor = 'border-emerald-600';
    let dotColor = 'bg-emerald-600';
    let label = 'Veg';

    if (type === 'Non-Veg') {
        borderColor = 'border-red-600';
        dotColor = 'bg-red-600';
        label = 'Non-Veg';
    } else if (type === 'Egg') {
        borderColor = 'border-amber-500';
        dotColor = 'bg-amber-500';
        label = 'Contains Egg';
    } else if (type === 'Vegan') {
        borderColor = 'border-emerald-800';
        dotColor = 'bg-emerald-800';
        label = 'Vegan';
    }

    return (
        <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700" title={label}>
            <span className={`w-3.5 h-3.5 border-2 ${borderColor} flex items-center justify-center p-0.5 rounded-xs bg-white`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            </span>
            <span>{label}</span>
        </span>
    );
};

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap && docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct(getCleanProduct({ id: docSnap.id, ...data }));
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    const toggleWishlist = () => {
        if (!product) return;
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 px-4">
                <h1 className="text-2xl font-extrabold text-slate-800">Product Not Found</h1>
                <p className="text-slate-500 text-sm mt-1">The requested item might be unavailable or removed.</p>
                <Link href="/products" className="mt-4 gradient-emerald text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md">
                    Back to Shop
                </Link>
            </div>
        );
    }

    // Resolve active pricing
    const pricing = getProductPricing(product);
    const displayPrice = pricing.price;
    const oldPrice = pricing.mrp;
    const hasOffer = pricing.hasOffer;
    const discountPercent = oldPrice && Number(oldPrice) > Number(displayPrice) ? Math.round(((Number(oldPrice) - Number(displayPrice)) / Number(oldPrice)) * 100) : 0;

    return (
        <div className="bg-slate-50 min-h-screen font-sans py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button & Breadcrumbs */}
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
                        <FaArrowLeft className="text-[10px]" /> Back to Products
                    </Link>
                    <div className="text-xs text-slate-400 font-medium">
                        ID: <span className="font-mono text-slate-600">{product.id}</span>
                    </div>
                </div>

                {/* Main Product Card Panel */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden p-6 lg:p-10">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
                        {/* Image Column */}
                        <div className="relative aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                            {product.image ? (
                                <Image
                                    src={getDirectDriveLink(product.image)}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                                    No Image Available
                                </div>
                            )}

                            {/* Floating Wishlist Button */}
                            <button
                                onClick={toggleWishlist}
                                className={`absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-md transition ${
                                    isInWishlist(product.id) ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500'
                                }`}
                                title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                {isInWishlist(product.id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                            </button>

                            {/* Discount Badge Overlay */}
                            {discountPercent > 0 && (
                                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <FaPercentage className="text-[10px]" /> {discountPercent}% SAVINGS
                                </div>
                            )}
                        </div>

                        {/* Product Info Column */}
                        <div className="mt-8 lg:mt-0 flex flex-col justify-between h-full">
                            <div>
                                {/* Brand & Dietary Tag */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    {product.brand ? (
                                        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            {product.brand}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fresh Produce</span>
                                    )}
                                    {product.dietary && product.dietary !== 'None' && (
                                        <DietaryIndicator type={product.dietary} />
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {product.name}
                                </h1>

                                {/* Price Section */}
                                <div className="mt-4 flex items-baseline gap-3 pb-4 border-b border-slate-100">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                                        ₹{Number(displayPrice || 0).toFixed(0)}
                                    </span>
                                    {oldPrice && Number(oldPrice) > Number(displayPrice || 0) && (
                                        <span className="text-base text-slate-400 line-through font-medium">
                                            ₹{Number(oldPrice).toFixed(0)}
                                        </span>
                                    )}
                                    {product.unit && (
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                            Unit: {product.unit}
                                        </span>
                                    )}
                                </div>

                                {/* Stock & Offer status */}
                                <div className="mt-4 flex items-center gap-3">
                                    {product.stock > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In Stock ({product.stock} available)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full">
                                            Out of Stock
                                        </span>
                                    )}
                                    {hasOffer && (
                                        <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                            🔥 Limited Time Price
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <div className="mt-6">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Product Description</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Category & Metadata Specs */}
                                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                                    <div className="flex items-center">
                                        <span className="text-slate-400 font-semibold w-24">Categories:</span>
                                        <span className="text-slate-800 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
                                            {product.categories && product.categories.length > 0 ? product.categories.join(', ') : product.category}
                                        </span>
                                    </div>
                                    {product.location && (
                                        <div className="flex items-center">
                                            <span className="text-slate-400 font-semibold w-24">Aisle Shelf:</span>
                                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded">
                                                {product.location}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Perks */}
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                                        <FaTruck className="text-emerald-600 mx-auto text-sm mb-1" />
                                        <span className="text-[10px] font-bold text-slate-800 block">2-Hr Delivery</span>
                                    </div>
                                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                                        <FaLeaf className="text-emerald-600 mx-auto text-sm mb-1" />
                                        <span className="text-[10px] font-bold text-slate-800 block">100% Farm Fresh</span>
                                    </div>
                                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                                        <FaShieldAlt className="text-emerald-600 mx-auto text-sm mb-1" />
                                        <span className="text-[10px] font-bold text-slate-800 block">Quality Assured</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & CTA Action Buttons */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                {product.stock > 0 ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border-2 border-slate-200 rounded-full p-1 bg-slate-50 shrink-0">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center text-sm font-extrabold text-slate-900">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Add To Cart Button */}
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex-1 w-full py-3.5 px-8 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                                                added
                                                    ? 'bg-emerald-700 ring-4 ring-emerald-200'
                                                    : 'gradient-emerald hover:shadow-emerald-500/30 hover:scale-102 active:scale-95'
                                            }`}
                                        >
                                            {added ? (
                                                <>
                                                    <FaCheck className="text-sm" /> Added to Cart!
                                                </>
                                            ) : (
                                                <>
                                                    <FaShoppingCart className="text-sm" /> Add {quantity} to Cart (₹{(displayPrice * quantity).toFixed(0)})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-slate-200 text-slate-400 py-3.5 px-8 rounded-full font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                                    >
                                        Currently Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
