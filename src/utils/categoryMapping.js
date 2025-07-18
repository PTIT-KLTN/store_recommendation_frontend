export const categoryMapping = {
    'Alcoholic Beverages': 'Đồ uống có cồn',
    'Beverages': 'Nước giải khát',
    'Cakes': 'Bánh ngọt',
    'Candies': 'Kẹo',
    'Cereals & Grains': 'Ngũ cốc & Hạt',
    'Cold Cuts: Sausages & Ham': 'Thịt nguội: Xúc xích & Giăm bông',
    'Dried Fruits': 'Trái cây khô',
    'Fresh Fruits': 'Trái cây tươi',
    'Fresh Meat': 'Thịt tươi',
    'Fruit Jam': 'Mứt trái cây',
    'Grains & Staples': 'Ngũ cốc & Thực phẩm chính',
    'Ice Cream & Cheese': 'Kem & Phô mai',
    'Instant Foods': 'Thực phẩm tiện lợi',
    'Seafood & Fish Balls': 'Hải sản & Chả cá',
    'Seasonings': 'Gia vị',
    'Snacks': 'Đồ ăn vặt',
    'Vegetables': 'Rau củ',
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