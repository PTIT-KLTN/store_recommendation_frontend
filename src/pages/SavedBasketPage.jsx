import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketsList from '../components/saved-baskets/SavedBasketsList';
import { basketService } from '../services/basketService';
import { toast } from 'react-toastify';

const SavedBasketsPage = () => {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng đã lưu</h1>
                    <p className="text-gray-600">
                        {baskets.length > 0 
                            ? `Bạn có ${baskets.length} giỏ hàng đã lưu` 
                            : 'Bạn chưa có giỏ hàng nào được lưu'
                        }
                    </p>
                </div>

                {baskets.length === 0 ? (
                    // Empty State
                    <div className="text-center py-16">
                        <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M17 18a2 2 0 11-4 0 2 2 0 014 0zM9 18a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có giỏ hàng nào được lưu</h3>
                            <p className="text-gray-600 mb-6">
                                Tạo và lưu các giỏ hàng yêu thích để mua sắm thuận tiện hơn trong tương lai.
                            </p>
                            <button 
                                onClick={() => window.location.href = '/calculate'}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Tạo giỏ hàng mới
                            </button>
                        </div>
                    </div>
                ) : (
                    // Baskets List
                    <SavedBasketsList baskets={baskets} onRefresh={fetchSavedBaskets} />
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketsPage;