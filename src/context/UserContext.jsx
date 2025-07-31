import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';

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
    const navigate = useNavigate();

    // Centralized auth event handler
    useEffect(() => {
        const handleAuthEvent = (event) => {
            const { type, data } = event.detail;
            
            switch (type) {
                case 'LOGOUT':
                    handleLogout(data?.reason);
                    break;
                case 'TOKEN_EXPIRED':
                    handleTokenExpired();
                    break;
                case 'LOGIN_SUCCESS':
                    handleLoginSuccess(data);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('authEvent', handleAuthEvent);
        return () => window.removeEventListener('authEvent', handleAuthEvent);
    }, []);

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
            // Don't clear tokens here - let axiosPrivate handle it
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, refreshToken = null, userData = null) => {
        try {
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
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleLogout = async (reason = 'user_action') => {
        try {
            // Clear all auth data immediately
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            userService.clearUserFromLocalStorage();
            
            setIsLoggedIn(false);
            setUser(null);

            // Show appropriate message
            if (reason === 'token_expired') {
                toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (reason === 'unauthorized') {
                toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            // Navigate to login page
            navigate('/login', { replace: true });
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if error occurs
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            userService.clearUserFromLocalStorage();
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login', { replace: true });
        }
    };

    const handleTokenExpired = () => {
        handleLogout('token_expired');
    };

    const handleLoginSuccess = (data) => {
        if (data?.user) {
            setUser(data.user);
            setIsLoggedIn(true);
        }
    };

    const logout = () => {
        // Trigger centralized logout
        window.dispatchEvent(new CustomEvent('authEvent', {
            detail: { type: 'LOGOUT', data: { reason: 'user_action' } }
        }));
    };

    useEffect(() => {
        loadUser();
    }, []);

    const value = {
        user,
        loading,
        isLoggedIn,
        login,
        logout,
        refreshUser: loadUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};