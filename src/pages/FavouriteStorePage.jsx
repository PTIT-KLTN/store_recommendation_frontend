import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LuHeart, LuMapPin, LuPhone } from "react-icons/lu";
import { GoStarFill } from "react-icons/go";

const FavouriteStores = () => {
    const [favouriteStores, setFavouriteStores] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removingStore, setRemovingStore] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [userResponse, storesResponse] = await Promise.all([
                userService.getUserInfo(),
                userService.getFavouriteStores()
            ]);

            setUserInfo(userResponse);
            setFavouriteStores(storesResponse.favourite_stores || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavourite = async (storeId, storeName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa "${storeName}" khỏi danh sách yêu thích?`)) {
            return;
        }

        try {
            setRemovingStore(storeId);
            await userService.removeFavouriteStore(storeId);

            setFavouriteStores(prev => prev.filter(store => store.store_id !== storeId));
            toast.success('Đã xóa cửa hàng khỏi danh sách yêu thích');
        } catch (error) {
            toast.error('Không thể xóa cửa hàng');
            console.error('Error removing favourite store:', error);
        } finally {
            setRemovingStore(null);
        }
    };

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng yêu thích</h1>
                    <p className="text-gray-600">
                        {favouriteStores.length > 0
                            ? `Bạn có ${favouriteStores.length} cửa hàng yêu thích`
                            : 'Bạn chưa có cửa hàng yêu thích nào'
                        }
                    </p>
                </div>

                {favouriteStores.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
                                <LuHeart className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có cửa hàng yêu thích</h3>
                            <p className="text-gray-600 mb-6">
                                Khám phá và thêm những cửa hàng ưa thích của bạn để dễ dàng truy cập sau này.
                            </p>
                            <button
                                onClick={() => window.location.href = '/stores'}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Khám phá cửa hàng
                            </button>
                        </div>
                    </div>
                ) : (
                    // Stores Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favouriteStores.map((store) => (
                            <div key={store.store_id} className="border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 group">
                                <div className="p-6">
                                    {/* Store Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate group-hover:text-green-700 transition-colors">
                                                {store.store_name}
                                            </h3>
                                            {store.chain && (
                                                <div className="inline-flex items-center">
                                                    <span className="text-sm font-medium text-blue-600 border border-blue-200 px-3 py-1 rounded-full">
                                                        {store.chain}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFavourite(store.store_id, store.store_name)}
                                            disabled={removingStore === store.store_id}
                                            className={`ml-3 p-2 rounded-full border border-transparent transition-all duration-200 ${removingStore === store.store_id
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-red-500 hover:border-red-200 hover:text-red-600 hover:scale-110'
                                                }`}
                                            title="Xóa khỏi yêu thích"
                                        >
                                            {removingStore === store.store_id ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                                            ) : (
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Store Details */}
                                    <div className="space-y-4">
                                        {store.store_location && (
                                            <div className="flex items-start">
                                                <div className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0">
                                                    <LuMapPin className="w-full h-full text-gray-400"/>
                                                </div>
                                                <span className="text-sm text-gray-600 leading-relaxed line-clamp-3">{store.store_location}</span>
                                            </div>
                                        )}

                                        {store.phone && (
                                            <div className="flex items-center">
                                                <div className="w-5 h-5 mr-3 flex-shrink-0">
                                                    <LuPhone className="w-full h-full text-gray-400"/>
                                                </div>
                                                <span className="text-gray-600 font-medium">{store.phone}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {store.totalScore > 0 && (
                                            <div className="flex items-center">
                                                <GoStarFill className="h-4 w-4 text-yellow-500 mr-1" />
                                                <span className="text-gray-900 font-bold text-sm">{store.totalScore.toFixed(1)}</span>
                                                {store.reviewsCount > 0 && (
                                                    <span className="text-gray-500 ml-1 text-xs">({store.reviewsCount})</span>
                                                )}
                                            </div>
                                        )}

                                    </div>

                                    {/* Added Date */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-gray-500">
                                                Đã thêm vào {formatDate(store.added_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default FavouriteStores;