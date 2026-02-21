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

/**
 * Converts a Google Drive share link into a direct image/thumbnail link.
 * 
 * @param {string} url - The original URL
 * @returns {string} - The direct image/thumbnail URL
 */
export const getDirectDriveLink = (url) => {
    if (!url) return '';

    try {
        // Handle standard view link: /file/d/ID/view
        if (url.includes('drive.google.com') && url.includes('/file/d/')) {
            const id = url.split('/file/d/')[1].split('/')[0];
            return `https://drive.google.com/thumbnail?id=${id}&sz=w500`;
        }

        // Handle open link: open?id=ID
        if (url.includes('drive.google.com') && url.includes('id=')) {
            const searchParams = new URL(url).searchParams;
            const id = searchParams.get('id');
            if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w500`;
        }
    } catch (e) {
        console.error("Failed to parse drive URL:", url, e);
    }

    return url;
};
