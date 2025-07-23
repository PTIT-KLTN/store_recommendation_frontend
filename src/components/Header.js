import React, { useState, useEffect } from 'react';
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/images/cart.png';
import LocationSelector from './LocationSelector';
import { useBasket } from '../context/BasketContext';
import { toast } from 'react-toastify';

const Header = ({ basketCount }) => {
    const [userLocation, setUserLocation] = useState(null);
    const { updateBasket, basketItems, syncStatus, getTotalItemCount } = useBasket();

    useEffect(() => {
        const loadSavedLocation = () => {
            try {
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    if (parsedLocation && parsedLocation.address) {
                        setUserLocation(parsedLocation);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading saved location:', error);
            }

            setUserLocation({
                address: 'Regent Street, A4, A4201, London',
                latitude: 51.5093,
                longitude: -0.1367
            });
        };

        loadSavedLocation();

        const handleLocationUpdate = (event) => {
            if (event.detail) {
                setUserLocation(event.detail);
            }
        };

        window.addEventListener('locationUpdated', handleLocationUpdate);
        return () => {
            window.removeEventListener('locationUpdated', handleLocationUpdate);
        };
    }, []);

    const handleLocationChange = (location) => {
        if (!location) return;
        setUserLocation(location);
    };

    const handleForceSync = async () => {
        try {
            const result = await updateBasket();
            if (result) {
                toast.success("Đã cập nhật giỏ hàng thành công!");
            } else {
                toast.error("Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error updating basket:", error);
            toast.error("Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    const renderSyncIcon = () => {
        if (syncStatus === 'pending') {
            return (
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-gray-600 rounded-full"></div>
            );
        } else if (syncStatus === 'error') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        } else {
            return (
                <MdOutlineFileDownload className="h-5 w-5 text-gray-600" />
            );
        }
    };

    const getItemCount = () => {
        if (basketCount !== undefined) {
            return basketCount;
        }
        return getTotalItemCount();
    };

    if (!userLocation) {
        return <div className="flex justify-center items-center px-12 py-3 bg-white border-b border-gray-100">Loading...</div>;
    }

    return (
        <header className="flex justify-between items-center px-12 py-3 bg-white border-b border-gray-100">
            {/* Location Selector Component */}
            <LocationSelector
                onLocationChange={handleLocationChange}
                initialLocation={userLocation}
            />

            {/* Basket Count */}
            <div className="flex items-center space-x-4">
                <Link to="/basket" className="flex items-center bg-green-600 text-sm text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    <img src={cartIcon} alt="Cart" className="h-5 w-5 mr-2" />
                    <span className="font-bold mr-1">{getItemCount()}</span>
                    <span>sản phẩm</span>
                </Link>

                <button
                    onClick={handleForceSync}
                    className={`border border-gray-200 p-2 rounded hover:bg-gray-50 transition-colors ${syncStatus === 'pending' ? 'cursor-wait' : ''}`}
                    title={syncStatus === 'synced' ? 'Giỏ hàng đã đồng bộ' : syncStatus === 'pending' ? 'Đang đồng bộ...' : 'Đồng bộ giỏ hàng'}
                    disabled={syncStatus === 'pending'}
                >
                    {renderSyncIcon()}
                </button>
            </div>
        </header>
    );
};

export default Header;