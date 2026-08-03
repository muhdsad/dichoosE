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
        // Handle lh3 direct link: /d/ID
        if (url.includes('lh3.googleusercontent.com/d/')) {
            const id = url.split('/d/')[1].split('=')[0].split('/')[0];
            return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
        }

        // Handle standard view link: /file/d/ID/view
        if (url.includes('drive.google.com') && url.includes('/file/d/')) {
            const id = url.split('/file/d/')[1].split('/')[0];
            return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
        }

        // Handle open link: open?id=ID
        if (url.includes('drive.google.com') && url.includes('id=')) {
            const searchParams = new URL(url).searchParams;
            const id = searchParams.get('id');
            if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
        }
    } catch (e) {
        console.error("Failed to parse drive URL:", url, e);
    }

    return url;
};

/**
 * Calculates the active price and MRP for a product based on its time-based offers.
 * 
 * @param {Object} product - The product object
 * @returns {Object} - An object containing the active price, old MRP, and whether there is an active offer
 */
export const getProductPricing = (product) => {
    if (!product) return { price: 0, mrp: null, hasOffer: false };

    const now = new Date();
    let price = Number(product.price) || 0;
    let mrp = product.mrp ? Number(product.mrp) : null;
    let hasOffer = false;

    if (product.offerPrice) {
        const offerStart = product.offerStart ? new Date(product.offerStart) : null;
        const offerEnd = product.offerEnd ? new Date(product.offerEnd) : null;

        const isStarted = !offerStart || now >= offerStart;
        const isEnded = offerEnd && now > offerEnd;

        if (isStarted && !isEnded) {
            price = Number(product.offerPrice) || 0;
            mrp = Number(product.price) || 0;
            hasOffer = true;
        }
    }

    return { price, mrp, hasOffer };
};

