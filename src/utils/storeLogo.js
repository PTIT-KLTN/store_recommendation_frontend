const STORE_LOGOS = {
    'BHX': 'https://cdn.haitrieu.com/wp-content/uploads/2022/03/Logo-Bach-Hoa-Xanh-V-635x635.png',
    
    'winmart': 'https://tse3.mm.bing.net/th/id/OIP.rhMcFA3HOLw-r2F4ydA2EQHaFJ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    'winmart+': 'https://www.hoteljob.vn/uploads/images/2022/10/18/634e0fa9dc9e98_13188413.png',
};

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

export const getStoreBrandColor = (chain) => {
    const colorMap = {
        'BHX': '#00A651',
        'WinMart': '#E31E24',
        'WinMart+': '#E31E24',
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