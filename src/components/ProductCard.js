import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';

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
    let displayPrice = product.price;
    let oldPrice = product.mrp;
    let hasOffer = false;

    if (product.offerPrice) {
        const offerStart = product.offerStart ? new Date(product.offerStart) : null;
        const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

        const isStarted = !offerStart || now >= offerStart;
        const isEnded = offerEnd && now > offerEnd;

        if (isStarted && !isEnded) {
            displayPrice = product.offerPrice;
            oldPrice = product.price; // The regular selling price becomes the "old" price
            hasOffer = true;
        }
    }

    return (
        <div className="group block h-full bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-xl relative">
            <div className="relative h-64 w-full bg-gray-200">
                <Link href={`/products/${product.id}`} className="block w-full h-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:opacity-75 transition-opacity"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
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
                <Link href={`/products/${product.id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors cursor-pointer">
                        {product.name}
                    </h3>
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                    {product.categories && product.categories.length > 0
                        ? product.categories.join(', ')
                        : product.category}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                    {product.unit && <span>{product.unit}</span>}
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <span className="text-xl font-bold text-gray-900">₹{displayPrice.toFixed(2)}</span>
                        {oldPrice && oldPrice > displayPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">₹{oldPrice.toFixed(2)}</span>
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
