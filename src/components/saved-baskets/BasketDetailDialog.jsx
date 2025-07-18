import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiPackage, FiClock, FiTrash2, FiPlus, FiChevronDown, FiChevronRight, FiCoffee } from 'react-icons/fi';
import { images } from '../../assets/assets';

const BasketDetailDialog = ({ 
    isOpen, 
    basket, 
    onClose, 
    onAddToCart, 
    onDeleteBasket, 
    loading = false 
}) => {
    const [expandedSections, setExpandedSections] = useState({
        ingredients: true,
        dishes: {}
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const toggleSection = (section, dishKey = null) => {
        if (section === 'ingredients') {
            setExpandedSections(prev => ({
                ...prev,
                ingredients: !prev.ingredients
            }));
        } else if (section === 'dish' && dishKey) {
            setExpandedSections(prev => ({
                ...prev,
                dishes: {
                    ...prev.dishes,
                    [dishKey]: !prev.dishes[dishKey]
                }
            }));
        }
    };

    const handleAddToCart = () => {
        onAddToCart(basket);
    };

    const handleDeleteBasket = () => {
        onDeleteBasket(basket._id);
    };

    if (!isOpen || !basket) return null;

    const totalIngredients = basket.ingredients_count || 0;
    const totalDishes = basket.dishes_count || 0;
    const totalItems = totalIngredients + totalDishes;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                                <FiShoppingBag className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    {basket.basket_name || 'Giỏ hàng đã lưu'}
                                </h3>
                                <div className="flex items-center text-green-100 text-sm mt-1">
                                    <FiClock className="w-4 h-4 mr-1" />
                                    <span>Lưu lúc: {formatDate(basket.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-green-200 transition-colors"
                            disabled={loading}
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[50vh] p-6">
                    {/* Ingredients Section */}
                    {basket.ingredients && basket.ingredients.length > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={() => toggleSection('ingredients')}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <FiPackage className="text-blue-600 w-5 h-5 mr-2" />
                                    <span className="font-semibold text-blue-800">
                                        Nguyên liệu ({basket.ingredients.length})
                                    </span>
                                </div>
                                {expandedSections.ingredients ? 
                                    <FiChevronDown className="text-blue-600 w-5 h-5" /> :
                                    <FiChevronRight className="text-blue-600 w-5 h-5" />
                                }
                            </button>

                            {expandedSections.ingredients && (
                                <div className="mt-3 space-y-2">
                                    {basket.ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <img
                                                src={ingredient.image || images.defaultIngredient}
                                                alt={ingredient.vietnamese_name || ingredient.name}
                                                className="w-12 h-12 object-cover rounded-lg mr-3"
                                                onError={(e) => {
                                                    e.target.src = images.defaultIngredient;
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {ingredient.vietnamese_name || ingredient.name}
                                                </h4>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="font-medium text-green-600 mr-2">
                                                        {ingredient.quantity} {ingredient.unit}
                                                    </span>
                                                    {ingredient.category && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                            {ingredient.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dishes Section */}
                    {basket.dishes && Object.keys(basket.dishes).length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <FiCoffee className="text-orange-800 w-5 h-5 mr-2" />
                                <span className="font-semibold text-orange-800">
                                    Món ăn ({Object.keys(basket.dishes).length})
                                </span>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(basket.dishes).map(([dishKey, dish]) => (
                                    <div key={dishKey} className="border border-orange-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('dish', dishKey)}
                                            className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={dish.imageUrl || images.defaultDish}
                                                    alt={dish.name}
                                                    className="w-12 h-12 object-cover rounded-lg mr-3"
                                                    onError={(e) => {
                                                        e.target.src = images.defaultDish;
                                                    }}
                                                />
                                                <div className="text-left">
                                                    <h4 className="font-medium text-gray-900">{dish.name}</h4>
                                                    <span className="text-sm text-orange-600">
                                                        {dish.servings} phần ăn • {dish.ingredients?.length || 0} nguyên liệu
                                                    </span>
                                                </div>
                                            </div>
                                            {expandedSections.dishes[dishKey] ? 
                                                <FiChevronDown className="text-orange-600 w-5 h-5" /> :
                                                <FiChevronRight className="text-orange-600 w-5 h-5" />
                                            }
                                        </button>

                                        {expandedSections.dishes[dishKey] && dish.ingredients && (
                                            <div className="p-4 bg-white border-t border-orange-200">
                                                <div className="space-y-2">
                                                    {dish.ingredients.map((ingredient, index) => (
                                                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                                            <img
                                                                src={ingredient.imageUrl || images.defaultIngredient}
                                                                alt={ingredient.vietnamese_name}
                                                                className="w-8 h-8 object-cover rounded mr-2"
                                                                onError={(e) => {
                                                                    e.target.src = images.defaultIngredient;
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {ingredient.vietnamese_name}
                                                                </span>
                                                                <div className="text-xs text-gray-600">
                                                                    {ingredient.unit}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {(!basket.ingredients || basket.ingredients.length === 0) && 
                     (!basket.dishes || Object.keys(basket.dishes).length === 0) && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShoppingBag className="text-gray-400 w-8 h-8" />
                            </div>
                            <p className="text-gray-500">Giỏ hàng này trống</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                            disabled={loading || totalItems === 0}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <FiPlus className="w-5 h-5 mr-2" />
                                    Thêm vào giỏ hàng
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDeleteBasket}
                            className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            disabled={loading}
                            title="Xóa khỏi giỏ hàng đã lưu"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-3 text-center">
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                            disabled={loading}
                        >
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasketDetailDialog;