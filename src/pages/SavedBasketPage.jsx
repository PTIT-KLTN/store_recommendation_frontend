import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketsList from '../components/saved-baskets/SavedBasketsList';
import { basketService } from '../services/basketService';
import { useBasket } from '../context/BasketContext';
import { toast } from 'react-toastify';
import { LuShoppingCart } from "react-icons/lu";

const SavedBasketsPage = () => {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { updateBasket } = useBasket();

    useEffect(() => {
        fetchSavedBaskets();
    }, []);

    const fetchSavedBaskets = async () => {
        try {
            setLoading(true);
            const savedBaskets = await basketService.getSavedBaskets();
            setBaskets(savedBaskets);
        } catch (error) {
            console.error("Error fetching saved baskets:", error);
            toast.error("Không thể tải giỏ hàng đã lưu. Vui lòng thử lại sau.");
            setBaskets([]);
        } finally {
            setLoading(false);
        }
    };

    // Add this function to handle adding saved basket to current cart
    const handleAddToCart = async (basket) => {
        try {
            // Convert saved basket format to current basket format
            const basketToAdd = {
                ingredients: basket.ingredients || [],
                dishes: basket.dishes || {}
            };

            // Use updateBasket to merge with current basket
            await updateBasket(basketToAdd);

            return Promise.resolve();
        } catch (error) {
            console.error("Error adding saved basket to cart:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Giỏ hàng đã lưu
                    </h1>
                    <p className="text-gray-600">
                        {baskets.length > 0
                            ? `Bạn có ${baskets.length} giỏ hàng đã lưu`
                            : "Bạn chưa có giỏ hàng nào được lưu"}
                    </p>
                </div>

                {baskets.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
                                <LuShoppingCart className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Chưa có giỏ hàng nào được lưu
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tạo và lưu các giỏ hàng yêu thích để mua sắm thuận tiện hơn
                                trong tương lai.
                            </p>
                            <button
                                onClick={() => (window.location.href = "/basket")}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Tạo giỏ hàng mới
                            </button>
                        </div>
                    </div>
                ) : (
                    // Baskets List - Now includes onAddToCart prop
                    <SavedBasketsList
                        baskets={baskets}
                        onRefresh={fetchSavedBaskets}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketsPage;