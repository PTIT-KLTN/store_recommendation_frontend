import React, { Component } from 'react';
import { FiMapPin, FiNavigation, FiX, FiSearch } from "react-icons/fi";
import { userService } from '../services/userService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { toast } from 'react-toastify';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

class OpenStreetMap extends Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();
        this.mapInstance = null;
        this.marker = null;
    }

    componentDidMount() {
        this.initMap();
    }

    componentWillUnmount() {
        if (this.mapInstance) {
            this.mapInstance.remove();
        }
    }

    initMap = () => {
        if (!this.mapRef.current) return;

        const { latitude, longitude } = this.props.initialLocation;
        const position = [latitude, longitude];

        const map = L.map(this.mapRef.current).setView(position, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.mapInstance = map;

        const marker = L.marker(position, {
            draggable: true
        }).addTo(map);

        this.marker = marker;

        map.on('click', (event) => {
            const { lat, lng } = event.latlng;
            marker.setLatLng([lat, lng]);
            this.getAddressFromLatLng(lat, lng);
        });

        marker.on('dragend', () => {
            const position = marker.getLatLng();
            this.getAddressFromLatLng(position.lat, position.lng);
        });
    }

    getAddressFromLatLng = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();

            if (data && data.display_name) {
                const address = data.display_name;
                this.props.onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address
                });
            } else {
                this.props.onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: `Vị trí (${lat.toFixed(6)}, ${lng.toFixed(6)})`
                });
            }
        } catch (error) {
            console.error('Error getting address:', error);
            this.props.onLocationSelect({
                latitude: lat,
                longitude: lng,
                address: `Vị trí (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            });
        }
    }

    centerMap = (lat, lng) => {
        if (!this.mapInstance || !this.marker) return;

        this.mapInstance.setView([lat, lng], 14);
        this.marker.setLatLng([lat, lng]);
    }

    getMapInstance = () => {
        return this.mapInstance;
    }

    render() {
        return (
            <div ref={this.mapRef} style={{ width: '100%', height: '250px', borderRadius: '8px' }}></div>
        );
    }
}

class LocationSelector extends Component {
    constructor(props) {
        super(props);
        const defaultLocation = {
            address: 'Hoàn Kiếm, Hà Nội, Việt Nam',
            latitude: 21.0285,
            longitude: 105.8542
        };

        this.state = {
            showLocationModal: false,
            currentLocation: props.initialLocation || defaultLocation,
            isGettingLocation: false,
            isSavingLocation: false,
            error: '',
            searchQuery: '',
            searchResults: [],
            isSearching: false
        };

        this.mapRef = React.createRef();
    }

    componentDidMount() {
        try {
            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                const parsedLocation = JSON.parse(savedLocation);
                if (parsedLocation && parsedLocation.address) {
                    if (!this.props.initialLocation ||
                        parsedLocation.latitude !== this.props.initialLocation.latitude ||
                        parsedLocation.longitude !== this.props.initialLocation.longitude) {
                        this.setState({ currentLocation: parsedLocation });
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        }
    }

    getCurrentLocation = () => {
        if (!navigator.geolocation) {
            this.setState({ error: 'Trình duyệt của bạn không hỗ trợ định vị.' });
            return;
        }

        this.setState({ isGettingLocation: true, error: '' });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Vị trí hiện tại:", latitude, longitude);

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();

                    let location;
                    if (data && data.display_name) {
                        location = {
                            latitude,
                            longitude,
                            address: data.display_name
                        };
                    } else {
                        location = {
                            latitude,
                            longitude,
                            address: `Vị trí của bạn (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
                        };
                    }

                    this.setState({
                        currentLocation: location,
                        isGettingLocation: false
                    });

                    // Update map view
                    if (this.mapRef.current) {
                        this.mapRef.current.centerMap(latitude, longitude);
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    const location = {
                        latitude,
                        longitude,
                        address: `Vị trí của bạn (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
                    };

                    this.setState({
                        currentLocation: location,
                        isGettingLocation: false
                    });

                    // Update map view
                    if (this.mapRef.current) {
                        this.mapRef.current.centerMap(latitude, longitude);
                    }
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Không thể lấy vị trí của bạn.';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += ' Vui lòng cho phép truy cập vị trí trong trình duyệt của bạn.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += ' Thông tin vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += ' Yêu cầu vị trí đã hết thời gian.';
                        break;
                }

                this.setState({ error: errorMessage, isGettingLocation: false });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    handleSearchQueryChange = (e) => {
        this.setState({ searchQuery: e.target.value });
    }

    searchPlaces = async () => {
        const { searchQuery } = this.state;

        if (!searchQuery.trim()) {
            return;
        }

        this.setState({ isSearching: true, error: '', searchResults: [] });

        try {
            const encodedQuery = encodeURIComponent(searchQuery);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5`);

            if (!response.ok) {
                throw new Error('Lỗi khi tìm kiếm địa điểm');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const results = data.map(item => ({
                    name: item.display_name.split(',')[0],
                    address: item.display_name,
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon)
                }));

                this.setState({ searchResults: results, isSearching: false });
            } else {
                this.setState({
                    error: 'Không tìm thấy địa điểm. Vui lòng thử lại với từ khóa khác.',
                    isSearching: false
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            this.setState({
                error: 'Lỗi khi tìm kiếm địa điểm: ' + error.message,
                isSearching: false
            });
        }
    }

    handleSelectSearchResult = (result) => {
        this.setState({
            currentLocation: {
                address: result.address || result.name,
                latitude: result.latitude,
                longitude: result.longitude
            },
            searchResults: [],
            searchQuery: ''
        });

        if (this.mapRef.current) {
            this.mapRef.current.centerMap(result.latitude, result.longitude);
        }
    }

    handleMapLocationSelect = (location) => {
        this.setState({ currentLocation: location });
    }

    // Helper to check if user is logged in
    isUserLoggedIn = () => {
        const token = localStorage.getItem('accessToken');
        return !!token;
    }

    sendLocationToBackend = async (locationData) => {
        try {
            console.log('Sending location to backend:', JSON.stringify(locationData, null, 2));

            const token = localStorage.getItem('accessToken');
            if (!token) {
                // User is not logged in - show appropriate message
                toast.info("Vị trí đã được lưu cục bộ. Đăng nhập để đồng bộ vị trí với tài khoản của bạn.");
                return { success: true, message: 'Location saved locally only', isLocalOnly: true };
            }

            const result = await userService.updateUserLocation(locationData);
            console.log('API response: ', result);
            
            if (result && result.status === 202) {
                toast.success("Địa chỉ đã được cập nhật và đồng bộ với tài khoản thành công!");
                return { success: true, message: 'Location updated successfully', isLocalOnly: false };
            } else {
                toast.warning("Vị trí đã được lưu cục bộ, nhưng không thể đồng bộ với máy chủ. Vui lòng thử lại sau!");
                return { success: true, message: 'Location saved locally but sync failed', isLocalOnly: true };
            }

        } catch (error) {
            console.error('Error sending location to backend:', error);
            
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                toast.warning("Phiên đăng nhập đã hết hạn. Vị trí đã được lưu cục bộ.");
            } else {
                toast.warning("Không thể đồng bộ vị trí với máy chủ. Vị trí đã được lưu cục bộ.");
            }
            
            return { success: true, error: error.message, isLocalOnly: true };
        }
    }

    confirmSelection = async () => {
        try {
            this.setState({ isSavingLocation: true, error: '' });

            const { currentLocation } = this.state;
            console.log("Location being saved:", JSON.stringify(currentLocation, null, 2));

            // Always save to localStorage first
            localStorage.setItem('userLocation', JSON.stringify(currentLocation));

            // Try to sync with backend
            const result = await this.sendLocationToBackend(currentLocation);

            // Update parent component
            if (this.props.onLocationChange) {
                this.props.onLocationChange(currentLocation);
            }

            // Dispatch event for other components
            const event = new CustomEvent('locationUpdated', { detail: currentLocation });
            window.dispatchEvent(event);

            // Close modal
            this.setState({ 
                showLocationModal: false, 
                isSavingLocation: false,
                error: '' 
            });

        } catch (error) {
            console.error('Error saving location:', error);
            
            // Still save locally and close modal, but show error
            localStorage.setItem('userLocation', JSON.stringify(this.state.currentLocation));
            
            if (this.props.onLocationChange) {
                this.props.onLocationChange(this.state.currentLocation);
            }
            
            const event = new CustomEvent('locationUpdated', { detail: this.state.currentLocation });
            window.dispatchEvent(event);
            
            toast.warning('Vị trí đã được lưu cục bộ, nhưng có lỗi xảy ra khi xử lý.');
            
            this.setState({
                showLocationModal: false,
                isSavingLocation: false,
                error: ''
            });
        }
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.searchPlaces();
        }
    }

    render() {
        const {
            showLocationModal,
            currentLocation,
            isGettingLocation,
            isSavingLocation,
            error,
            searchQuery,
            searchResults,
            isSearching
        } = this.state;

        const isLoggedIn = this.isUserLoggedIn();

        return (
            <>
                {/* Location Button in Header */}
                <div className="flex items-center">
                    <FiMapPin className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-gray-700 mr-3 truncate max-w-xs">
                        {currentLocation.address}
                    </span>
                    <button
                        className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
                        onClick={() => this.setState({ showLocationModal: true })}
                    >
                        Đổi vị trí
                    </button>
                </div>

                {/* Location Modal with OpenStreetMap */}
                {showLocationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Chọn vị trí của bạn</h2>
                                <button
                                    onClick={() => this.setState({ showLocationModal: false })}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Login status indicator */}
                            {!isLoggedIn && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-800">
                                                <span className="font-medium">Chưa đăng nhập:</span> Vị trí sẽ chỉ được lưu cục bộ trên thiết bị này. 
                                                <a href="/login" className="underline hover:no-underline ml-1">Đăng nhập</a> để đồng bộ với tài khoản.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Search Address - Moved up */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Tìm kiếm địa điểm:
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={this.handleSearchQueryChange}
                                        onKeyPress={this.handleKeyPress}
                                        placeholder="Nhập tên địa điểm hoặc địa chỉ..."
                                        className="flex-1 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <button
                                        onClick={this.searchPlaces}
                                        disabled={isSearching}
                                        className="bg-orange-500 text-white px-4 rounded-r flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {isSearching ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <FiSearch />
                                        )}
                                    </button>
                                    
                                    {/* Current Location Button - Made smaller and moved to right */}
                                    <button
                                        className="ml-2 flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={this.getCurrentLocation}
                                        disabled={isGettingLocation}
                                        title="Lấy vị trí hiện tại"
                                    >
                                        {isGettingLocation ? (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <FiNavigation className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mb-4 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                                    <ul>
                                        {searchResults.map((result, index) => (
                                            <li
                                                key={index}
                                                className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => this.handleSelectSearchResult(result)}
                                            >
                                                <div className="font-medium text-gray-900">{result.name}</div>
                                                <div className="text-sm text-gray-600">{result.address}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Selected Location - Moved up */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-medium text-gray-800 mb-2">Vị trí đã chọn:</h3>
                                <div className="flex items-start">
                                    <FiMapPin className="mt-1 mr-2 text-orange-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-700 font-medium">{currentLocation.address}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tọa độ: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Button - Moved up and made more prominent */}
                            <button
                                onClick={this.confirmSelection}
                                disabled={isSavingLocation}
                                className={`w-full bg-green-600 text-white text-md p-4 rounded-lg mb-4 hover:bg-green-700 transition-colors shadow-lg ${isSavingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSavingLocation ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu vị trí...
                                    </span>
                                ) : (
                                    <>
                                        ✓ {isLoggedIn ? 'Xác nhận và đồng bộ vị trí' : 'Xác nhận vị trí (lưu cục bộ)'}
                                    </>
                                )}
                            </button>

                            {/* Additional info for non-logged in users */}
                            {!isLoggedIn && (
                                <p className="text-xs text-gray-500 text-center mb-4">
                                    Vị trí sẽ được lưu trên thiết bị này. Đăng nhập để đồng bộ với tài khoản.
                                </p>
                            )}

                            {/* OpenStreetMap - Moved to bottom */}
                            <div className="mb-2">
                                <OpenStreetMap
                                    ref={this.mapRef}
                                    initialLocation={currentLocation}
                                    onLocationSelect={this.handleMapLocationSelect}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Nhấp vào bản đồ hoặc kéo ghim để chọn vị trí
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default LocationSelector;