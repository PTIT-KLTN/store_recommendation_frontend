import axiosPublic from './axiosPublic';
import { userService } from './userService';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axiosPublic.post('/auth/login', credentials);

            if (response.data.access_token) {
                localStorage.setItem('accessToken', response.data.access_token);

                if (response.data.refresh_token) {
                    localStorage.setItem('refreshToken', response.data.refresh_token);
                }
            }
            userService.getUserInfo()

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const registerData = {
                fullname: userData.fullname,
                email: userData.email,
                password: userData.password
            };

            const response = await axiosPublic.post('/auth/register', registerData);

            if (response.data.access_token) {
                localStorage.setItem('accessToken', response.data.access_token);

                if (response.data.refresh_token) {
                    localStorage.setItem('refreshToken', response.data.refresh_token);
                }
            }
            userService.getUserInfo()

            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await axiosPublic.post('/auth/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axiosPublic.post('/auth/refresh', {
                refresh_token: refreshToken
            });

            if (response.data.access_token) {
                localStorage.setItem('accessToken', response.data.access_token);

                if (response.data.refresh_token) {
                    localStorage.setItem('refreshToken', response.data.refresh_token);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Token refresh failed:', error);
            authService.logout();
            throw error;
        }
    },

    googleLogin: async () => {
        try {
            // Tạo Google auth URL trực tiếp từ frontend
            const scope = 'openid email profile';

            const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
                `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
                `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
                `scope=${encodeURIComponent(scope)}&` +
                `response_type=code&` +
                `access_type=offline&` +
                `prompt=consent`;
            
            window.location.href = authUrl;
        } catch (error) {
            console.error('Google login failed:', error);
            throw error;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },

    forgotPassword: async (email) => {
        try {
            const response = await axiosPublic.post('/auth/forgot-password', {
                email: email
            });
            return response.data;
        } catch (error) {
            console.error('Forgot password failed:', error);
            throw error;
        }
    },

    verifyResetToken: async (token) => {
        try {
            const response = await axiosPublic.post('/auth/verify-reset-token', {
                token: token
            });
            return response.data;
        } catch (error) {
            console.error('Token verification failed:', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await axiosPublic.post('/auth/reset-password', {
                token: token,
                new_password: newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Password reset failed:', error);
            throw error;
        }
    }
};