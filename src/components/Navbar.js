import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import logoImage from '../assets/images/logo.png';

const Navbar = () => {
    const { user, isLoggedIn, logout, loading } = useUser();
    const navigate = useNavigate();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setShowUserDropdown(false);
        logout(); // Now just calls the simple logout function
    };

    const handleNavigateToStores = () => {
        setShowUserDropdown(false);
        navigate('/stores');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <nav className="flex justify-between items-center px-8 py-3 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <NavLink to='/'>
                    <img src={logoImage} alt="Markendation Logo" className="w-24 mr-2" />
                </NavLink>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-2">
                <NavLink
                    to="/homepage"
                    className={({ isActive }) =>
                        isActive
                            ? "px-3 py-1.5 bg-orange-500 text-white rounded-full text-md font-medium"
                            : "px-3 py-1.5 text-gray-700 hover:text-gray-900 text-md font-medium"
                    }
                >
                    Trang chủ
                </NavLink>
                <NavLink
                    to="/ingredients-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-3 py-1.5 bg-orange-500 text-white rounded-full text-md font-medium"
                            : "px-3 py-1.5 text-gray-700 hover:text-gray-900 text-md font-medium"
                    }
                >
                    Ngân hàng nguyên liệu
                </NavLink>
                <NavLink
                    to="/dishes-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-3 py-1.5 bg-orange-500 text-white rounded-full text-md font-medium"
                            : "px-3 py-1.5 text-gray-700 hover:text-gray-900 text-md font-medium"
                    }
                >
                    Ngân hàng món ăn
                </NavLink>
                <NavLink
                    to="/saved-baskets"
                    className={({ isActive }) =>
                        isActive
                            ? "px-3 py-1.5 bg-orange-500 text-white rounded-full text-md font-medium"
                            : "px-3 py-1.5 text-gray-700 hover:text-gray-900 text-md font-medium"
                    }
                >
                    Giỏ hàng đã lưu
                </NavLink>
                <NavLink
                    to="/favourite-stores"
                    className={({ isActive }) =>
                        isActive
                            ? "px-3 py-1.5 bg-orange-500 text-white rounded-full text-md font-medium"
                            : "px-3 py-1.5 text-gray-700 hover:text-gray-900 text-md font-medium"
                    }
                >
                    Cửa hàng yêu thích
                </NavLink>
            </div>

            {/* Auth Section */}
            <div className="relative">
                {loading ? (    
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                ) : isLoggedIn && user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-medium text-sm hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                            title={user.fullname || 'Người dùng'}
                        >
                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                        </button>

                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-128 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                {/* User Info */}
                                <div className="px-3 py-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-sm truncate">
                                                {user.fullname || 'Người dùng'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {user.email}
                                            </div>
                                            {user.created_at && (
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    Tham gia: {formatDate(user.created_at)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="border-t border-gray-200">
                                    <button
                                        onClick={handleNavigateToStores}
                                        className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Danh sách cửa hàng
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-gray-200 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                    >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link 
                        to="/login" 
                        className="bg-gray-900 text-white px-4 py-1.5 rounded-full font-medium text-sm inline-block hover:bg-gray-800 transition-colors"
                    >
                        Đăng nhập/Đăng ký
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;