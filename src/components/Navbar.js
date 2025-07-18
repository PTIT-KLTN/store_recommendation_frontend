import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        navigate('/homepage');
    };

    return (
        <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <img src={logoImage} alt="Markendation Logo" className="w-32 mr-2" />
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
                <NavLink
                    to="/homepage"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Trang chủ
                </NavLink>
                <NavLink
                    to="/ingredients-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Ngân hàng nguyên liệu
                </NavLink>
                <NavLink
                    to="/dishes-bank"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Ngân hàng món ăn
                </NavLink>
                <NavLink
                    to="/saved-baskets"
                    className={({ isActive }) =>
                        isActive
                            ? "px-4 py-2 bg-orange-500 text-white rounded-full text-lg font-medium"
                            : "px-4 py-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
                    }
                >
                    Giỏ hàng đã lưu
                </NavLink>
            </div>

            {/* Auth Button */}
            <div>
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
                    >
                        Đăng xuất
                    </button>
                ) : (
                    <Link to="/login" className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium inline-block hover:bg-gray-800 transition-colors">
                        Đăng nhập/Đăng ký
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;