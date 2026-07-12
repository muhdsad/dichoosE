import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getDirectDriveLink } from '../utils/productUtils';

const DietaryIndicator = ({ type }) => {
    if (!type || type === 'None') return null;
    
    let borderColor = 'border-green-600';
    let dotColor = 'bg-green-600';
    let label = 'Veg';
    
    if (type === 'Non-Veg') {
        borderColor = 'border-red-600';
        dotColor = 'bg-red-600';
        label = 'Non-Veg';
    } else if (type === 'Egg') {
        borderColor = 'border-yellow-600';
        dotColor = 'bg-yellow-600';
        label = 'Contains Egg';
    } else if (type === 'Vegan') {
        borderColor = 'border-green-800';
        dotColor = 'bg-green-800';
        label = 'Vegan';
    }

    return (
        <span className="inline-flex items-center gap-1.5" title={label}>
            <span className={`w-4 h-4 border-2 ${borderColor} flex items-center justify-center p-0.5 rounded-sm bg-white`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            </span>
        </span>
    );
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product);
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to product page
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    // Check for active time-based offer
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

    return (
        <div className="group block h-full bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-xl relative">
            <div className="relative h-64 w-full bg-gray-200">
                <Link href={`/products/${product.id}`} className="block w-full h-full">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover object-center group-hover:opacity-75 transition-opacity"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                            No Image
                        </div>
                    )}
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 shadow-sm transition-transform hover:scale-110"
                    title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    {isInWishlist(product.id) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                </button>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        onClick={handleAddToCart}
                        className="pointer-events-auto bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        title="Add to Cart"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <FaShoppingCart className="w-6 h-6" />
                    </button>
                </div>
                {/* Sale Badge */}
                {hasOffer && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        LIMITED OFFER
                    </div>
                )}
            </div>
            <div className="p-4">
                {/* Brand & Dietary Tag */}
                <div className="flex items-center justify-between mb-1">
                    {product.brand ? (
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            {product.brand}
                        </span>
                    ) : (
                        <span />
                    )}
                    {product.dietary && product.dietary !== 'None' && (
                        <DietaryIndicator type={product.dietary} />
                    )}
                </div>
                <Link href={`/products/${product.id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors cursor-pointer line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                <p className="mt-1 text-xs text-gray-500">
                    {product.categories && product.categories.length > 0
                        ? product.categories.join(', ')
                        : product.category}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                    {product.unit && <span>{product.unit}</span>}
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <span className="text-xl font-bold text-gray-900">₹{Number(displayPrice || 0).toFixed(2)}</span>
                        {oldPrice && oldPrice > displayPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">₹{Number(oldPrice || 0).toFixed(2)}</span>
                        )}
                    </div>
                    {oldPrice && oldPrice > displayPrice && (
                        <span className="text-xs font-bold text-green-600 bg-green-100 py-1 px-2 rounded-full">
                            {Math.round(((oldPrice - displayPrice) / oldPrice) * 100)}% OFF
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
