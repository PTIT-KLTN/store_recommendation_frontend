import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

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
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, userData = null) => {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        
        if (userData) {
            setUser(userData);
        } else {
            await loadUser();
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        userService.clearUserFromLocalStorage();
        setIsLoggedIn(false);
        setUser(null);
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