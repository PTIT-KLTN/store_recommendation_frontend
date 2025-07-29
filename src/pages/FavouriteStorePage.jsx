import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
                    <div className="text-center py-16">
                        <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
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
                            <div key={store.store_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="p-6">
                                    {/* Store Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                                                {store.store_name}
                                            </h3>
                                            {store.chain && (
                                                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                                    {store.chain}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFavourite(store.store_id, store.store_name)}
                                            disabled={removingStore === store.store_id}
                                            className={`ml-3 p-2 rounded-full transition-colors ${
                                                removingStore === store.store_id
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
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
                                    <div className="space-y-3">
                                        {store.store_location && (
                                            <div className="flex items-start text-sm text-gray-600">
                                                <svg className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="line-clamp-2">{store.store_location}</span>
                                            </div>
                                        )}

                                        {store.phone && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{store.phone}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center justify-between pt-2">
                                            {store.distance_km > 0 && (
                                                <div className="flex items-center text-gray-500">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{formatDistance(store.distance_km)}</span>
                                                </div>
                                            )}

                                            {store.totalScore > 0 && (
                                                <div className="flex items-center">
                                                    <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    <span className="text-gray-700 font-medium text-sm">{store.totalScore.toFixed(1)}</span>
                                                    {store.reviewsCount > 0 && (
                                                        <span className="text-gray-400 ml-1 text-sm">({store.reviewsCount})</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Added Date */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            Đã thêm vào {formatDate(store.added_at)}
                                        </p>
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