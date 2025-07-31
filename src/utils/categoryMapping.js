export const categoryMapping = {
    'Fresh Meat': 'Thịt tươi',
    'Vegetables': 'Rau củ',
    'Cereals & Grains': 'Ngũ cốc & Hạt',
    'Seafood & Fish Balls': 'Hải sản',
    'Seasonings': 'Gia vị',
    'Cold Cuts: Sausages & Ham': 'Thịt nguội: Xúc xích & Giăm bông',
    'Grains & Staples': 'Thực phẩm chính',
    'Fresh Fruits': 'Trái cây tươi',
    'Dried Fruits': 'Trái cây khô',
    'Ice Cream & Cheese': 'Kem',
    'Instant Foods': 'Thực phẩm tiện lợi',
    'Alcoholic Beverages': 'Đồ uống có cồn',
    'Beverages': 'Nước giải khát',
    'Cakes': 'Bánh ngọt',
    'Candies': 'Kẹo',
    'Fruit Jam': 'Mứt trái cây',
    'Snacks': 'Đồ ăn vặt',
    'Yogurt': 'Sữa chua',
    'Milk' : "Sữa các loại"
};

export const getCategoryNameVN = (englishCategory) => {
    if (!englishCategory) return '';
    
    return categoryMapping[englishCategory] ;
};


export const getAllCategoryMappings = () => {
    return categoryMapping;
};

export const searchCategoriesVN = (searchTerm) => {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    return Object.entries(categoryMapping).filter(([key, value]) => 
        value.toLowerCase().includes(term) || 
        key.toLowerCase().includes(term)
    );
};