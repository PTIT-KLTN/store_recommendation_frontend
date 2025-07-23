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
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(mapInstanceRef.current);

                // Create custom icon with store brand color
                const customIcon = L.default.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="
                            background-color: ${getStoreBrandColor(store.chain)};
                            width: 30px;
                            height: 30px;
                            border-radius: 50% 50% 50% 0;
                            border: 3px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            transform: rotate(-45deg);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <div style="
                                color: white;
                                font-weight: bold;
                                font-size: 12px;
                                transform: rotate(45deg);
                            ">📍</div>
                        </div>
                    `,
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                    popupAnchor: [0, -30]
                });

                // Add marker
                const marker = L.default.marker([store.latitude, store.longitude], {
                    icon: customIcon
                }).addTo(mapInstanceRef.current);

                // Add popup
                marker.bindPopup(`
                    <div style="text-align: center; min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: ${getStoreBrandColor(store.chain)};">
                            ${store.store_name}
                        </h3>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                            ${store.chain}
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #999;">
                            ${store.store_location}
                        </p>
                    </div>
                `).openPopup();

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

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
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
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết cửa hàng</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
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
                            {/* Store Header with Logo */}
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b">
                                <div className="flex items-start space-x-4">
                                    {/* Store Logo */}
                                    <div
                                        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border-2 shadow-md"
                                        style={{
                                            backgroundColor: `${getStoreBrandColor(store.chain)}10`,
                                            borderColor: `${getStoreBrandColor(store.chain)}30`
                                        }}
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
                                            className="w-5 h-5 rounded-lg flex items-center justify-center text-lg font-bold text-white hidden"
                                            style={{ backgroundColor: getStoreBrandColor(store.chain) }}
                                        >
                                            {store.chain}
                                        </div>
                                    </div>

                                    {/* Store Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Store Name and Rating Row */}
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                                {store.store_name}
                                            </h3>

                                            {/* Rating */}
                                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
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

                                        {/* Chain Name */}
                                        <p
                                            className="text-md font-semibold"
                                            style={{ color: getStoreBrandColor(store.chain) }}
                                        >
                                            {store.chain}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Main Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                {/* Left Column - Store Details */}
                                <div className="p-6 space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cửa hàng</h4>

                                    {/* Address */}
                                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FiMapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Địa chỉ</p>
                                            <p className="text-gray-600 mt-1">{store.store_location}</p>

                                        </div>
                                    </div>

                                    {/* Phone */}
                                    {store.phone && (
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FiPhoneCall className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Số điện thoại</p>
                                                <p className="text-gray-600">{store.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Store ID */}
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <FiTag className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Mã cửa hàng</p>
                                            <p className="text-gray-600 font-mono">{store.store_id}</p>
                                        </div>
                                    </div>


                                </div>

                                {/* Right Column - Map */}
                                <div className="lg:border-l border-gray-200">
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Vị trí trên bản đồ</h4>

                                        {store.latitude && store.longitude ? (
                                            <div className="space-y-4">
                                                {/* Map Container */}
                                                <div
                                                    ref={mapRef}
                                                    className="w-full h-80 rounded-lg border-2 border-gray-200 shadow-sm"
                                                    style={{ minHeight: '320px' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
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

                            {/* Action Buttons */}
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {store.phone && (
                                        <button
                                            onClick={handleCallStore}
                                            className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                                        >
                                            <FiPhone className="w-5 h-5 mr-2" />
                                            Gọi điện
                                        </button>
                                    )}

                                    {store.latitude && store.longitude && (
                                        <button
                                            onClick={handleGetDirection}
                                            className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
                                        >
                                            <FiMap className="w-5 h-5 mr-2" />
                                            Chỉ đường Google Maps
                                        </button>
                                    )}

                                    <button
                                        onClick={handleClose}
                                        className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm"
                                    >
                                        Đóng
                                    </button>
                                </div>
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
            </div>
        </div>
    );
};

export default StoreDetailModal;
