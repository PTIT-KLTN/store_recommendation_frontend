import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import axiosPrivate from '../services/axiosPrivate'; // Thêm import này

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const loadUser = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoggedIn(false);
                setUser(null);
                setLoading(false);
                return;
            }

            const userData = await userService.getUserInfo();
            setUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Error loading user:', error);
            // Token might be expired, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken'); // Thêm clear refresh token
            userService.clearUserFromLocalStorage();
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, refreshToken = null, userData = null) => {
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        setIsLoggedIn(true);
        
        if (userData) {
            setUser(userData);
            userService.saveUserToLocalStorage(userData);
        } else {
            await loadUser();
        }
    };

    // Cập nhật hàm logout để gọi API
    const logout = async () => {
        try {
            // Kiểm tra có access token không
            const accessToken = localStorage.getItem('accessToken');
            
            if (accessToken) {
                try {
                    // Gọi API logout để xóa refresh token khỏi database
                    await axiosPrivate.post('/auth/logout');
                } catch (error) {
                    // Nếu API call fail (token expired, network error, etc.)
                    // vẫn tiếp tục clear localStorage
                    console.warn('Logout API call failed:', error.message);
                }
            }
            
            // Clear tất cả auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            userService.clearUserFromLocalStorage();
            setIsLoggedIn(false);
            setUser(null);
            
        } catch (error) {
            console.error('Logout error:', error);
            
            // Dù có lỗi vẫn force clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            userService.clearUserFromLocalStorage();
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const value = {
        user,
        loading,
        isLoggedIn,
        login,
        logout, // Bây giờ đã là async function
        refreshUser: loadUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};