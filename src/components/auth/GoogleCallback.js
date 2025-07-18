import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiAlertTriangle } from "react-icons/fi";

const GoogleCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy authorization code từ URL
                const urlParams = new URLSearchParams(location.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');
                
                if (error) {
                    throw new Error(`Google authentication error: ${error}`);
                }
                
                if (!code) {
                    throw new Error('Authorization code not found');
                }
                
                // Gửi code về backend
                const API_URL = process.env.REACT_APP_API_URL;
                const response = await axios.post(`${API_URL}/auth/google/callback-frontend`, {
                    code: code
                });
                
                // Lưu tokens
                if (response.data.access_token) {
                    localStorage.setItem('accessToken', response.data.access_token);
                    localStorage.setItem('refreshToken', response.data.refresh_token);
                    
                    // Lưu user info
                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                    
                    // Redirect về homepage
                    navigate('/homepage');
                } else {
                    throw new Error('No access token received');
                }
                
            } catch (error) {
                console.error('Google callback error:', error);
                setError(error.message);
                setIsProcessing(false);
                
                navigate('/login');
            }
        };
        
        handleCallback();
    }, [location, navigate]);
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-red-600 mb-4">
                        <FiAlertTriangle  className="mx-auto h-12 w-12" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập thất bại</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý đăng nhập</h2>
                <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;