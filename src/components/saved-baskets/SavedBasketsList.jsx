import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiCalendar, FiChevronRight, FiTrash2, FiPackage, FiClock, FiEye } from 'react-icons/fi';
import { basketService } from '../../services/basketService';
import { toast } from 'react-toastify';
import { images } from '../../assets/assets';
import BasketDetailDialog from './BasketDetailDialog';

const SavedBasketsList = ({ baskets, onRefresh, onAddToCart }) => {
    const [selectedBasket, setSelectedBasket] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return '';
        }
    };

    const getBasketCounts = (basket) => {
        const ingredientCount = basket.ingredients_count || 0;
        const dishCount = basket.dishes_count || 0;
        return { ingredientCount, dishCount };
    };

    const handleRemoveBasket = async (index, event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await basketService.removeSavedBasket(index);
            toast.success("Đã xóa giỏ hàng thành công!");

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error removing basket:", error);
            toast.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    const handleViewBasket = (basket, event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedBasket(basket);
        setShowDetailDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDetailDialog(false);
        setSelectedBasket(null);
    };

    const handleAddToCart = async (basket) => {
        try {
            setLoading(true);
            
            if (onAddToCart) {
                await onAddToCart(basket);
                toast.success(`Đã thêm "${basket.basket_name}" vào giỏ hàng!`);
                handleCloseDialog();
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBasket = async (basketId) => {
        try {
            setLoading(true);
            
            // Find basket index
            const basketIndex = baskets.findIndex(b => b._id === basketId);
            if (basketIndex !== -1) {
                await basketService.removeSavedBasket(basketIndex);
                toast.success("Đã xóa giỏ hàng thành công!");
                
                if (onRefresh) {
                    onRefresh();
                }
                handleCloseDialog();
            }
        } catch (error) {
            console.error("Error deleting basket:", error);
            toast.error("Không thể xóa giỏ hàng. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
          

            {/* Baskets List */}
            <div className="divide-y divide-gray-100">
                {Array.isArray(baskets) && baskets.map((basket, index) => {
                    const { ingredientCount, dishCount } = getBasketCounts(basket);
                    const basketName = basket.basket_name;
                    const savedDate = basket.created_at;
                    const totalItems = ingredientCount + dishCount;

                    return (
                        <div
                            key={index}
                            className="group hover:bg-gray-50 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center flex-grow min-w-0">
                                    {/* Icon */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
                                        <FiShoppingBag className="text-orange-600 w-7 h-7" />
                                    </div>

                                    {/* Content */}
                                    <div className="ml-4 flex-grow min-w-0">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-green-700 transition-colors">
                                            {basketName}
                                        </h3>
                                        
                                        {/* Stats */}
                                        <div className="flex items-center text-gray-600 text-sm mt-1 space-x-4">
                                            <div className="flex items-center">
                                                <FiPackage className="w-4 h-4 mr-1" />
                                                <span>{ingredientCount} nguyên liệu</span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <img src={images.cart} alt="" className="w-4 h-4 mr-1" />
                                                <span>{dishCount} món ăn</span>
                                            </div>

                                            {totalItems > 0 && (
                                                <div className="flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    <span className="font-medium text-green-600">
                                                        {totalItems} tổng cộng
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Date */}
                                        {savedDate && (
                                            <div className="flex items-center text-gray-500 text-xs mt-2">
                                                <FiClock className="w-3 h-3 mr-1" />
                                                <span>Lưu lúc: {formatDate(savedDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 ml-4">
                                    {/* View Detail Button */}
                                    <button
                                        onClick={(e) => handleViewBasket(basket, e)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110"
                                        title="Xem chi tiết"
                                    >
                                        <FiEye className="w-5 h-5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleRemoveBasket(index, e)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                                        title="Xóa giỏ hàng"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {(!Array.isArray(baskets) || baskets.length === 0) && (
                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShoppingBag className="text-gray-400 w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chưa có giỏ hàng nào được lưu
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        Bạn chưa có giỏ hàng đã lưu nào. Hãy tạo giỏ hàng và lưu để sử dụng sau.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-green-700 text-sm">
                            💡 <strong>Mẹo:</strong> Bấm "Lưu giỏ hàng yêu thích" ở trang giỏ hàng để lưu giỏ hàng hiện tại
                        </p>
                    </div>
                </div>
            )}

            {/* Basket Detail Dialog */}
            <BasketDetailDialog
                isOpen={showDetailDialog}
                basket={selectedBasket}
                onClose={handleCloseDialog}
                onAddToCart={handleAddToCart}
                onDeleteBasket={handleDeleteBasket}
                loading={loading}
            />
        </div>
    );
};

export default SavedBasketsList;