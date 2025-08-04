import React, { useState, useEffect, useRef } from 'react';
import { storeService } from '../services/storeService';
import { getStoreLogo, getStoreBrandColor } from '../utils/storeLogo';
import { FiX, FiAlertTriangle, FiStar, FiMapPin, FiPhoneCall, FiTag, FiMap, FiPhone } from "react-icons/fi";

const StoreDetailModal = ({ storeId, isOpen, onClose }) => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (isOpen && storeId) {
            loadStoreDetail();
        }

        // Cleanup map when modal closes
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen, storeId]);

    useEffect(() => {
        // Initialize map when store data is available and modal is open
        if (store && store.latitude && store.longitude && isOpen && mapRef.current && !mapInstanceRef.current) {
            initializeMap();
        }
    }, [store, isOpen]);

    const initializeMap = async () => {
        try {
            // Dynamically import Leaflet
            const L = await import('leaflet');

            // Import Leaflet CSS
            if (!document.querySelector('link[href*="leaflet"]')) {
                const leafletCSS = document.createElement('link');
                leafletCSS.rel = 'stylesheet';
                leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(leafletCSS);
            }

            // Fix for default markers
            delete L.default.Icon.Default.prototype._getIconUrl;
            L.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            if (mapRef.current && store.latitude && store.longitude) {
                // Initialize map
                mapInstanceRef.current = L.default.map(mapRef.current, {
                    center: [store.latitude, store.longitude],
                    zoom: 15,
                    zoomControl: true,
                    scrollWheelZoom: false
                });

                // Add tile layer
                L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18
                }).addTo(mapInstanceRef.current);

                // Add marker with default icon
                const marker = L.default.marker([store.latitude, store.longitude])
                    .addTo(mapInstanceRef.current);

                // Resize map after modal animation
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    const loadStoreDetail = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await storeService.getStoreById(storeId);
            setStore(data);
        } catch (error) {
            console.error('Error loading store detail:', error);
            setError(error.response?.data?.message || error.message || 'Lỗi khi tải thông tin cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatRating = (rating) => {
        return rating ? parseFloat(rating).toFixed(1) : '0.0';
    };

    const getAverageRating = (store) => {
        if (store.rating_info?.average_rating) {
            return store.rating_info.average_rating;
        }

        if (store.totalScore && store.reviewsCount) {
            return (store.totalScore / Math.max(store.reviewsCount, 1)).toFixed(1);
        }

        return store.totalScore || 0;
    };

    const handleCallStore = () => {
        if (store?.phone) {
            window.open(`tel:${store.phone}`, '_self');
        }
    };

    const handleGetDirection = () => {
        if (store?.latitude && store?.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
            window.open(url, '_blank');
        }
    };

    const handleClose = () => {
        // Clean up map before closing
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                    <FiX size={24} />
                </button>

                <div className="flex flex-col lg:flex-row">
                    {/* Left content - Store Details */}
                    <div className="p-6 flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Đang tải thông tin cửa hàng...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <FiAlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : store ? (
                            <>
                                {/* Store Header */}
                                <div className="mb-8">
                                    <div className="flex items-start space-x-4 mb-6">
                                        {/* Store Logo */}
                                        <div
                                            className="flex-shrink-0 w-16 h-16 flex items-center justify-center overflow-hidden border-2 shadow-md"
                                            style={{
                                                backgroundColor: `${getStoreBrandColor(store.chain)}10`,
                                                borderColor: `${getStoreBrandColor(store.chain)}30`
                                            }}
                                        >
                                            <img
                                                src={getStoreLogo(store.chain)}
                                                alt={`${store.chain} logo`}
                                                className="w-12 h-12 object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white hidden"
                                                style={{ backgroundColor: getStoreBrandColor(store.chain) }}
                                            >
                                                {store.chain ? store.chain.substring(0, 2).toUpperCase() : 'ST'}
                                            </div>
                                        </div>

                                        {/* Store Info */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                                                {store.store_name}
                                            </h2>
                                            <p
                                                className="text-md mb-3"
                                                style={{ color: getStoreBrandColor(store.chain) }}
                                            >
                                                {store.chain}
                                            </p>
                                            
                                            {/* Rating */}
                                            <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full inline-flex">
                                                <FiStar className="w-5 h-5 text-yellow-400 mr-2" />
                                                <span className="text-md font-semibold text-gray-900">
                                                    {formatRating(store.totalScore)}
                                                </span>
                                                {(store.reviewsCount) > 0 && (
                                                    <span className="text-gray-500 ml-2 text-sm">
                                                        ({store.reviewsCount} đánh giá)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Store Information - Compact */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900">Thông tin cửa hàng</h3>
                                    
                                    {/* Address */}
                                    <div className="flex items-center mb-3">
                                        <FiMapPin className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 mr-2">Địa chỉ:</span>
                                            <span className="text-sm text-gray-600">{store.store_location}</span>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    {store.phone && (
                                        <div className="flex items-center mb-3">
                                            <FiPhoneCall className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-900 mr-2">SĐT:</span>
                                                <span className="text-sm text-gray-600">{store.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Store ID */}
                                    <div className="flex items-center">
                                        <FiTag className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 mr-2">Mã cửa hàng:</span>
                                            <span className="text-sm text-gray-600 font-mono">{store.store_id}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Side by side */}
                                <div className="flex gap-2">
                                    {store.phone && (
                                        <button
                                            onClick={handleCallStore}
                                            className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
                                        >
                                            <FiPhone className="w-4 h-4 mr-1" />
                                            Gọi điện
                                        </button>
                                    )}

                                    {store.latitude && store.longitude && (
                                        <button
                                            onClick={handleGetDirection}
                                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
                                        >
                                            <FiMap className="w-4 h-4 mr-1" />
                                            Chỉ đường
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-gray-500">Không tìm thấy thông tin cửa hàng</p>
                            </div>
                        )}
                    </div>

                    {/* Right side - Map */}
                    <div className="flex-shrink-0 w-full lg:w-80 flex items-start justify-center p-6">
                        <div className="w-full">
                            <h4 className="text-xl font-bold mb-4">Vị trí trên bản đồ</h4>
                            
                            {store && store.latitude && store.longitude ? (
                                <div
                                    ref={mapRef}
                                    className="w-full h-80 rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden"
                                    style={{ minHeight: '320px' }}
                                />
                            ) : (
                                <div className="w-full h-80 bg-gray-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">Không có thông tin tọa độ</p>
                                        <p className="text-gray-400 text-sm">Không thể hiển thị bản đồ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDetailModal;