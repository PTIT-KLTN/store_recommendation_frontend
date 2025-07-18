import React, { useState, useEffect } from 'react';
import { ingredientService } from '../../services/ingredientService';
import { getCategoryNameVN } from '../../utils/categoryMapping';

const IngredientCategories = ({ activeCategory, setActiveCategory, onCategoryChange }) => {
    const [categories, setCategories] = useState(['Tất cả']);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
       
        setLoading(true);
        const response = await ingredientService.getCategories();
        
        const allCategories = ['Tất cả', ...response.categories];
        setCategories(allCategories);
    
        setLoading(false);
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (onCategoryChange) {
            onCategoryChange(category);
        }
    };

    const formatCategoryName = (category) => {
        if (category === 'Tất cả') return category;
        return getCategoryNameVN(category);
    };

    // Determine which categories to show
    const categoriesToShow = showAll ? categories : categories.slice(0, 12);
    const hasMoreCategories = categories.length > 12;

    if (loading) {
        return (
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Mục Nguyên Liệu</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }, (_, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 rounded-full bg-gray-200 h-10"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Danh Mục Nguyên Liệu</h2>
                {hasMoreCategories && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                    >
                        <span>{showAll ? 'Thu gọn' : `Xem thêm ${categories.length - 12} danh mục`}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categoriesToShow.map((category, index) => {
                    const displayName = formatCategoryName(category);
                    const isActive = activeCategory === category;
                    
                    return (
                        <button
                            key={index}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 text-center ${
                                isActive
                                    ? "bg-orange-500 text-white shadow-lg"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md"
                            }`}
                            onClick={() => handleCategoryClick(category)}
                            title={category !== 'Tất cả' ? `${displayName} (${category})` : displayName}
                        >
                            <span className="block truncate">
                                {displayName}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Show category count */}
            <div className="mt-3 text-xs text-gray-500 text-center">
                Hiển thị {categoriesToShow.length} / {categories.length} danh mục
            </div>
        </div>
    );
};

export default IngredientCategories;