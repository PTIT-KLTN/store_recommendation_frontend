import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { userService } from '../services/userService';
import { useUser } from '../context/UserContext';
import { getStoreLogo, getStoreBrandColor } from '../utils/storeLogo';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import StoreDetailModal from '../components/StoreDetailModal';
import { FiHeart } from "react-icons/fi";

const StoreList = () => {
    const { user } = useUser();
    
    // State management
    const [stores, setStores] = useState([]);
    const [chains, setChains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Favourite stores state
    const [favouriteStores, setFavouriteStores] = useState(new Set());
    const [favouriteLoading, setFavouriteLoading] = useState({});
    
    // Modal state
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Filter states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChain, setSelectedChain] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showNearby, setShowNearby] = useState(false);
    const [radiusKm, setRadiusKm] = useState(10);
    
    const pageSize = 21;

    // Load initial data
    useEffect(() => {
        loadStoreChains();
        loadStores();
        if (user) {
            loadFavouriteStores();
        }
    }, [user]);

    // Load stores when filters change
    useEffect(() => {
        if (!loading) {
            setCurrentPage(0);
            loadStores();
        }
    }, [selectedChain, selectedLocation, searchQuery, showNearby, radiusKm]);

    // Load stores when page changes
    useEffect(() => {
        if (!loading && currentPage > 0) {
            loadStores();
        }
    }, [currentPage]);

    const loadStoreChains = async () => {
        try {
            const data = await storeService.getStoreChains();
            setChains(data.chains || []);
        } catch (error) {
            console.error('Error loading store chains:', error);
        }
    };

    const loadFavouriteStores = async () => {
        try {
            const response = await userService.getFavouriteStores();
            const favouriteStoreIds = new Set(
                (response.favourite_stores || []).map(store => store.store_id)
            );
            setFavouriteStores(favouriteStoreIds);
        } catch (error) {
            console.error('Error loading favourite stores:', error);
        }
    };

    const loadStores = async () => {
        try {
            setSearchLoading(true);
            setError('');
            
            if (showNearby) {
                // Load nearby stores from user's near_stores
                const data = await storeService.getNearbyStores({
                    refresh: currentPage === 0, // Refresh only on first load
                    radius_km: radiusKm,
                    limit: pageSize * (currentPage + 1) // Get more results for pagination
                });
                
                // Manual pagination for nearby stores
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedStores = (data.near_stores || []).slice(startIndex, endIndex);
                
                setStores(paginatedStores);
                setTotalElements(data.total_found || 0);
                setTotalPages(Math.ceil((data.total_found || 0) / pageSize));
            } else {
                // Load all stores with filters from metadata_db
                // Clean chain parameter - handle special characters properly
                let chainParam = selectedChain;
                if (chainParam) {
                    // Handle common chain name variations
                    chainParam = chainParam.replace(/\s*\(\d+\)$/, ''); // Remove count like "winmart+ (98)"
                    chainParam = chainParam.trim(); // Remove extra spaces
                }
                
                const data = await storeService.getAllStores({
                    pageNo: currentPage,
                    pageSize,
                    pattern: searchQuery,
                    chain: chainParam,
                    store_location: selectedLocation
                });
                
                setStores(data.stores || []);
                setTotalPages(data.pagination?.total_pages || 0);
                setTotalElements(data.pagination?.total_elements || 0);
            }
            
        } catch (error) {
            console.error('Error loading stores:', error);
            setError(error.response?.data?.message || error.message || 'Lỗi khi tải danh sách cửa hàng');
            setStores([]);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleFavouriteToggle = async (store) => {
        if (!user) {
            setError('Vui lòng đăng nhập để sử dụng tính năng này');
            return;
        }

        const storeId = store.store_id || store._id;
        const isFavourite = favouriteStores.has(storeId);
        
        // Set loading state for this specific store
        setFavouriteLoading(prev => ({ ...prev, [storeId]: true }));
        
        try {
            if (isFavourite) {
                // Remove from favourites
                await userService.removeFavouriteStore(storeId);
                setFavouriteStores(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(storeId);
                    return newSet;
                });
            } else {
                // Add to favourites
                const storeData = {
                    store_id: storeId,
                    store_name: store.store_name,
                    chain: store.chain,
                    store_location: store.store_location,
                    phone: store.phone || '',
                    latitude: store.latitude,
                    longitude: store.longitude,
                    totalScore: store.totalScore || 0,
                    reviewsCount: store.reviewsCount || 0
                };
                
                await userService.addFavouriteStore(storeData);
                setFavouriteStores(prev => new Set([...prev, storeId]));
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setError(error.response?.data?.message || error.message || 'Lỗi khi cập nhật cửa hàng yêu thích');
        } finally {
            setFavouriteLoading(prev => ({ ...prev, [storeId]: false }));
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        loadStores();
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedChain('');
        setSelectedLocation('');
        setShowNearby(false);
        setRadiusKm(10);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStoreClick = (storeId) => {
        setSelectedStoreId(storeId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStoreId(null);
    };

    const formatRating = (rating) => {
        return rating ? parseFloat(rating).toFixed(1) : '0.0';
    };

    const formatDistance = (distance) => {
        return distance ? `${distance} km` : '';
    };

    const hasUserLocation = user?.location?.latitude && user?.location?.longitude;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header/>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách cửa hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách cửa hàng</h1>
                    <p className="text-gray-600">Tìm kiếm và khám phá các cửa hàng gần bạn</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm cửa hàng, địa chỉ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        disabled={showNearby}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                                        disabled={showNearby}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Chain Filter */}
                        <select
                            value={selectedChain}
                            onChange={(e) => setSelectedChain(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={showNearby}
                        >
                            <option value="">Tất cả chuỗi cửa hàng</option>
                            {chains.map((chain) => (
                                <option key={chain.chain} value={chain.chain}>
                                    {chain.chain} ({chain.store_count})
                                </option>
                            ))}
                        </select>

                        {/* Location Filter */}
                        <input
                            type="text"
                            placeholder="Lọc theo địa điểm..."
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={showNearby}
                        />
                    </div>

                    {/* Nearby Toggle and Radius */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            {/* Nearby Toggle */}
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showNearby}
                                    onChange={(e) => setShowNearby(e.target.checked)}
                                    className="sr-only"
                                    disabled={!hasUserLocation}
                                />
                                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                                    showNearby ? 'bg-orange-500' : hasUserLocation ? 'bg-gray-300' : 'bg-gray-200'
                                }`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                        showNearby ? 'translate-x-5' : 'translate-x-0'
                                    }`}></div>
                                </div>
                                <span className={`ml-3 text-sm font-medium ${
                                    hasUserLocation ? 'text-gray-700' : 'text-gray-400'
                                }`}>
                                    Cửa hàng gần tôi
                                </span>
                            </label>

                            {!hasUserLocation && (
                                <span className="text-xs text-red-500">
                                    (Vui lòng cập nhật vị trí để sử dụng tính năng này)
                                </span>
                            )}

                            {/* Radius Selector */}
                            {showNearby && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Top 10 cửa hàng trong bán kính 10km</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between flex-1 min-w-0">
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                            <span className="text-sm text-gray-500">
                                Tìm thấy {totalElements} cửa hàng
                                {showNearby && ` trong bán kính ${radiusKm} km`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                        <button 
                            onClick={() => setError('')}
                            className="text-red-800 hover:text-red-900 text-sm underline mt-1"
                        >
                            Đóng
                        </button>
                    </div>
                )}

                {/* Loading */}
                {searchLoading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tìm kiếm...</p>
                    </div>
                )}

                {/* Store Grid */}
                {!searchLoading && (
                    <>
                        {stores.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {stores.map((store) => {
                                        const storeId = store.store_id || store._id;
                                        const isFavourite = favouriteStores.has(storeId);
                                        const isLoading = favouriteLoading[storeId];
                                        
                                        return (
                                            <div
                                                key={storeId}
                                                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow relative"
                                            >
                                                {/* Favourite Heart Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFavouriteToggle(store);
                                                    }}
                                                    disabled={isLoading || !user}
                                                    className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${
                                                        isFavourite 
                                                            ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
                                                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    title={user ? (isFavourite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích') : 'Đăng nhập để sử dụng'}
                                                >
                                                    {isLoading ? (
                                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <svg 
                                                            className="w-5 h-5" 
                                                            fill={isFavourite ? "currentColor" : "none"} 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round" 
                                                                strokeWidth={isFavourite ? 0 : 2} 
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                                            />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Store Content - Clickable */}
                                                <div
                                                    className="p-6 cursor-pointer"
                                                    onClick={() => handleStoreClick(storeId)}
                                                >
                                                    {/* Store Header with Logo */}
                                                    <div className="flex justify-between items-start mb-4 pr-12">
                                                        <div className="flex items-start space-x-3 flex-1">
                                                            {/* Store Logo */}
                                                            <div 
                                                                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border"
                                                                style={{ backgroundColor: `${getStoreBrandColor(store.chain)}10` }}
                                                            >
                                                                <img 
                                                                    src={getStoreLogo(store.chain)}
                                                                    alt={`${store.chain} logo`}
                                                                    className="w-10 h-10 object-contain"
                                                                    onError={(e) => {
                                                                        // Fallback to text if image fails
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div 
                                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white hidden"
                                                                    style={{ backgroundColor: getStoreBrandColor(store.chain) }}
                                                                >
                                                                    {store.chain ? store.chain.substring(0, 2).toUpperCase() : 'ST'}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Store Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-md text-gray-900 mb-1 line-clamp-2">
                                                                    {store.store_name}
                                                                </h3>
                                                                <p 
                                                                    className="font-medium text-sm mb-1"
                                                                    style={{ color: getStoreBrandColor(store.chain) }}
                                                                >
                                                                    {store.chain}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Location */}
                                                    <div className="flex items-start text-gray-600 text-sm mb-3">
                                                        <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="line-clamp-2">{store.store_location}</span>
                                                    </div>

                                                    {/* Rating and Phone */}
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                            <span className="text-gray-700">
                                                                {formatRating(store.totalScore)}
                                                                {(store.reviewsCount) > 0 && (
                                                                    <span className="text-gray-500 ml-1">
                                                                        ({store.reviewsCount})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {store.phone && (
                                                            <span className="text-gray-500">{store.phone}</span>
                                                        )}
                                                    </div>

                                                    {/* Route Info for Nearby Stores */}
                                                    {showNearby && store.route_summary && (
                                                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                                                            🚗 {store.route_summary.estimated_time} ({store.route_summary.distance_km} km)
                                                        </div>
                                                    )}

                                                    {/* Favourite Badge */}
                                                    {isFavourite && (
                                                        <div className="mt-2 inline-flex items-center text-xs text-red-600 bg-red-50 rounded-full px-2 py-1">
                                                            <FiHeart className="w-3 h-3 mr-1"/>
                                                            Yêu thích
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && !showNearby && (
                                    <div className="flex justify-center items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNumber = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                        currentPage === pageNumber
                                                            ? 'bg-orange-500 text-white'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber + 1}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Tiếp
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {showNearby ? 'Không tìm thấy cửa hàng gần bạn' : 'Không tìm thấy cửa hàng'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {showNearby 
                                        ? `Thử cập nhật vị trí của bạn`
                                        : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                    }
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Store Detail Modal */}
            {showModal && selectedStoreId && (
                <StoreDetailModal
                    storeId={selectedStoreId}
                    isOpen={showModal}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default StoreList;