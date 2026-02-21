/**
 * Checks if a product's offer has expired and returns a "cleaned" product object.
 * If the offer has expired, it removes offer-specific fields and tags.
 * 
 * @param {Object} product - The product object from Firestore
 * @returns {Object} - The cleaned product object
 */
export const getCleanProduct = (product) => {
    if (!product) return null;

    const now = new Date();
    const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

    // Check if offer has expired
    const isExpired = offerEnd && now > offerEnd;

    if (isExpired) {
        // Return a copy of the product with offer fields cleared
        const { offerPrice, offerStart, offerEnd: _, ...rest } = product;

        // Remove "Offer" from categories array if it exists
        const cleanedCategories = (product.categories || []).filter(cat => cat !== 'Offer');

        // Handle legacy 'category' field
        const cleanedCategory = product.category === 'Offer' ? (cleanedCategories[0] || '') : product.category;

        return {
            ...rest,
            offerPrice: null,
            offerStart: null,
            offerEnd: null,
            categories: cleanedCategories,
            category: cleanedCategory
        };
    }

    return product;
};
