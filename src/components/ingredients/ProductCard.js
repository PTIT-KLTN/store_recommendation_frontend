import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useBasket } from '../../context/BasketContext';
import { ingredientService } from '../../services/ingredientService';
import { getCategoryNameVN } from '../../utils/categoryMapping';

const ProductCard = ({ id, vietnamese_name, name, unit, image, category }) => {
    const { openModal } = useModal();
    const { addIngredient } = useBasket();
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = async () => {
        setLoading(true);

        const completeIngredient = {
            id: id,
            vietnamese_name: vietnamese_name,
            name: name,
            unit: unit,
            image: image,
            category: category || 'Khác',
            quantity: 1
        };

        openModal('ingredients', [completeIngredient]);

        setLoading(false);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // Get Vietnamese category name
    const getCategoryDisplayName = (cat) => {
        if (!cat) return '';
        return getCategoryNameVN(cat);
    };

    // Get category color based on type
    const getCategoryColor = (cat) => {
        const colorMap = {
            'vegetables': 'bg-green-100 text-green-800',
            'fresh_fruits': 'bg-red-100 text-red-800',
            'fresh_meat': 'bg-red-200 text-red-900',
            'seafood_&_fish_balls': 'bg-blue-100 text-blue-800',
            'seasonings': 'bg-yellow-100 text-yellow-800',
            'beverages': 'bg-purple-100 text-purple-800',
            'dairy': 'bg-blue-50 text-blue-700',
            'grains_&_staples': 'bg-amber-100 text-amber-800',
            'snacks': 'bg-orange-100 text-orange-800',
        };
        
        return colorMap[cat] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="w-full max-w-xs bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Product image */}
            <div className="w-full p-4 flex justify-center bg-gray-50 relative">
                <div className="relative w-full h-48 flex items-center justify-center">
                    <img
                        src={image}
                        alt={vietnamese_name || name}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
                    />
                    
                    {/* Category badge with Vietnamese name */}
                    {category && (
                        <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getCategoryColor(category)}`}>
                            {getCategoryDisplayName(category)}
                        </div>
                    )}
                </div>
            </div>

            {/* Product info and add button */}
            <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-100">
                <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-medium text-gray-900 text-lg truncate" title={vietnamese_name}>
                        {vietnamese_name}
                    </h3>
                    
                    {name && name !== vietnamese_name && (
                        <p className="text-gray-500 text-sm truncate" title={name}>
                            {name}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                        {unit && (
                            <p className="text-gray-400 text-xs">
                                Đơn vị: {unit}
                            </p>
                        )}
                        
                        {category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(category)}`}>
                                {getCategoryDisplayName(category)}
                            </span>
                        )}
                    </div>
                </div>
                
                <button
                    className={`bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                        loading ? 'opacity-50 cursor-wait' : ''
                    }`}
                    onClick={handleAddToCart}
                    disabled={loading}
                    aria-label={`Thêm ${vietnamese_name} vào giỏ hàng`}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;