// utils/storeLogo.js

// Store chain logos mapping
const STORE_LOGOS = {
    // Vietnamese Supermarket Chains
    'BHX': 'https://cdn.haitrieu.com/wp-content/uploads/2022/03/Logo-Bach-Hoa-Xanh-V-635x635.png',
    'Bách Hóa Xanh': 'https://cdn.tgdd.vn/bhx-static/bhx/images/bhx-logo.png',
    
    'winmart': 'https://tse3.mm.bing.net/th/id/OIP.rhMcFA3HOLw-r2F4ydA2EQHaFJ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    'winmart+': 'https://www.hoteljob.vn/uploads/images/2022/10/18/634e0fa9dc9e98_13188413.png',
    'WinCommerce': 'https://cdn.tgdd.vn/Products/Images/logos/winmart-logo.png',
    
    'Co.opmart': 'https://cdn.tgdd.vn/Products/Images/logos/coopmart-logo.png',
    'Co.op Food': 'https://cdn.tgdd.vn/Products/Images/logos/coopfood-logo.png',
    'Coop': 'https://cdn.tgdd.vn/Products/Images/logos/coop-logo.png',
    
    'Big C': 'https://cdn.tgdd.vn/Products/Images/logos/bigc-logo.png',
    'BigC': 'https://cdn.tgdd.vn/Products/Images/logos/bigc-logo.png',
    
    'Lotte Mart': 'https://cdn.tgdd.vn/Products/Images/logos/lottemart-logo.png',
    'LOTTE': 'https://cdn.tgdd.vn/Products/Images/logos/lottemart-logo.png',
    
    'AEON': 'https://cdn.tgdd.vn/Products/Images/logos/aeon-logo.png',
    'AEON Mall': 'https://cdn.tgdd.vn/Products/Images/logos/aeon-logo.png',
    
    'Mega Market': 'https://cdn.tgdd.vn/Products/Images/logos/megamarket-logo.png',
    'MM Mega Market': 'https://cdn.tgdd.vn/Products/Images/logos/megamarket-logo.png',
    
    'Emart': 'https://cdn.tgdd.vn/Products/Images/logos/emart-logo.png',
    'E-Mart': 'https://cdn.tgdd.vn/Products/Images/logos/emart-logo.png',
    
    'VinMart': 'https://cdn.tgdd.vn/Products/Images/logos/vinmart-logo.png',
    'VinMart+': 'https://cdn.tgdd.vn/Products/Images/logos/vinmart-plus-logo.png',
    'VinCommerce': 'https://cdn.tgdd.vn/Products/Images/logos/vinmart-logo.png',
    
    'Satra': 'https://cdn.tgdd.vn/Products/Images/logos/satra-logo.png',
    'Satramart': 'https://cdn.tgdd.vn/Products/Images/logos/satra-logo.png',
    
    'Circle K': 'https://cdn.tgdd.vn/Products/Images/logos/circlek-logo.png',
    'CircleK': 'https://cdn.tgdd.vn/Products/Images/logos/circlek-logo.png',
    
    '7-Eleven': 'https://cdn.tgdd.vn/Products/Images/logos/7eleven-logo.png',
    '7Eleven': 'https://cdn.tgdd.vn/Products/Images/logos/7eleven-logo.png',
    
    'Family Mart': 'https://cdn.tgdd.vn/Products/Images/logos/familymart-logo.png',
    'FamilyMart': 'https://cdn.tgdd.vn/Products/Images/logos/familymart-logo.png',
    
    'B\'s Mart': 'https://cdn.tgdd.vn/Products/Images/logos/bsmart-logo.png',
    'BS Mart': 'https://cdn.tgdd.vn/Products/Images/logos/bsmart-logo.png',
    
    'Ministop': 'https://cdn.tgdd.vn/Products/Images/logos/ministop-logo.png',
    
    'Shop & Go': 'https://cdn.tgdd.vn/Products/Images/logos/shopgo-logo.png',
    'Shop&Go': 'https://cdn.tgdd.vn/Products/Images/logos/shopgo-logo.png',
    
    'GS25': 'https://cdn.tgdd.vn/Products/Images/logos/gs25-logo.png',
    'GS 25': 'https://cdn.tgdd.vn/Products/Images/logos/gs25-logo.png',
    
    // Traditional Markets and Local Stores
    'Chợ Bến Thành': 'https://cdn.tgdd.vn/Products/Images/logos/traditional-market-logo.png',
    'Chợ': 'https://cdn.tgdd.vn/Products/Images/logos/traditional-market-logo.png',
    'Market': 'https://cdn.tgdd.vn/Products/Images/logos/traditional-market-logo.png',
    'Siêu thị': 'https://cdn.tgdd.vn/Products/Images/logos/supermarket-logo.png',
    
    // Generic fallback
    'default': 'https://cdn.tgdd.vn/Products/Images/logos/store-default-logo.png'
};

/**
 * Get store logo URL based on chain name
 * @param {string} chain - Store chain name
 * @returns {string} - Logo URL
 */
export const getStoreLogo = (chain) => {
    if (!chain) {
        return STORE_LOGOS.default;
    }

    // Direct match
    const directMatch = STORE_LOGOS[chain];
    if (directMatch) {
        return directMatch;
    }

    // Case insensitive search
    const chainLower = chain.toLowerCase();
    const chainKeys = Object.keys(STORE_LOGOS);
    
    for (const key of chainKeys) {
        if (key.toLowerCase() === chainLower) {
            return STORE_LOGOS[key];
        }
    }

    // Partial match search
    for (const key of chainKeys) {
        if (chainLower.includes(key.toLowerCase()) || key.toLowerCase().includes(chainLower)) {
            return STORE_LOGOS[key];
        }
    }

    return STORE_LOGOS.default;
};

/**
 * Get store brand color based on chain name
 * @param {string} chain - Store chain name
 * @returns {string} - Brand color hex
 */
export const getStoreBrandColor = (chain) => {
    const colorMap = {
        'BHX': '#00A651',
        'Bách Hóa Xanh': '#00A651',
        'WinMart': '#E31E24',
        'WinMart+': '#E31E24',
        'Co.opmart': '#0066CC',
        'Co.op Food': '#0066CC',
        'Big C': '#FF6B35',
        'BigC': '#FF6B35',
        'Lotte Mart': '#C41E3A',
        'AEON': '#FF6B6B',
        'Circle K': '#E31E24',
        '7-Eleven': '#FF6600',
        'Family Mart': '#00A651',
        'VinMart': '#1E88E5',
        'VinMart+': '#1E88E5',
        'default': '#6B7280'
    };

    if (!chain) return colorMap.default;

    const directMatch = colorMap[chain];
    if (directMatch) return directMatch;

    const chainLower = chain.toLowerCase();
    const colorKeys = Object.keys(colorMap);
    
    for (const key of colorKeys) {
        if (key.toLowerCase() === chainLower) {
            return colorMap[key];
        }
    }

    for (const key of colorKeys) {
        if (chainLower.includes(key.toLowerCase()) || key.toLowerCase().includes(chainLower)) {
            return colorMap[key];
        }
    }

    return colorMap.default;
};

/**
 * Check if store logo should use dark text
 * @param {string} chain - Store chain name
 * @returns {boolean} - Whether to use dark text
 */
export const shouldUseDarkText = (chain) => {
    const lightBackgrounds = ['WinMart', 'WinMart+', '7-Eleven', 'AEON'];
    return lightBackgrounds.some(bg => 
        chain && chain.toLowerCase().includes(bg.toLowerCase())
    );
};

export default {
    getStoreLogo,
    getStoreBrandColor,
    shouldUseDarkText,
    STORE_LOGOS
};