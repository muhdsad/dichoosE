"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDirectDriveLink } from '../../../utils/productUtils';
import { FaImage, FaTrash, FaCheck, FaTimes, FaUndo, FaSearch, FaPencilAlt, FaBookmark, FaSave } from 'react-icons/fa';

const getProxiedImageUrl = (url) => {
    if (!url) return '/categories/default.png';
    const directLink = getDirectDriveLink(url);
    if (!directLink) return '/categories/default.png';
    if (directLink.startsWith('/') || directLink.startsWith('data:')) {
        return directLink;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/proxy-image?url=${encodeURIComponent(directLink)}`;
};const getDynamicTitleStyle = (name, layout = 'landscape') => {
    const len = (name || '').length;
    let fontSize = '16px';
    let stroke = '1px #ffffff';

    if (layout === 'landscape_4') {
        stroke = '2.4px #ffffff';
        if (len <= 12) fontSize = '56px';
        else if (len <= 18) fontSize = '48px';
        else if (len <= 28) fontSize = '38px';
        else if (len <= 40) fontSize = '30px';
        else fontSize = '24px';
    } else if (layout === 'landscape_6') {
        stroke = '2px #ffffff';
        if (len <= 12) fontSize = '48px';
        else if (len <= 18) fontSize = '40px';
        else if (len <= 28) fontSize = '32px';
        else if (len <= 40) fontSize = '26px';
        else fontSize = '20px';
    } else if (layout === 'landscape_12') {
        stroke = '1.4px #ffffff';
        if (len <= 12) fontSize = '36px';
        else if (len <= 18) fontSize = '30px';
        else if (len <= 28) fontSize = '24px';
        else if (len <= 40) fontSize = '18px';
        else fontSize = '15px';
    } else if (layout === 'portrait_12') {
        // 3x4 Portrait (12 Tags - Standard Matching Uploaded Tags)
        stroke = '1.4px #ffffff';
        if (len <= 10) fontSize = '30px';
        else if (len <= 16) fontSize = '25px';
        else if (len <= 24) fontSize = '20px';
        else if (len <= 34) fontSize = '16px';
        else fontSize = '13.5px';
    } else if (layout === 'portrait') {
        stroke = '1.2px #ffffff';
        if (len <= 12) fontSize = '30px';
        else if (len <= 18) fontSize = '24px';
        else if (len <= 28) fontSize = '20px';
        else if (len <= 40) fontSize = '16px';
        else fontSize = '13px';
    } else {
        // default 4x4 landscape (16 tags)
        if (len <= 12) fontSize = '28px';
        else if (len <= 18) fontSize = '24px';
        else if (len <= 28) fontSize = '18px';
        else if (len <= 40) fontSize = '14px';
        else fontSize = '12px';
    }

    return {
        fontSize,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1.05',
        color: '#000000',
        textTransform: 'uppercase',
        textAlign: 'center',
        wordBreak: 'break-word',
        WebkitTextStroke: stroke,
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 3px #ffffff, 0px 0px 3px #ffffff, 0px 0px 3px #ffffff'
    };
};

const getDynamicPriceStyle = (price, layout = 'landscape') => {
    const text = `${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let fontSize = '24px';
    let stroke = '1.4px #ffffff';

    if (layout === 'landscape_4') {
        stroke = '2.6px #ffffff';
        if (len <= 6) fontSize = '76px';
        else if (len <= 8) fontSize = '64px';
        else if (len <= 10) fontSize = '52px';
        else fontSize = '42px';
    } else if (layout === 'landscape_6') {
        stroke = '2.2px #ffffff';
        if (len <= 6) fontSize = '64px';
        else if (len <= 8) fontSize = '54px';
        else if (len <= 10) fontSize = '44px';
        else fontSize = '36px';
    } else if (layout === 'landscape_12') {
        stroke = '1.6px #ffffff';
        if (len <= 6) fontSize = '46px';
        else if (len <= 8) fontSize = '38px';
        else if (len <= 10) fontSize = '32px';
        else fontSize = '26px';
    } else if (layout === 'portrait_12') {
        // 3x4 Portrait (12 Tags - Standard Matching Uploaded Tags)
        stroke = '1.6px #ffffff';
        if (len <= 5) fontSize = '44px';
        else if (len <= 7) fontSize = '38px';
        else if (len <= 9) fontSize = '32px';
        else fontSize = '26px';
    } else if (layout === 'portrait') {
        stroke = '1.3px #ffffff';
        if (len <= 6) fontSize = '36px';
        else if (len <= 8) fontSize = '30px';
        else if (len <= 10) fontSize = '25px';
        else fontSize = '21px';
    } else {
        // default 4x4 landscape (16 tags)
        if (len <= 6) fontSize = '30px';
        else if (len <= 8) fontSize = '26px';
        else if (len <= 10) fontSize = '22px';
        else fontSize = '18px';
    }

    return {
        fontSize,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1',
        color: '#000000',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        WebkitTextStroke: stroke,
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 4px #ffffff, 0px 0px 4px #ffffff, 0px 0px 4px #ffffff'
    };
};

const getDynamicUnitStyle = (layout = 'landscape') => {
    let fontSize = '14px';
    let stroke = '1px #ffffff';
    if (layout === 'landscape_4') {
        fontSize = '32px';
        stroke = '1.8px #ffffff';
    } else if (layout === 'landscape_6') {
        fontSize = '26px';
        stroke = '1.5px #ffffff';
    } else if (layout === 'landscape_12') {
        fontSize = '20px';
        stroke = '1.2px #ffffff';
    } else if (layout === 'portrait_12') {
        fontSize = '24px';
        stroke = '1.3px #ffffff';
    } else if (layout === 'portrait') {
        fontSize = '18px';
        stroke = '1.1px #ffffff';
    } else {
        fontSize = '15px';
        stroke = '1px #ffffff';
    }
    return {
        fontSize,
        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
        fontWeight: 'normal',
        lineHeight: '1',
        color: '#000000',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        WebkitTextStroke: stroke,
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 3px #ffffff, 0px 0px 3px #ffffff'
    };
};

const getDynamicUnitFontSize = (layout = 'landscape') => {
    if (layout === 'landscape_4') return '22px';
    if (layout === 'landscape_6') return '18px';
    if (layout === 'landscape_12') return '14px';
    if (layout === 'portrait') return '13px';
    return '11px';
};

const getDynamicBadgeFontSize = (layout = 'landscape') => {
    if (layout === 'landscape_4') return '15px';
    if (layout === 'landscape_6') return '13px';
    if (layout === 'landscape_12') return '11px';
    if (layout === 'portrait_12') return '11px';
    if (layout === 'portrait') return '9.5px';
    return '10px';
};

const getPosterDynamicTitleStyle = (name, layout, isLandscape = false) => {
    const len = (name || '').length;
    let baseSize = isLandscape ? 22 : 24; // Default for '8'
    if (layout === '1') {
        baseSize = isLandscape ? 48 : 60;
    } else if (layout === '2_landscape' || (layout === '2' && isLandscape)) {
        baseSize = 44;
    } else if (layout === '3_landscape' || (layout === '3' && isLandscape)) {
        baseSize = 32;
    } else if (layout === '2_portrait' || layout === '2') {
        baseSize = 38;
    } else if (layout === '4') {
        baseSize = isLandscape ? 36 : 48;
    } else if (layout === '6') {
        baseSize = isLandscape ? 28 : 34;
    } else if (layout === '12') {
        baseSize = isLandscape ? 16 : 18;
    } else if (layout === '16') {
        baseSize = isLandscape ? 12 : 14;
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
        WebkitTextStroke: (layout === '1' || layout === '2_landscape' || layout === '3_landscape' || layout === '2_portrait' || layout === '2' || layout === '4' || layout === '6') ? '1.5px #ffffff' : '1px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 6px #ffffff, 0px 0px 6px #ffffff, 0px 0px 6px #ffffff'
    };
};

const getPosterDynamicPriceStyle = (price, layout) => {
    const text = `₹${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let baseSize = 32; // Default for '8'
    if (layout === '1') {
        baseSize = 96;
    } else if (layout === '2_landscape') {
        baseSize = 72;
    } else if (layout === '3_landscape') {
        baseSize = 52;
    } else if (layout === '2_portrait' || layout === '2') {
        baseSize = 56;
    } else if (layout === '4') {
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
        WebkitTextStroke: (layout === '1' || layout === '2_landscape' || layout === '3_landscape' || layout === '2_portrait' || layout === '2' || layout === '4' || layout === '6') ? '1.8px #ffffff' : '1.2px #ffffff',
        paintOrder: 'stroke fill',
        textShadow: '0px 0px 6px #ffffff, 0px 0px 6px #ffffff, 0px 0px 6px #ffffff'
    };
};

const getPosterHeaderFontSize = (text, idx, totalLines, style, isLandscape, sizeLevel = 'extra_large') => {
    const len = (text || '').length;
    const isCondensed = style === 'modern_bebas' || style === 'anton' || style === 'modern_oswald';
    const isScript = style === 'headline' || (style === 'vintage_headline' && idx === 1);

    let baseSize;
    if (totalLines === 1) {
        if (isCondensed) {
            baseSize = len <= 8 ? 76 : (len <= 14 ? 64 : (len <= 20 ? 52 : 40));
        } else if (isScript) {
            baseSize = len <= 8 ? 72 : (len <= 14 ? 60 : (len <= 20 ? 48 : 38));
        } else {
            baseSize = len <= 8 ? 68 : (len <= 14 ? 56 : (len <= 20 ? 44 : 34));
        }
    } else if (totalLines === 2) {
        if (isCondensed) {
            baseSize = len <= 8 ? 62 : (len <= 14 ? 52 : (len <= 20 ? 42 : 32));
        } else if (isScript) {
            baseSize = len <= 8 ? 64 : (len <= 14 ? 54 : (len <= 20 ? 44 : 34));
        } else {
            baseSize = len <= 8 ? 56 : (len <= 14 ? 46 : (len <= 20 ? 38 : 30));
        }
    } else {
        const lineFactor = Math.max(0.6, 2 / totalLines);
        if (isCondensed) {
            baseSize = Math.round((len <= 8 ? 52 : (len <= 14 ? 42 : (len <= 20 ? 34 : 26))) * lineFactor);
        } else {
            baseSize = Math.round((len <= 8 ? 46 : (len <= 14 ? 38 : (len <= 20 ? 30 : 24))) * lineFactor);
        }
    }

    let multiplier = 1.0;
    if (sizeLevel === 'huge') multiplier = 1.18;
    else if (sizeLevel === 'large') multiplier = 0.88;
    else if (sizeLevel === 'normal') multiplier = 0.75;

    let finalSize = Math.round(baseSize * multiplier);

    if (isLandscape) {
        finalSize = Math.round(finalSize * 0.88);
    }

    return `${finalSize}px`;
};

const getOrdinalSuffix = (n) => {
    const s = ["TH", "ST", "ND", "RD"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatOfferValidity = (startDate, endDate) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    
    const startDay = getOrdinalSuffix(start.getDate());
    const endDay = getOrdinalSuffix(end.getDate());
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (start.toDateString() === end.toDateString()) {
        return `OFFER VALIDITY: ${startDay} ${startMonth}`;
    } else if (startMonth === endMonth && startYear === endYear) {
        return `OFFER VALIDITY: ${startDay} TO ${endDay} ${endMonth}`;
    } else if (startYear === endYear) {
        return `OFFER VALIDITY: ${startDay} ${startMonth} TO ${endDay} ${endMonth}`;
    } else {
        return `OFFER VALIDITY: ${startDay} ${startMonth} ${startYear} TO ${endDay} ${endMonth} ${endYear}`;
    }
};

const toDateInputString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

const getDefaultOfferValidity = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 6);
    return formatOfferValidity(today, nextWeek);
};

const getUnitFontSize = (layout) => {
    if (layout === '1') return '24px';
    if (layout === '2_landscape') return '20px';
    if (layout === '3_landscape') return '14px';
    if (layout === '2_portrait' || layout === '2') return '16px';
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    if (layout === '8') return '12px';
    if (layout === '12') return '10px';
    return '8px';
};

const getBrandFontSize = (layout) => {
    if (layout === '1') return '18px';
    if (layout === '2_landscape') return '16px';
    if (layout === '3_landscape') return '11px';
    if (layout === '2_portrait' || layout === '2') return '13px';
    if (layout === '4') return '14px';
    if (layout === '6') return '11px';
    if (layout === '8') return '10px';
    if (layout === '12') return '8px';
    return '7px';
};

const getMrpFontSize = (layout) => {
    if (layout === '1') return '22px';
    if (layout === '2_landscape') return '20px';
    if (layout === '3_landscape') return '14px';
    if (layout === '2_portrait' || layout === '2') return '16px';
    if (layout === '4') return '18px';
    if (layout === '6') return '14px';
    if (layout === '8') return '12px';
    if (layout === '12') return '10px';
    return '8px';
};

const getDiscountFontSize = (layout, isLandscape = false) => {
    if (layout === '1') return isLandscape ? '18px' : '20px';
    if (layout === '2_landscape') return '18px';
    if (layout === '3_landscape') return '13px';
    if (layout === '2_portrait' || layout === '2') return isLandscape ? '16px' : '15px';
    if (layout === '4') return isLandscape ? '13px' : '16px';
    if (layout === '6') return isLandscape ? '11px' : '13px';
    if (layout === '8') return isLandscape ? '10px' : '11px';
    if (layout === '12') return isLandscape ? '8.5px' : '9px';
    return '8px';
};

const getPosterBadgeStyle = (layout, isLandscape = false) => {
    let size = isLandscape ? 78 : 90;
    let rupeeSize = isLandscape ? 13 : 15;
    let integerSize = isLandscape ? 38 : 44;
    let decimalSize = isLandscape ? 16 : 18;
    let rightOffset = '8%';
    let topOffset = '35%';

    if (layout === '1') {
        size = isLandscape ? 150 : 190;
        rupeeSize = isLandscape ? 26 : 32;
        integerSize = isLandscape ? 76 : 94;
        decimalSize = isLandscape ? 30 : 38;
        rightOffset = '10%';
        topOffset = '30%';
    } else if (layout === '2_landscape' || (layout === '2' && isLandscape)) {
        size = 140;
        rupeeSize = 22;
        integerSize = 68;
        decimalSize = 26;
        rightOffset = '8%';
        topOffset = '28%';
    } else if (layout === '3_landscape' || (layout === '3' && isLandscape)) {
        size = 105;
        rupeeSize = 17;
        integerSize = 50;
        decimalSize = 20;
        rightOffset = '6%';
        topOffset = '28%';
    } else if (layout === '2_portrait' || layout === '2') {
        size = 125;
        rupeeSize = 20;
        integerSize = 60;
        decimalSize = 24;
        rightOffset = '8%';
        topOffset = '35%';
    } else if (layout === '4') {
        size = isLandscape ? 105 : 135;
        rupeeSize = isLandscape ? 17 : 22;
        integerSize = isLandscape ? 50 : 64;
        decimalSize = isLandscape ? 20 : 26;
        rightOffset = isLandscape ? '8%' : '12%';
        topOffset = '35%';
    } else if (layout === '6') {
        size = isLandscape ? 92 : 110;
        rupeeSize = isLandscape ? 15 : 18;
        integerSize = isLandscape ? 44 : 52;
        decimalSize = isLandscape ? 18 : 22;
        rightOffset = isLandscape ? '7%' : '10%';
        topOffset = '35%';
    } else if (layout === '8') {
        size = isLandscape ? 78 : 90;
        rupeeSize = isLandscape ? 13 : 15;
        integerSize = isLandscape ? 38 : 44;
        decimalSize = isLandscape ? 16 : 18;
        rightOffset = isLandscape ? '6%' : '8%';
        topOffset = '35%';
    } else if (layout === '12') {
        size = isLandscape ? 60 : 72;
        rupeeSize = isLandscape ? 10 : 12;
        integerSize = isLandscape ? 28 : 34;
        decimalSize = isLandscape ? 12 : 14;
        rightOffset = isLandscape ? '5%' : '6%';
        topOffset = '35%';
    } else if (layout === '16') {
        size = 52;
        rupeeSize = 9;
        integerSize = 24;
        decimalSize = 10;
        rightOffset = '5%';
        topOffset = '35%';
    }

    return { size, rupeeSize, integerSize, decimalSize, rightOffset, topOffset };
};

const getPosterCols = (layout, isLandscape) => {
    if (isLandscape) {
        if (layout === '1') return 1;
        if (layout === '2' || layout === '2_landscape') return 2;
        if (layout === '3' || layout === '3_landscape') return 3;
        if (layout === '4') return 2;
        if (layout === '6') return 3;
        if (layout === '8') return 4;
        if (layout === '12') return 4;
        if (layout === '16') return 4;
        return 3;
    } else {
        if (layout === '1' || layout === '2_portrait' || layout === '2') return 1;
        if (layout === '12') return 3;
        if (layout === '16') return 4;
        return 2; // 4, 6, 8
    }
};

const getPosterGridColsClass = (layout, isLandscape) => {
    if (isLandscape) {
        if (layout === '1') return 'grid-cols-1';
        if (layout === '2' || layout === '2_landscape') return 'grid-cols-2';
        if (layout === '3' || layout === '3_landscape') return 'grid-cols-3';
        if (layout === '4') return 'grid-cols-2';
        if (layout === '6') return 'grid-cols-3';
        if (layout === '8') return 'grid-cols-4';
        if (layout === '12') return 'grid-cols-4';
        if (layout === '16') return 'grid-cols-4';
        return 'grid-cols-3';
    } else {
        if (layout === '1' || layout === '2_portrait' || layout === '2') return 'grid-cols-1';
        if (layout === '12') return 'grid-cols-3';
        if (layout === '16') return 'grid-cols-4';
        return 'grid-cols-2'; // 4, 6, 8
    }
};

const getNormalPosterLogoHeight = (layout) => {
    if (layout === '1') return '70px';
    if (layout === '2_landscape' || layout === '2') return '56px';
    if (layout === '3_landscape' || layout === '3') return '46px';
    if (layout === '4') return '42px';
    if (layout === '6') return '32px';
    if (layout === '8') return '26px';
    if (layout === '12') return '21px';
    return '18px';
};

const getNormalPosterBadgeFontSize = (layout) => {
    if (layout === '1') return '30px';
    if (layout === '2_landscape' || layout === '2') return '24px';
    if (layout === '3_landscape' || layout === '3') return '19px';
    if (layout === '4') return '17px';
    if (layout === '6') return '14px';
    if (layout === '8') return '12px';
    if (layout === '12') return '10.5px';
    return '9px';
};

const getNormalPosterCardLayout = (layout) => {
    if (layout === '12' || layout === '16') {
        return { imgWidth: 'w-[36%]', detailWidth: 'w-[64%]', padding: 'p-1 px-1.5' };
    }
    if (layout === '8') {
        return { imgWidth: 'w-[38%]', detailWidth: 'w-[62%]', padding: 'p-1.5 px-2' };
    }
    if (layout === '6') {
        return { imgWidth: 'w-[40%]', detailWidth: 'w-[60%]', padding: 'p-2' };
    }
    if (layout === '4') {
        return { imgWidth: 'w-[42%]', detailWidth: 'w-[58%]', padding: 'p-3' };
    }
    return { imgWidth: 'w-[44%]', detailWidth: 'w-[56%]', padding: 'p-4' };
};

const getNormalPosterTitleStyle = (name, layout) => {
    const len = (name || '').length;
    let baseSize = 38; // Default for 4-grid (2x2)
    if (layout === '1') baseSize = 72;
    else if (layout === '2_landscape' || layout === '2') baseSize = 52;
    else if (layout === '3_landscape' || layout === '3') baseSize = 42;
    else if (layout === '4') baseSize = 38;
    else if (layout === '6') baseSize = 28;
    else if (layout === '8') baseSize = 22;
    else if (layout === '12') baseSize = 17;
    else if (layout === '16') baseSize = 14;

    let sizeFactor = 1.0;
    if (len > 32) sizeFactor = 0.68;
    else if (len > 22) sizeFactor = 0.80;
    else if (len > 15) sizeFactor = 0.90;

    const finalSize = Math.round(baseSize * sizeFactor);
    return {
        fontSize: `${finalSize}px`,
        fontFamily: "'Inter', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontWeight: 900,
        lineHeight: '1.08',
        color: '#000000',
        textTransform: 'uppercase',
        textAlign: 'center',
        wordBreak: 'break-word',
    };
};

const getNormalPosterPriceFontSize = (price, layout) => {
    const text = `${Number(price || 0).toFixed(2)}`;
    const len = text.length;
    let baseSize = 58; // Default for 4-grid (2x2)
    if (layout === '1') baseSize = 104;
    else if (layout === '2_landscape' || layout === '2') baseSize = 78;
    else if (layout === '3_landscape' || layout === '3') baseSize = 64;
    else if (layout === '4') baseSize = 58;
    else if (layout === '6') baseSize = 40;
    else if (layout === '8') baseSize = 32;
    else if (layout === '12') baseSize = 24;
    else if (layout === '16') baseSize = 19;

    let sizeFactor = 1.0;
    if (len >= 8) sizeFactor = 0.74;
    else if (len >= 7) sizeFactor = 0.82;
    else if (len >= 6) sizeFactor = 0.90; // e.g. 100.00, 139.00

    return `${Math.round(baseSize * sizeFactor)}px`;
};

const getNormalPosterUnitFontSize = (layout, unit = '') => {
    const uLen = (unit || '').length;
    let baseSize = 32;
    if (layout === '1') baseSize = 54;
    else if (layout === '2_landscape' || layout === '2') baseSize = 42;
    else if (layout === '3_landscape' || layout === '3') baseSize = 34;
    else if (layout === '4') baseSize = 30;
    else if (layout === '6') baseSize = 22;
    else if (layout === '8') baseSize = 17;
    else if (layout === '12') baseSize = 12.5;
    else if (layout === '16') baseSize = 10;

    let sizeFactor = 1.0;
    if (uLen > 6) sizeFactor = 0.82;
    else if (uLen > 4) sizeFactor = 0.90;

    return `${Math.round(baseSize * sizeFactor)}px`;
};

export default function PrintOffersPage() {
    const [products, setProducts] = useState([]);
    const [normalProducts, setNormalProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState('portrait_12'); // 'portrait_12' (default 3x4 A4) | 'portrait' | 'landscape_12' | 'landscape' | 'landscape_6' | 'landscape_4'
    const [saving, setSaving] = useState(false);

    // Poster Mode States
    const [printMode, setPrintMode] = useState('sheet'); // 'sheet' | 'poster' | 'normal_poster'
    const [posterOrientation, setPosterOrientation] = useState('portrait'); // 'portrait' | 'landscape'
    const [posterLayout, setPosterLayout] = useState('6'); // '4' | '6' | '8'
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [bannerImage, setBannerImage] = useState(null);
    const [textBannerBgImage, setTextBannerBgImage] = useState(null);
    const [bannerType, setBannerType] = useState('text'); // 'text' | 'image'
    const [posterTitle, setPosterTitle] = useState('SMILE\nHYPERMARKET');
    const [headerStyle, setHeaderStyle] = useState('vintage_headline');
    const [headerFontSize, setHeaderFontSize] = useState('extra_large'); // 'extra_large' | 'huge' | 'large' | 'normal'
    const [headerColorTheme, setHeaderColorTheme] = useState('brand'); // 'brand' | 'black_white' | 'solid_black' | 'solid_white' | 'black_gold' | 'red_yellow' | 'blue_indigo' | 'solid_red'
    const [posterSubtitle, setPosterSubtitle] = useState(() => getDefaultOfferValidity());
    const [validityStartDate, setValidityStartDate] = useState(() => toDateInputString(new Date()));
    const [validityEndDate, setValidityEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return toDateInputString(d);
    });
    const [logoImage, setLogoImage] = useState(null);
    const [logoLocationText, setLogoLocationText] = useState('KAKKAD');
    const [decorImage, setDecorImage] = useState(null);
    const [showProductImages, setShowProductImages] = useState(true);
    const [showBadges, setShowBadges] = useState(true);
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const [isSheetPickerOpen, setIsSheetPickerOpen] = useState(false);

    // Saved Selections States
    const [savedSelections, setSavedSelections] = useState([]);
    const [activePresetId, setActivePresetId] = useState('');
    const [savingPresetModal, setSavingPresetModal] = useState(false);
    const [presetNameInput, setPresetNameInput] = useState('');

    // Quick Edit Modal States
    const [editingHeaderModal, setEditingHeaderModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editName, setEditName] = useState('');
    const [editUnit, setEditUnit] = useState('');
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
        setEditName(product.name || '');
        setEditUnit(product.unit || '1 KG');
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

        const newName = editName.trim() || editingProduct.name;
        const newUnit = editUnit.trim() || '1 KG';
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
                        name: newName,
                        unit: newUnit,
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
                if (newName) updateData.name = newName;
                if (newUnit) updateData.unit = newUnit;
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
            const savedPresetList = localStorage.getItem('dichoose_poster_saved_selections');
            if (savedPresetList) {
                try {
                    setSavedSelections(JSON.parse(savedPresetList));
                } catch (e) {
                    console.error('Failed to parse saved selections:', e);
                }
            }
        }
    }, []);

    const handleValidityDatesChange = (newStart, newEnd) => {
        setValidityStartDate(newStart);
        setValidityEndDate(newEnd);
        if (newStart && newEnd) {
            setPosterSubtitle(formatOfferValidity(newStart, newEnd));
        }
    };

    const applyDatePreset = (days) => {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + days);
        const sStr = toDateInputString(start);
        const eStr = toDateInputString(end);
        setValidityStartDate(sStr);
        setValidityEndDate(eStr);
        setPosterSubtitle(formatOfferValidity(start, end));
    };

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

    // Saved Selections Handlers
    const handleOpenSaveModal = () => {
        if (selectedProductIds.size === 0) {
            alert('Please select at least one product before saving a selection.');
            return;
        }
        const defaultName = `selection_${savedSelections.length + 1}`;
        setPresetNameInput(defaultName);
        setSavingPresetModal(true);
    };

    const handleSaveCurrentSelection = (e) => {
        e.preventDefault();
        const finalName = presetNameInput.trim() || `selection_${savedSelections.length + 1}`;
        
        const newPreset = {
            id: `sel_${Date.now()}`,
            name: finalName,
            mode: printMode,
            posterLayout,
            productIds: Array.from(selectedProductIds),
            createdAt: new Date().toISOString()
        };

        const updated = [newPreset, ...savedSelections];
        setSavedSelections(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('dichoose_poster_saved_selections', JSON.stringify(updated));
        }
        setActivePresetId(newPreset.id);
        setSavingPresetModal(false);
    };

    const handleSelectPreset = (presetId) => {
        setActivePresetId(presetId);
        if (!presetId) return;

        const preset = savedSelections.find(s => s.id === presetId);
        if (preset) {
            if (preset.mode && (preset.mode === 'poster' || preset.mode === 'normal_poster')) {
                setPrintMode(preset.mode);
            }
            if (preset.posterLayout) {
                setPosterLayout(preset.posterLayout);
            }
            setSelectedProductIds(new Set(preset.productIds || []));
        }
    };

    const handleDeletePreset = (e, presetId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this saved selection?')) return;

        const updated = savedSelections.filter(s => s.id !== presetId);
        setSavedSelections(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('dichoose_poster_saved_selections', JSON.stringify(updated));
        }
        if (activePresetId === presetId) {
            setActivePresetId('');
        }
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
        let targetLayout = posterLayout;
        if (newMode === 'normal_poster') {
            targetLayout = (posterLayout === '4' || posterLayout === '6' || posterLayout === '8' || posterLayout === '12') ? posterLayout : '6';
            setPosterLayout(targetLayout);
        } else if (newMode === 'poster') {
            targetLayout = (posterLayout === '4' || posterLayout === '6' || posterLayout === '8' || posterLayout === '12' || posterLayout === '1' || posterLayout === '2_portrait' || posterLayout === '2_landscape' || posterLayout === '3_landscape') ? posterLayout : '6';
            setPosterLayout(targetLayout);
        }
        const pool = newMode === 'normal_poster' ? normalProducts : products;
        const count = parseInt(targetLayout) || 6;
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
                // Unlimited selection for standard tag sheet mode; limit only for poster mode layouts
                if (printMode === 'sheet') {
                    next.add(id);
                } else {
                    const limit = parseInt(posterLayout);
                    if (next.size < limit) {
                        next.add(id);
                    } else {
                        alert(`You can only select up to ${limit} products for this poster layout. Deselect another product first.`);
                    }
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

    // Poster orientation and page orientation details
    const isLandscapePoster = posterOrientation === 'landscape' || posterLayout === '2_landscape' || posterLayout === '3_landscape';
    const isSheetLandscape = layout !== 'portrait' && layout !== 'portrait_12';
    const isPageLandscape = (printMode === 'poster' || printMode === 'normal_poster')
        ? isLandscapePoster 
        : isSheetLandscape;

    const handleOrientationChange = (newOrientation) => {
        setPosterOrientation(newOrientation);
        if (newOrientation === 'portrait' && (posterLayout === '2_landscape' || posterLayout === '3_landscape')) {
            setPosterLayout('4');
        } else if (newOrientation === 'landscape' && posterLayout === '2_portrait') {
            setPosterLayout('2_landscape');
        }
    };

    const handleSaveAllAsPng = async () => {
        setSaving(true);
        try {
            const html2canvas = (await import('html2canvas-pro')).default;
            const element = (printMode === 'poster' || printMode === 'normal_poster')
                ? (document.getElementById('normal-poster-a4-target') || document.getElementById('promotional-poster-a4-target') || document.getElementById('print-offers-container'))
                : document.getElementById('print-offers-container');
            if (!element) {
                alert("Error: Print container not found.");
                return;
            }

            // Calculate exact A4 dimensions at 96 CSS DPI (297mm = 1122.52px, 210mm = 793.70px)
            const targetWidthPx = isPageLandscape ? 1122.52 : 793.70;
            const targetHeightPx = isPageLandscape ? 793.70 : 1122.52;

            // Scale 3.125 produces exact 3508px x 2480px (300 DPI A4 print standard)
            const canvas = await html2canvas(element, {
                scale: 3.125,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: targetWidthPx,
                height: targetHeightPx,
                windowWidth: targetWidthPx,
                windowHeight: targetHeightPx,
                logging: false
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = printMode === 'normal_poster'
                ? `normal-price-poster-${posterLayout}-${isLandscapePoster ? 'landscape' : 'portrait'}.png` 
                : printMode === 'poster'
                    ? `promotional-poster-${posterLayout}-${isLandscapePoster ? 'landscape' : 'portrait'}.png` 
                    : `standard-tags-sheet-${layout}.png`;
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

    // Filter and pad products for Poster Mode & Sheet Selection
    const currentPool = (printMode === 'normal_poster' || printMode === 'sheet') 
        ? (normalProducts.length > 0 ? normalProducts : products) 
        : products;
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
    const posterCols = getPosterCols(posterLayout, isLandscapePoster);
    const posterRows = Math.ceil(totalRequired / posterCols);
    // Mathematically split remaining A4 height: A4 Portrait = 297mm (Grid = 210mm). A4 Landscape = 210mm (Grid = 134mm).
    const gridAvailableHeight = isLandscapePoster ? 134 : 210;
    const posterCardHeight = `${gridAvailableHeight / posterRows}mm`;

    const posterLayoutConfigs = {
        '1': {
            imageTop: '65px',
            imageBottom: '180px',
            titleFontSize: 'text-[30px] sm:text-[36px] md:text-[42px]',
            priceFontSize: 'text-[42px] sm:text-[52px] md:text-[62px]',
            oldPriceFontSize: 'text-xl sm:text-2xl',
            unitFontSize: 'text-lg sm:text-xl',
            discountFontSize: 'text-base sm:text-lg'
        },
        '2_landscape': {
            imageTop: '55px',
            imageBottom: '145px',
            titleFontSize: 'text-[22px] sm:text-[26px] md:text-[30px]',
            priceFontSize: 'text-[30px] sm:text-[36px] md:text-[44px]',
            oldPriceFontSize: 'text-lg sm:text-xl',
            unitFontSize: 'text-base sm:text-lg',
            discountFontSize: 'text-sm sm:text-base'
        },
        '3_landscape': {
            imageTop: '45px',
            imageBottom: '120px',
            titleFontSize: 'text-[16px] sm:text-[18px] md:text-[20px]',
            priceFontSize: 'text-[22px] sm:text-[26px] md:text-[30px]',
            oldPriceFontSize: 'text-sm sm:text-base',
            unitFontSize: 'text-xs sm:text-sm',
            discountFontSize: 'text-[11px] sm:text-xs'
        },
        '2_portrait': {
            imageTop: '50px',
            imageBottom: '140px',
            titleFontSize: 'text-[20px] sm:text-[22px] md:text-[24px]',
            priceFontSize: 'text-[24px] sm:text-[28px] md:text-[32px]',
            oldPriceFontSize: 'text-base sm:text-lg',
            unitFontSize: 'text-sm sm:text-base',
            discountFontSize: 'text-xs sm:text-sm'
        },
        '2': {
            imageTop: '50px',
            imageBottom: '140px',
            titleFontSize: 'text-[20px] sm:text-[22px] md:text-[24px]',
            priceFontSize: 'text-[24px] sm:text-[28px] md:text-[32px]',
            oldPriceFontSize: 'text-base sm:text-lg',
            unitFontSize: 'text-sm sm:text-base',
            discountFontSize: 'text-xs sm:text-sm'
        },
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
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <div className="flex flex-wrap gap-3 items-center justify-between">
                            {/* Layout Selection */}
                            <div className="flex gap-2 flex-wrap items-center">
                                <span className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mr-1">Layout:</span>
                                <button
                                    onClick={() => setLayout('portrait_12')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'portrait_12' ? 'bg-primary text-white shadow-green-200' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    3x4 Portrait (12 Tags - Standard)
                                </button>
                                <button
                                    onClick={() => setLayout('portrait')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'portrait' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    3x5 Portrait (15 Tags)
                                </button>
                                <button
                                    onClick={() => setLayout('landscape_12')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'landscape_12' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    4x3 Landscape (12 Tags)
                                </button>
                                <button
                                    onClick={() => setLayout('landscape')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'landscape' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    4x4 Landscape (16 Tags)
                                </button>
                                <button
                                    onClick={() => setLayout('landscape_6')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'landscape_6' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    3x2 Landscape (6 Tags)
                                </button>
                                <button
                                    onClick={() => setLayout('landscape_4')}
                                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${layout === 'landscape_4' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    2x2 Landscape (4 Tags)
                                </button>
                            </div>

                            {/* Search Filter for Sheet Products */}
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search products by name..."
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
                        </div>

                        {/* Secondary Tool Bar */}
                        <div className="flex flex-wrap gap-3 items-center justify-between pt-2 border-t border-gray-150 text-xs">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                {/* Option: Only Show Selected Tags */}
                                <label className={`flex items-center gap-2 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer border shadow-sm transition-all select-none ${
                                    showSelectedOnly 
                                        ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md' 
                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={showSelectedOnly}
                                        onChange={(e) => setShowSelectedOnly(e.target.checked)}
                                        className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                                    />
                                    <span>Only Show Selected Tags</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        showSelectedOnly ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {selectedProductIds.size}
                                    </span>
                                </label>

                                {/* Option: Clear Selection */}
                                <button
                                    type="button"
                                    onClick={clearProductSelection}
                                    disabled={selectedProductIds.size === 0}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm select-none"
                                    title="Clear selection of tags"
                                >
                                    <FaTimes className="text-[10px]" /> Clear Selection
                                </button>

                                {/* Quick Tag Picker Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsSheetPickerOpen(prev => !prev)}
                                    className={`py-2 px-3 rounded-lg font-bold text-xs transition border shadow-sm cursor-pointer flex items-center gap-1.5 select-none ${
                                        isSheetPickerOpen 
                                            ? 'bg-indigo-650 text-white border-indigo-700 shadow-md' 
                                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                    title="Toggle quick tag picker tray to select/deselect tags quickly"
                                >
                                    <span>🏷️</span> {isSheetPickerOpen ? 'Hide Tag Picker' : 'Quick Tag Picker'}
                                </button>

                                <label className="flex items-center gap-2 font-bold text-xs text-gray-700 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm select-none">
                                    <input
                                        type="checkbox"
                                        checked={showProductImages}
                                        onChange={(e) => setShowProductImages(e.target.checked)}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer accent-primary"
                                    />
                                    <span>Show Images</span>
                                </label>

                                <label className="flex items-center gap-2 font-bold text-xs text-gray-700 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm select-none">
                                    <input
                                        type="checkbox"
                                        checked={showBadges}
                                        onChange={(e) => setShowBadges(e.target.checked)}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer accent-primary"
                                    />
                                    <span>Show Badges</span>
                                </label>

                                {/* Tag Logo Customizer */}
                                <div className="flex items-center gap-1.5">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleLogoUpload}
                                        className="hidden" 
                                        id="sheet-logo-file-input"
                                    />
                                    <label 
                                        htmlFor="sheet-logo-file-input" 
                                        className="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-bold text-xs cursor-pointer shadow-sm transition flex items-center gap-1.5 select-none"
                                        title="Upload custom logo for tag headers"
                                    >
                                        <FaImage /> {logoImage ? 'Change Logo' : 'Upload Logo'}
                                    </label>
                                    {logoImage && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2 px-2.5 rounded-lg font-bold text-xs transition cursor-pointer select-none"
                                            title="Reset to default Smile logo"
                                        >
                                            Reset Logo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                <span className="text-[11px] text-gray-500 hidden md:inline-block">
                                    💡 Click any card to edit price, name, unit, or image
                                </span>
                                <button
                                    onClick={handleSaveAllAsPng}
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Sheet as PNG'}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer"
                                >
                                    Print / Save as PDF
                                </button>
                            </div>
                        </div>

                        {/* Quick Tag Picker Drawer */}
                        {isSheetPickerOpen && (
                            <div className="pt-3 pb-1 border-t border-gray-150 space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                                            Quick Tag Picker
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-500">
                                            ({selectedProductIds.size} selected)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const idsToAdd = selectableProducts.map(p => p.id);
                                                setSelectedProductIds(prev => {
                                                    const next = new Set(prev);
                                                    idsToAdd.forEach(id => next.add(id));
                                                    return next;
                                                });
                                            }}
                                            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded border border-gray-300 cursor-pointer"
                                        >
                                            Select Visible ({selectableProducts.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearProductSelection}
                                            disabled={selectedProductIds.size === 0}
                                            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded border border-red-200 cursor-pointer disabled:opacity-40"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                                    {selectableProducts.length === 0 ? (
                                        <div className="text-xs text-gray-500 py-3 px-2 italic">
                                            No products found matching &quot;{searchTerm}&quot;
                                        </div>
                                    ) : (
                                        selectableProducts.map(p => {
                                            const isSelected = selectedProductIds.has(p.id);
                                            const sellingPrice = (p.price !== undefined && p.price !== null && parseFloat(p.price) > 0)
                                                ? parseFloat(p.price)
                                                : ((p.offerPrice !== undefined && p.offerPrice !== null && parseFloat(p.offerPrice) > 0)
                                                    ? parseFloat(p.offerPrice)
                                                    : (parseFloat(p.mrp) || 0));
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => toggleProductSelection(p.id)}
                                                    className={`flex-shrink-0 flex items-center gap-2 p-2 rounded-lg border-2 transition relative text-left w-44 cursor-pointer select-none ${
                                                        isSelected 
                                                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="relative w-8 h-8 bg-gray-50 rounded overflow-hidden border border-gray-150 flex-shrink-0">
                                                        <img src={getProxiedImageUrl(p.image)} className="w-full h-full object-contain" alt="" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] font-bold text-gray-800 truncate leading-tight">{p.name}</p>
                                                        <span className="text-[10px] text-emerald-700 font-extrabold">₹{Number(sellingPrice).toFixed(2)}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 text-[7px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                                                            <FaCheck />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                        {/* Poster Config Options (Shared for Promotional Offer & Normal Price Posters) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 pb-4 border-b border-gray-150">
                            {/* Orientation Selector */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                                    Poster Orientation
                                </label>
                                <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => handleOrientationChange('portrait')}
                                        className={`py-1.5 px-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
                                            !isLandscapePoster 
                                                ? (printMode === 'normal_poster' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-indigo-650 text-white shadow-sm') 
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span>📄</span> Portrait
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOrientationChange('landscape')}
                                        className={`py-1.5 px-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
                                            isLandscapePoster 
                                                ? (printMode === 'normal_poster' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-indigo-650 text-white shadow-sm') 
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span>🖼️</span> Landscape
                                    </button>
                                </div>
                            </div>

                            {/* Layout Selection */}
                            <div className="space-y-2 lg:col-span-2">
                                <label className="block text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                                    {isLandscapePoster ? 'Grid Layout (A4 Landscape)' : 'Grid Layout (A4 Portrait)'}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(isLandscapePoster ? [
                                        { id: '4', label: '4 Items (2×2)' },
                                        { id: '6', label: '6 Items (3×2)' },
                                        { id: '8', label: '8 Items (4×2)' },
                                        { id: '12', label: '12 Items (4×3)' },
                                        { id: '2', label: '2 Items (2×1)' },
                                        { id: '3', label: '3 Items (3×1)' },
                                        { id: '1', label: '1 Item' },
                                        { id: '16', label: '16 Items' }
                                    ] : [
                                        { id: '4', label: '4 Items (2×2)' },
                                        { id: '6', label: '6 Items (2×3)' },
                                        { id: '8', label: '8 Items (2×4)' },
                                        { id: '12', label: '12 Items (3×4)' },
                                        { id: '1', label: '1 Item' },
                                        { id: '2_portrait', label: '2 Portrait' },
                                        { id: '16', label: '16 Items' }
                                    ]).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handlePosterLayoutChange(item.id)}
                                            className={`flex-1 min-w-[55px] py-2 px-1 rounded-lg font-bold text-xs transition-all border cursor-pointer ${
                                                posterLayout === item.id 
                                                    ? (printMode === 'normal_poster' ? 'bg-emerald-600 text-white border-transparent shadow-sm' : 'bg-indigo-650 text-white border-transparent shadow-sm') 
                                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                            }`}
                                        >
                                            {item.label}
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
                                        className={`w-4 h-4 rounded cursor-pointer ${printMode === 'normal_poster' ? 'text-emerald-600 focus:ring-emerald-600 accent-emerald-600' : 'text-indigo-650 focus:ring-indigo-650 accent-indigo-650'}`}
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
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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
                                            <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Header Font Size</label>
                                            <select
                                                value={headerFontSize}
                                                onChange={(e) => setHeaderFontSize(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-black cursor-pointer"
                                            >
                                                <option value="extra_large">Heavy & Big (Default)</option>
                                                <option value="huge">Massive / Extra Big</option>
                                                <option value="large">Large</option>
                                                <option value="normal">Standard</option>
                                            </select>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Title font scale.</p>
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
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <label className="block text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Offer Duration / Validity</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingHeaderModal(true)}
                                                    className="text-[9px] text-indigo-600 font-bold hover:underline cursor-pointer"
                                                    title="Pick dates, presets or edit header"
                                                >
                                                    Pick Dates
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={posterSubtitle}
                                                onChange={(e) => setPosterSubtitle(e.target.value)}
                                                placeholder="e.g. OFFER VALIDITY: 16TH TO 22ND NOVEMBER"
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
                        <div className="space-y-3">
                            {/* Saved Selections Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold uppercase text-emerald-900 flex items-center gap-1.5">
                                        <FaBookmark className="text-emerald-600 text-xs" /> Saved Selections:
                                    </span>
                                    <select
                                        value={activePresetId}
                                        onChange={(e) => handleSelectPreset(e.target.value)}
                                        className="bg-white border border-emerald-300 text-gray-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                                    >
                                        <option value="">-- Load Saved Selection --</option>
                                        {savedSelections.map((sel) => (
                                            <option key={sel.id} value={sel.id}>
                                                {sel.name} ({sel.productIds.length} items{sel.posterLayout ? `, ${sel.posterLayout}-Grid` : ''})
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {activePresetId && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeletePreset(e, activePresetId)}
                                            className="text-[11px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                                            title="Delete active selection preset"
                                        >
                                            <FaTrash className="w-2.5 h-2.5" /> Delete Preset
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleOpenSaveModal}
                                        disabled={selectedProductIds.size === 0}
                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <FaSave className="text-xs" /> Save Selection ({selectedProductIds.size})
                                    </button>
                                </div>
                            </div>

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
            <div id="print-offers-container" className={`mx-auto w-full print:p-0 print:max-w-none ${isPageLandscape ? 'max-w-[297mm] p-2 bg-white' : 'max-w-[210mm] p-2 bg-white'}`}>
                
                {(printMode === 'poster' || printMode === 'normal_poster') ? (
                    /* POSTER LAYOUT CONTAINER (PROMOTIONAL OFFERS & NORMAL PRICE POSTERS) */
                    <div 
                        id={printMode === 'normal_poster' ? "normal-poster-a4-target" : "promotional-poster-a4-target"}
                        className={`promotional-poster-target w-full mx-auto ${isLandscapePoster ? 'h-[210mm]' : 'h-[297mm]'} flex flex-col justify-between bg-white overflow-hidden select-none border border-gray-150 shadow-sm print:border-none print:shadow-none relative box-border`}
                        style={{
                            width: isLandscapePoster ? '297mm' : '210mm',
                            minWidth: isLandscapePoster ? '297mm' : '210mm',
                            maxWidth: isLandscapePoster ? '297mm' : '210mm',
                            height: isLandscapePoster ? '210mm' : '297mm',
                            minHeight: isLandscapePoster ? '210mm' : '297mm',
                            maxHeight: isLandscapePoster ? '210mm' : '297mm',
                            boxSizing: 'border-box'
                        }}
                    >
                        
                        {/* Top HR Bars (Green 10px & Red 5px with narrow space) */}
                        <div className="w-full flex-shrink-0 flex flex-col gap-[2px] z-20">
                            <div className="w-full h-[10px] bg-[#16a34a]" />
                            <div className="w-full h-[5px] bg-[#e11b22]" />
                        </div>

                        {/* Top Poster Banner */}
                        <div className={`w-full ${isLandscapePoster ? 'h-[45mm]' : 'h-[55mm]'} relative flex-shrink-0 bg-white`}>
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
                                    <div className={`${decorImage === 'none' ? 'w-[4%]' : 'w-[23%]'} h-[90%] relative flex-shrink-0 flex items-center justify-start select-none z-10`}>
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
                                        className={`flex flex-col items-center justify-center text-center flex-1 ${decorImage === 'none' ? 'max-w-[72%]' : 'max-w-[55%]'} z-10 leading-none group/headerEdit cursor-pointer hover:bg-black/5 p-1 rounded-xl transition relative`}
                                        title="Click to edit Header Text, Fonts & Validity"
                                    >
                                        <div className="absolute -top-2.5 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md opacity-0 group-hover/headerEdit:opacity-100 transition-opacity print:hidden flex items-center gap-1 pointer-events-none z-30 whitespace-nowrap">
                                            <FaPencilAlt className="text-[8px] text-yellow-300" /> Click to Edit Header Text & Validity
                                        </div>
                                        
                                        {/* Date/Validity on top */}
                                        <div className="text-black font-black text-sm sm:text-base tracking-widest mb-1 font-sans uppercase">
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

                                                        let fontStyleClass = 'font-vintage font-bold';
                                                        let fontFamilyStyle = "'Pacifico', cursive";
                                                        let fontWeight = '900';
                                                        let textStroke = '2px #ffffff';
                                                        const fontSize = getPosterHeaderFontSize(lineText, idx, titleLines.length, headerStyle, isLandscapePoster, headerFontSize);

                                                        // 1. Font Family & Weight selection
                                                        if (headerStyle === 'vintage_headline') {
                                                            if (isSecondLine) {
                                                                fontStyleClass = 'font-headline font-bold';
                                                                fontFamilyStyle = "'Dancing Script', cursive";
                                                                fontWeight = '700';
                                                                textStroke = '1.8px #ffffff';
                                                            } else {
                                                                fontStyleClass = 'font-vintage font-bold';
                                                                fontFamilyStyle = "'Pacifico', cursive";
                                                                fontWeight = '900';
                                                                textStroke = '2px #ffffff';
                                                            }
                                                        } else if (headerStyle === 'modern_montserrat') {
                                                            fontStyleClass = 'font-montserrat font-black';
                                                            fontFamilyStyle = "'Montserrat', sans-serif";
                                                            fontWeight = '900';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'modern_bebas') {
                                                            fontStyleClass = 'font-bebas tracking-wide font-black';
                                                            fontFamilyStyle = "'Bebas Neue', sans-serif";
                                                            fontWeight = '900';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'modern_righteous') {
                                                            fontStyleClass = 'font-righteous font-black';
                                                            fontFamilyStyle = "'Righteous', cursive";
                                                            fontWeight = '900';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'modern_poppins') {
                                                            fontStyleClass = 'font-poppins font-black';
                                                            fontFamilyStyle = "'Poppins', sans-serif";
                                                            fontWeight = '800';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'modern_oswald') {
                                                            fontStyleClass = 'font-oswald font-extrabold tracking-wide';
                                                            fontFamilyStyle = "'Oswald', sans-serif";
                                                            fontWeight = '800';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'vintage') {
                                                            fontStyleClass = 'font-vintage font-bold';
                                                            fontFamilyStyle = "'Pacifico', cursive";
                                                            fontWeight = '900';
                                                            textStroke = '2px #ffffff';
                                                        } else if (headerStyle === 'headline') {
                                                            fontStyleClass = 'font-headline font-bold';
                                                            fontFamilyStyle = "'Dancing Script', cursive";
                                                            fontWeight = '700';
                                                            textStroke = '1.8px #ffffff';
                                                        } else {
                                                            fontStyleClass = 'font-anton tracking-wide';
                                                            fontFamilyStyle = "'Anton', sans-serif";
                                                            fontWeight = '900';
                                                            textStroke = '2.2px #ffffff';
                                                        }

                                                        // 2. Color Theme Selection & Enhanced 3D Punch
                                                        let textColorClass = 'text-[#16a34a]';
                                                        let shadowClass = 'drop-shadow-[0_4px_0_#15803d] drop-shadow-[0_6px_0_#14532d]';

                                                        if (headerColorTheme === 'black_white') {
                                                            textColorClass = isOdd ? 'text-white' : 'text-black';
                                                            textStroke = isOdd ? '2px #000000' : '2px #ffffff';
                                                            shadowClass = isOdd 
                                                                ? 'drop-shadow-[0_3px_0_#000000] drop-shadow-[0_4px_0_#000000]' 
                                                                : 'drop-shadow-[0_3px_0_#333333] drop-shadow-[0_5px_0_#555555]';
                                                        } else if (headerColorTheme === 'solid_black') {
                                                            textColorClass = 'text-black';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = 'drop-shadow-[0_3px_0_#222222] drop-shadow-[0_5px_0_#444444]';
                                                        } else if (headerColorTheme === 'solid_white') {
                                                            textColorClass = 'text-white';
                                                            textStroke = '2px #000000';
                                                            shadowClass = 'drop-shadow-[0_3px_0_#000000] drop-shadow-[0_5px_0_#000000]';
                                                        } else if (headerColorTheme === 'black_gold') {
                                                            textColorClass = isOdd ? 'text-[#d97706]' : 'text-black';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_3px_0_#92400e] drop-shadow-[0_4px_0_#78350f]' : 'drop-shadow-[0_3px_0_#222222] drop-shadow-[0_4px_0_#444444]';
                                                        } else if (headerColorTheme === 'red_yellow') {
                                                            textColorClass = isOdd ? 'text-[#eab308]' : 'text-[#e11b22]';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_3px_0_#854d0e] drop-shadow-[0_4px_0_#713f12]' : 'drop-shadow-[0_3px_0_#991b1b] drop-shadow-[0_4px_0_#7f1d1d]';
                                                        } else if (headerColorTheme === 'blue_indigo') {
                                                            textColorClass = isOdd ? 'text-[#4338ca]' : 'text-[#1d4ed8]';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = isOdd ? 'drop-shadow-[0_3px_0_#312e81] drop-shadow-[0_4px_0_#1e1b4b]' : 'drop-shadow-[0_3px_0_#1e40af] drop-shadow-[0_4px_0_#172554]';
                                                        } else if (headerColorTheme === 'solid_red') {
                                                            textColorClass = 'text-[#e11b22]';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = 'drop-shadow-[0_3px_0_#991b1b] drop-shadow-[0_4px_0_#7f1d1d]';
                                                        } else {
                                                            // Default Brand Colors
                                                            textColorClass = isOdd ? 'text-[#ea580c]' : 'text-[#16a34a]';
                                                            textStroke = '2px #ffffff';
                                                            shadowClass = isOdd 
                                                                ? 'drop-shadow-[0_3px_0_#b45309] drop-shadow-[0_5px_0_#7c2d12]' 
                                                                : 'drop-shadow-[0_4px_0_#15803d] drop-shadow-[0_6px_0_#14532d]';
                                                        }

                                                        return (
                                                            <span 
                                                                key={idx}
                                                                className={`${fontStyleClass} tracking-tight text-center ${textColorClass} filter ${shadowClass} ${idx > 0 ? '-mt-1.5' : ''}`}
                                                                style={{ 
                                                                    fontFamily: fontFamilyStyle,
                                                                    fontSize,
                                                                    fontWeight,
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
                                    <div className="w-[22%] h-[90%] relative flex-shrink-0 flex items-center justify-end z-10 select-none">
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
                            className={`grid ${getPosterGridColsClass(posterLayout, isLandscapePoster)} flex-grow animate-fadeIn bg-white`}
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
                                                                fontSize: getDiscountFontSize(posterLayout, isLandscapePoster),
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
                                                                fontSize: getDiscountFontSize(posterLayout, isLandscapePoster),
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

                                                {/* Red circular price badge overlapping the image (Click to edit price) */}
                                                {(() => {
                                                    const { size, rupeeSize, integerSize, decimalSize, rightOffset, topOffset } = getPosterBadgeStyle(posterLayout, isLandscapePoster);
                                                    const priceVal = sellingPrice;
                                                    const isInteger = priceVal % 1 === 0;
                                                    const integerPart = Math.floor(priceVal).toString();
                                                    const decimalPart = isInteger ? '' : (priceVal % 1).toFixed(2).substring(1); // e.g. ".90"

                                                    return (
                                                        <div 
                                                            onClick={(e) => handleOpenEditModal(e, product)}
                                                            className="absolute z-[15] rounded-full bg-[#e11b22] text-white flex items-center justify-center font-anton border-2 border-white shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none cursor-pointer hover:scale-105 transition-transform"
                                                            style={{
                                                                width: `${size}px`,
                                                                height: `${size}px`,
                                                                right: rightOffset,
                                                                top: topOffset,
                                                                transform: 'translateY(-20%)',
                                                            }}
                                                            title="Click price badge to edit Price & MRP"
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

                                                {/* Card Details Block (Click title or unit to edit) */}
                                                <div 
                                                    onClick={(e) => handleOpenEditModal(e, product)}
                                                    className="absolute bottom-2 left-0 right-0 z-[10] px-2 text-center cursor-pointer group/title"
                                                    title="Click title to edit Product Name, Unit & Details"
                                                >
                                                    <h2 
                                                        className="font-extrabold tracking-tight text-black leading-none text-center group-hover/title:text-indigo-700 transition-colors" 
                                                        style={{ 
                                                            ...getPosterDynamicTitleStyle(product.name, posterLayout, isLandscapePoster),
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
                    /* STANDARD TAG SHEETS CONTAINER (Like Uploaded Tags with Border & Normal Editable Price) */
                    <div className="w-full flex flex-col gap-6 print:gap-0">
                        {(() => {
                            const isSheetLandscape = layout !== 'portrait' && layout !== 'portrait_12';
                            let itemsPerPage = 12;
                            let gridColsClass = 'grid-cols-3';

                            if (layout === 'portrait_12') {
                                itemsPerPage = 12;
                                gridColsClass = 'grid-cols-3';
                            } else if (layout === 'portrait') {
                                itemsPerPage = 15;
                                gridColsClass = 'grid-cols-3';
                            } else if (layout === 'landscape_4') {
                                itemsPerPage = 4;
                                gridColsClass = 'grid-cols-2';
                            } else if (layout === 'landscape_6') {
                                itemsPerPage = 6;
                                gridColsClass = 'grid-cols-3';
                            } else if (layout === 'landscape_12') {
                                itemsPerPage = 12;
                                gridColsClass = 'grid-cols-4';
                            } else if (layout === 'landscape') {
                                itemsPerPage = 16;
                                gridColsClass = 'grid-cols-4';
                            }
                            
                            // Pool: prioritize normalProducts with normal prices, fallback to products
                            const pool = normalProducts.length > 0 ? normalProducts : products;
                            const sourcePool = showSelectedOnly
                                ? pool.filter(p => selectedProductIds.has(p.id))
                                : pool;
                            const filteredPool = sourcePool.filter(p => 
                                (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
                            );

                            const sheetProducts = [...filteredPool];
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

                            if (pages.length === 0) {
                                return (
                                    <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-4 my-6 shadow-sm">
                                        <div className="text-4xl">🏷️</div>
                                        <h3 className="text-base font-bold text-gray-800">
                                            {showSelectedOnly ? "No Tags Selected" : "No Products Found"}
                                        </h3>
                                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                                            {showSelectedOnly 
                                                ? "You haven't selected any tags yet. Turn off 'Only Show Selected Tags' to browse and select tags, or select products using the Quick Tag Picker."
                                                : `No products match "${searchTerm}". Try another search term.`
                                            }
                                        </p>
                                        {showSelectedOnly ? (
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => setShowSelectedOnly(false)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                                                >
                                                    Show All Tags
                                                </button>
                                                {pool.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductIds(new Set(pool.slice(0, itemsPerPage).map(p => p.id)));
                                                        }}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition border border-gray-300 cursor-pointer"
                                                    >
                                                        Select First {itemsPerPage} Tags
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition border border-gray-300 cursor-pointer"
                                                >
                                                    Clear Search
                                                </button>
                                            )
                                        )}
                                    </div>
                                );
                            }

                            return pages.map((pageProducts, pageIdx) => (
                                <div 
                                    key={`sheet-page-${pageIdx}`}
                                    className="sheet-page w-full flex flex-col justify-between bg-white overflow-hidden page-break-after-always print:break-after-page shadow-sm print:shadow-none border border-gray-200 print:border-none relative box-border mx-auto"
                                    style={{
                                        width: isSheetLandscape ? '297mm' : '210mm',
                                        minWidth: isSheetLandscape ? '297mm' : '210mm',
                                        maxWidth: isSheetLandscape ? '297mm' : '210mm',
                                        height: isSheetLandscape ? '210mm' : '297mm',
                                        minHeight: isSheetLandscape ? '210mm' : '297mm',
                                        maxHeight: isSheetLandscape ? '210mm' : '297mm',
                                        padding: '3mm 4mm 2mm 4mm',
                                        breakAfter: pageIdx < pages.length - 1 ? 'page' : 'auto',
                                        pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {/* Sheet Grid with Dotted/Dashed Cutting Guidelines */}
                                    <div 
                                        className={`grid gap-0 print:gap-0 flex-grow ${gridColsClass}`}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: layout === 'portrait_12' || layout === 'portrait' ? 'repeat(3, 1fr)' : (layout === 'landscape_4' ? 'repeat(2, 1fr)' : (layout === 'landscape_6' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)')),
                                            gridTemplateRows: layout === 'portrait_12' ? 'repeat(4, 1fr)' : (layout === 'portrait' ? 'repeat(5, 1fr)' : (layout === 'landscape_4' || layout === 'landscape_6' ? 'repeat(2, 1fr)' : (layout === 'landscape_12' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)'))),
                                            height: 'calc(100% - 6mm)',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {pageProducts.map((product) => {
                                            const isPlaceholder = product.isPlaceholder;
                                            const isSelected = !isPlaceholder && selectedProductIds.has(product.id);
                                            const mrpVal = (product.mrp !== undefined && product.mrp !== null && parseFloat(product.mrp) > 0)
                                                ? parseFloat(product.mrp)
                                                : 0;
                                            const sellingPrice = (product.price !== undefined && product.price !== null && parseFloat(product.price) > 0)
                                                ? parseFloat(product.price)
                                                : ((product.offerPrice !== undefined && product.offerPrice !== null && parseFloat(product.offerPrice) > 0)
                                                    ? parseFloat(product.offerPrice)
                                                    : (parseFloat(product.mrp) || 0));
                                            const discountAmount = mrpVal > sellingPrice ? (mrpVal - sellingPrice) : 0;
                                            const discountPercent = (mrpVal > 0 && mrpVal > sellingPrice) 
                                                ? Math.round(((mrpVal - sellingPrice) / mrpVal) * 100) 
                                                : 0;

                                            return (
                                                <div
                                                    key={product.id}
                                                    id={`offer-card-${product.id}`}
                                                    onClick={(e) => handleOpenEditModal(e, product)}
                                                    className="sheet-tag-card relative overflow-hidden bg-white flex flex-col justify-between items-center text-center p-2 box-border cursor-pointer group select-none transition-all hover:bg-gray-50/50"
                                                    style={{
                                                        border: '1px dashed #d1d5db',
                                                        minHeight: 0,
                                                        minWidth: 0,
                                                        height: '100%',
                                                        width: '100%',
                                                        boxSizing: 'border-box'
                                                    }}
                                                    title={isPlaceholder ? '' : 'Click to edit Product Price, Name, Unit & Image'}
                                                >
                                                    {isPlaceholder ? (
                                                        /* Empty placeholder cell with border to maintain print shape for trimming */
                                                        <div className="w-full h-full bg-white flex items-center justify-center text-gray-200 text-xs font-bold">
                                                            +
                                                        </div>
                                                    ) : (
                                                        /* Active standard tag card like uploaded tags */
                                                        <>
                                                            {/* Screen-only Selection Outline & Tint */}
                                                            {isSelected && (
                                                                <div 
                                                                    data-html2canvas-ignore
                                                                    className="absolute inset-0 border-2 border-emerald-500 bg-emerald-500/[0.04] pointer-events-none z-[12] print:hidden"
                                                                />
                                                            )}

                                                            {/* Top-Left: MRP Badge */}
                                                            {showBadges && mrpVal > 0 && (
                                                                <div 
                                                                    className="absolute top-1.5 left-1.5 z-20 bg-[#ffff00] text-black font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide shadow-xs flex items-center whitespace-nowrap pointer-events-none"
                                                                    style={{
                                                                        fontSize: getDynamicBadgeFontSize(layout),
                                                                        fontFamily: 'var(--font-sans), sans-serif',
                                                                        lineHeight: '1.1'
                                                                    }}
                                                                >
                                                                    <span className="text-[0.85em] font-black mr-0.5">MRP</span>
                                                                    <span className="line-through font-black" style={{ textDecorationColor: '#e11b22', textDecorationThickness: '1.5px' }}>
                                                                        ₹{mrpVal.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Top-Right: Discount Percentage in Red Font with Underline (No Fill Color) */}
                                                            {showBadges && discountPercent > 0 && (
                                                                <div 
                                                                    className="absolute top-1.5 right-1.5 z-20 bg-transparent flex items-center whitespace-nowrap pointer-events-none select-none"
                                                                    style={{
                                                                        fontSize: layout === 'portrait_12' ? '13px' : (layout === 'portrait' ? '12px' : '15px'),
                                                                        fontFamily: 'var(--font-anton), Anton, Impact, sans-serif',
                                                                        color: '#e11b22',
                                                                        textDecoration: 'underline',
                                                                        textDecorationColor: '#e11b22',
                                                                        textDecorationThickness: '2px',
                                                                        textUnderlineOffset: '2px',
                                                                        letterSpacing: '0.4px',
                                                                        lineHeight: '1',
                                                                        WebkitTextStroke: '0.3px #ffffff',
                                                                        textShadow: '0 0 2px #ffffff, 0 0 2px #ffffff'
                                                                    }}
                                                                >
                                                                    <span>{discountPercent}% OFF</span>
                                                                </div>
                                                            )}

                                                            {/* Top Center Logo (BIG SAVE Smile) */}
                                                            <div className="w-full flex justify-center items-center shrink-0 z-10 pt-0.5 pointer-events-none">
                                                                <img
                                                                    src={logoImage || "/images/big_save_smile_logo.png"}
                                                                    alt="BIG SAVE Smile Logo"
                                                                    className="h-6 sm:h-7 md:h-8 max-w-[65%] object-contain"
                                                                />
                                                            </div>

                                                            {/* Product Image Layer */}
                                                            {showProductImages && (
                                                                <div className="absolute inset-0 z-[1] flex items-center justify-center p-2 pointer-events-none">
                                                                    <img
                                                                        src={getProxiedImageUrl(product.image)}
                                                                        alt={product.name}
                                                                        className="max-w-[90%] max-h-[78%] object-contain mt-1"
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Bottom/Middle Overlay: Product Title & Normal Price */}
                                                            <div className="w-full flex flex-col items-center justify-end z-[5] pointer-events-none pb-1 mt-auto">
                                                                {/* Product Title */}
                                                                <h2 
                                                                    className="font-black leading-tight tracking-tight text-center px-1"
                                                                    style={getDynamicTitleStyle(product.name, layout)}
                                                                >
                                                                    {product.name}
                                                                </h2>

                                                                {/* Normal Price & Unit (e.g. 46.00 / KG) */}
                                                                <div className="flex items-baseline justify-center w-full whitespace-nowrap mt-1">
                                                                    <span style={getDynamicPriceStyle(sellingPrice, layout)}>
                                                                        {Number(sellingPrice || 0).toFixed(2)}
                                                                    </span>
                                                                    <span className="ml-1" style={getDynamicUnitStyle(layout)}>
                                                                        / {(product.unit || 'KG').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Select Tag Button / Badge */}
                                                            <button
                                                                type="button"
                                                                data-html2canvas-ignore
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleProductSelection(product.id);
                                                                }}
                                                                className={`absolute bottom-1 left-1 z-30 print:hidden transition-all flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer shadow-sm text-[10px] font-bold select-none ${
                                                                    isSelected 
                                                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                                                                        : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-300 hover:border-emerald-500'
                                                                }`}
                                                                title={isSelected ? "Click to deselect tag" : "Click to select tag"}
                                                            >
                                                                {isSelected ? (
                                                                    <>
                                                                        <FaCheck className="text-[8px]" />
                                                                        <span>Selected</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-gray-400 leading-none">+</span>
                                                                        <span>Select</span>
                                                                    </>
                                                                )}
                                                            </button>

                                                            {/* Hover indicator for click-to-edit (bottom-6 left-1 to avoid select button) */}
                                                            <div 
                                                                data-html2canvas-ignore
                                                                className="absolute bottom-6 left-1 z-20 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 print:hidden pointer-events-none shadow"
                                                            >
                                                                <FaPencilAlt className="text-[8px] text-yellow-300" /> Edit Price
                                                            </div>

                                                            {/* Individual Save as PNG Button */}
                                                            <button
                                                                data-html2canvas-ignore
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveCardAsPng(product.id, product.name);
                                                                }}
                                                                disabled={saving}
                                                                className="absolute bottom-1 right-1 z-[20] bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer disabled:opacity-50"
                                                                title="Save this single tag as PNG"
                                                            >
                                                                Save PNG
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Sheet Footer matching uploaded tag sheet */}
                                    <footer className="w-full h-[5mm] shrink-0 flex justify-between items-center text-[9px] text-gray-500 font-medium select-none z-10 px-1 pt-1 border-t border-gray-150 print:border-none">
                                        <span>SMILE Supermarket</span>
                                        <span>
                                            {isSheetLandscape ? 'A4 Landscape Sheet' : 'A4 Portrait Sheet'} ({pageIdx + 1} of {pages.length}) | {layout === 'portrait_12' ? '3×4 Grid (12 Tags)' : (layout === 'landscape_12' ? '4×3 Grid (12 Tags)' : `${itemsPerPage} Tags`)} | 300 DPI Print Quality
                                        </span>
                                    </footer>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @page {
                    size: ${isPageLandscape ? '297mm 210mm' : '210mm 297mm'};
                    margin: 0mm !important;
                }
                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: ${isPageLandscape ? '297mm' : '210mm'} !important;
                        height: ${isPageLandscape ? '210mm' : '297mm'} !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body > div, main {
                        margin: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                        width: ${isPageLandscape ? '297mm' : '210mm'} !important;
                        overflow: visible !important;
                    }
                    #print-offers-container {
                        width: ${isPageLandscape ? '297mm' : '210mm'} !important;
                        min-width: ${isPageLandscape ? '297mm' : '210mm'} !important;
                        max-width: ${isPageLandscape ? '297mm' : '210mm'} !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }
                    .normal-poster-a4-landscape {
                        width: 297mm !important;
                        min-width: 297mm !important;
                        max-width: 297mm !important;
                        height: 210mm !important;
                        min-height: 210mm !important;
                        max-height: 210mm !important;
                        padding: 3mm !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .promotional-poster-target {
                        width: ${isLandscapePoster ? '297mm' : '210mm'} !important;
                        min-width: ${isLandscapePoster ? '297mm' : '210mm'} !important;
                        max-width: ${isLandscapePoster ? '297mm' : '210mm'} !important;
                        height: ${isLandscapePoster ? '210mm' : '297mm'} !important;
                        min-height: ${isLandscapePoster ? '210mm' : '297mm'} !important;
                        max-height: ${isLandscapePoster ? '210mm' : '297mm'} !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .sheet-page {
                        width: ${isSheetLandscape ? '297mm' : '210mm'} !important;
                        min-width: ${isSheetLandscape ? '297mm' : '210mm'} !important;
                        max-width: ${isSheetLandscape ? '297mm' : '210mm'} !important;
                        height: ${isSheetLandscape ? '210mm' : '297mm'} !important;
                        min-height: ${isSheetLandscape ? '210mm' : '297mm'} !important;
                        max-height: ${isSheetLandscape ? '210mm' : '297mm'} !important;
                        padding: 3mm 4mm 2mm 4mm !important;
                        margin: 0 auto !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .sheet-tag-card {
                        border: 1px dashed #9ca3af !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        box-sizing: border-box !important;
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
                                    Header Font Size
                                </label>
                                <select
                                    value={headerFontSize}
                                    onChange={(e) => setHeaderFontSize(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black cursor-pointer"
                                >
                                    <option value="extra_large">Heavy & Big (Default)</option>
                                    <option value="huge">Massive / Extra Big</option>
                                    <option value="large">Large</option>
                                    <option value="normal">Standard</option>
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

                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-3">
                                <label className="block text-[11px] font-extrabold uppercase text-gray-700 tracking-wider">
                                    Offer Duration / Validity (Auto-Dates & Editable)
                                </label>

                                {/* Date Pickers for Start & End */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={validityStartDate}
                                            onChange={(e) => handleValidityDatesChange(e.target.value, validityEndDate)}
                                            className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold text-black focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={validityEndDate}
                                            onChange={(e) => handleValidityDatesChange(validityStartDate, e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold text-black focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Quick:</span>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(6)}
                                        className="text-[10px] bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                                    >
                                        7 Days (Week)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(2)}
                                        className="text-[10px] bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                                    >
                                        Weekend (3 Days)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(0)}
                                        className="text-[10px] bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                                    >
                                        Today Only
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(13)}
                                        className="text-[10px] bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                                    >
                                        14 Days
                                    </button>
                                </div>

                                {/* Printed Poster Subtitle Text (Fully Editable) */}
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                                        Printed Header Text (Directly Editable)
                                    </label>
                                    <input
                                        type="text"
                                        value={posterSubtitle}
                                        onChange={(e) => setPosterSubtitle(e.target.value)}
                                        placeholder="e.g. OFFER VALIDITY: 16TH TO 22ND NOVEMBER"
                                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-black text-black tracking-wider focus:ring-2 focus:ring-indigo-500 uppercase"
                                    />
                                    <p className="text-[9px] text-gray-400 mt-1">Selecting dates auto-fills this text, or you can manually type any custom text.</p>
                                </div>
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
                                    <p className="text-xs text-indigo-600 font-bold mt-0.5">
                                        {printMode === 'sheet' ? 'Edit Tag Price, Name, Unit & Image' : 'Edit Poster Image, Price & MRP'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                            {/* Edit Product Title / Name */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase text-gray-600 mb-1">Product Title / Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter product title..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                                />
                            </div>

                            {/* Edit Product Unit */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase text-gray-600 mb-1">Product Unit</label>
                                <input
                                    type="text"
                                    value={editUnit}
                                    onChange={(e) => setEditUnit(e.target.value)}
                                    placeholder="e.g. 1 KG, 500 GM, 1 PC"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                                />
                            </div>

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
                                        <span className="font-bold text-emerald-800">
                                            {printMode === 'sheet' ? 'Tag Display Price:' : 'Poster Card Preview:'}
                                        </span>
                                        <span className="font-extrabold text-emerald-900">
                                            {printMode === 'sheet' ? (
                                                `${Number(editPrice || 0).toFixed(2)} / ${(editUnit || 'KG').toUpperCase()}`
                                            ) : (
                                                mrpNum > 0 && diff > 0 ? `Save ₹${diff.toFixed(2)} (${offPercent}% OFF)` : `Selling Price: ₹${priceNum.toFixed(2)}`
                                            )}
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

            {/* Save Selection Preset Modal */}
            {savingPresetModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-150 space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                                <FaBookmark className="text-emerald-600" /> Save Selection Preset
                            </h3>
                            <button
                                onClick={() => setSavingPresetModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveCurrentSelection} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Selection Preset Name
                                </label>
                                <input
                                    type="text"
                                    value={presetNameInput}
                                    onChange={(e) => setPresetNameInput(e.target.value)}
                                    placeholder="e.g. selection_1, selection_2..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    autoFocus
                                />
                                <p className="text-[11px] text-gray-500 mt-1.5">
                                    Saves {selectedProductIds.size} selected items in {printMode === 'normal_poster' ? 'Normal Price Poster' : 'Promotional Offer Poster'} mode ({posterLayout}-Grid layout).
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSavingPresetModal(false)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                                >
                                    Save Preset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
