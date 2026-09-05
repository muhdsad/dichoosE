"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaRegHeart, FaCheck, FaPercentage } from 'react-icons/fa';
import { getDirectDriveLink } from '../utils/productUtils';
import { useState } from 'react';

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
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200" title={label}>
            <span className={`w-3.5 h-3.5 border-2 ${borderColor} flex items-center justify-center p-0.5 rounded-xs bg-white`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            </span>
            <span>{label}</span>
        </span>
    );
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    // Calculate dynamic pricing & discount
    const now = new Date();
    let displayPrice = Number(product.price) || 0;
    let oldPrice = product.mrp ? Number(product.mrp) : null;
    let hasOffer = false;

    if (product.offerPrice) {
        const offerStart = product.offerStart ? new Date(product.offerStart) : null;
        const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;
        const isStarted = !offerStart || now >= offerStart;
        const isEnded = offerEnd && now > offerEnd;

        if (isStarted && !isEnded) {
            displayPrice = Number(product.offerPrice) || 0;
            oldPrice = Number(product.price) || 0;
            hasOffer = true;
        }
    }

    const imageUrl = product.image ? getDirectDriveLink(product.image) : null;
    const discountPercent = oldPrice && oldPrice > displayPrice ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100) : 0;

    return (
        <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-glow hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
            {/* Image Box */}
            <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                <Link href={`/products/${product.id}`} className="block w-full h-full">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                            No Image Available
                        </div>
                    )}
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200 ${
                        isInWishlist(product.id)
                            ? 'text-red-500 bg-red-50'
                            : 'text-slate-400 hover:text-red-500 hover:bg-white'
                    } hover:scale-110 active:scale-95`}
                    title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    {isInWishlist(product.id) ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                </button>

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {hasOffer && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse-subtle flex items-center gap-1">
                            🔥 Special Deal
                        </span>
                    )}
                    {discountPercent > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <FaPercentage className="text-[8px]" /> {discountPercent}% OFF
                        </span>
                    )}
                </div>

                {/* Floating Quick Add Button */}
                <div className="absolute bottom-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleAddToCart}
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center active:scale-90 ${
                            added
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                                : 'gradient-emerald text-white hover:shadow-emerald-500/30 hover:scale-105'
                        }`}
                        title="Add to Cart"
                    >
                        {added ? <FaCheck size={14} /> : <FaShoppingCart size={14} />}
                    </button>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    {/* Brand & Dietary Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        {product.brand ? (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                {product.brand}
                            </span>
                        ) : (
                            <span className="text-[11px] text-slate-600 font-medium">Daily Grocery</span>
                        )}
                        {product.dietary && product.dietary !== 'None' && (
                            <DietaryIndicator type={product.dietary} />
                        )}
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Unit / Quantity info */}
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>{product.unit || '1 Pack'}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">In Stock</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                            ₹{Number(displayPrice || 0).toFixed(0)}
                        </span>
                        {oldPrice && oldPrice > displayPrice && (
                            <span className="text-xs text-slate-600 line-through">
                                ₹{Number(oldPrice || 0).toFixed(0)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                    >
                        + Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
