import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';

const DishCard = ({ 
    id, 
    image, 
    name, 
    englishName,
    ingredientCount, 
    ingredients, 
    category,
    servings 
}) => {
    const [showIngredientsModal, setShowIngredientsModal] = useState(false);
    const { openModal } = useModal();

    const addToCart = () => {
        openModal('dish', { 
            id, 
            name, 
            englishName,
            image, 
            ingredients,
            category,
            servings
        });
    };

    const toggleIngredientsModal = (e) => {
        e.stopPropagation();
        setShowIngredientsModal(!showIngredientsModal);
    };

    return (
        <>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Dish image */}
                <div className="w-full p-4 flex justify-center">
                    <img
                        src={image}
                        alt={name}
                        className="w-full object-contain h-48"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-dish.jpg';
                        }}
                    />
                </div>

                {/* Dish info and add button */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 mr-2">
                            <h3 className="font-medium text-gray-900 text-lg line-clamp-2">
                                {name}
                            </h3>
                            {englishName && englishName !== name && (
                                <p className="text-gray-600 text-sm mt-1">
                                    {englishName}
                                </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                                <p className="text-orange-500 text-xs">
                                    {ingredientCount} nguyên liệu
                                </p>
                                {servings && servings > 1 && (
                                    <span className="text-gray-400">•</span>
                                )}
                                {servings && servings > 1 && (
                                    <p className="text-gray-500 text-xs">
                                        {servings} khẩu phần
                                    </p>
                                )}
                            </div>
                            {category && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                                    {category}
                                </span>
                            )}
                        </div>
                        <button
                            className="bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0"
                            onClick={addToCart}
                            aria-label="Thêm vào giỏ hàng"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>

                    {/* View ingredients button */}
                    {ingredients && ingredients.length > 0 && (
                        <button
                            onClick={toggleIngredientsModal}
                            className="mt-3 text-blue-600 text-sm font-medium hover:underline w-full text-left"
                        >
                            Xem nguyên liệu →
                        </button>
                    )}
                </div>
            </div>

            {/* Ingredients Modal */}
            {showIngredientsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" 
                    onClick={toggleIngredientsModal}
                >
                    <div 
                        className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                                {englishName && englishName !== name && (
                                    <p className="text-gray-600 text-sm mt-1">{englishName}</p>
                                )}
                                {category && (
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                                        {category}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={toggleIngredientsModal}
                                className="text-gray-500 hover:text-gray-700 p-1"
                                aria-label="Đóng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900">Nguyên liệu</h4>
                                <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                                    {ingredientCount} món
                                </span>
                            </div>

                            {ingredients && ingredients.length > 0 ? (
                                <ul className="space-y-3">
                                    {ingredients.map((ingredient, index) => (
                                        <li 
                                            key={ingredient._id || ingredient.id || `ingredient-${index}`} 
                                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-12 h-12 flex-shrink-0">
                                                <img
                                                    src={ingredient.image}
                                                    alt={ingredient.vietnamese_name}
                                                    className="w-full h-full object-cover rounded-full border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/images/default-ingredient.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {ingredient.vietnamese_name }
                                                </p>
                                                {ingredient.name && ingredient.name !== ingredient.vietnamese_name && (
                                                    <p className="text-sm text-gray-500">
                                                        {ingredient.name}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {ingredient.quantity && (
                                                        <span className="text-sm text-gray-600 font-medium">
                                                            {ingredient.quantity}
                                                        </span>
                                                    )}
                                                    {ingredient.unit && (
                                                        <span className="text-sm text-gray-500">
                                                            {ingredient.unit}
                                                        </span>
                                                    )}
                                                    {ingredient.category && (
                                                        <>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">
                                                                {ingredient.category}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Chưa có thông tin nguyên liệu</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={toggleIngredientsModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => {
                                        addToCart();
                                        toggleIngredientsModal();
                                    }}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Thêm vào giỏ hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DishCard;