import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { FiAlertTriangle } from "react-icons/fi";

const GoogleCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useUser();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(null);
    
    // Prevent multiple calls
    const hasProcessed = useRef(false);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current || isProcessingRef.current) {
            console.log('GoogleCallback: Already processed or processing, skipping...');
            return;
        }

        const handleCallback = async () => {
            // Mark as processing immediately
            isProcessingRef.current = true;
            
            try {
                console.log('GoogleCallback: Starting OAuth process...');
                
                // Enhanced error handling for URL parameters
                const urlParams = new URLSearchParams(location.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');
                const errorDescription = urlParams.get('error_description');
                
                console.log('Debug - URL params:', {
                    code: code ? `${code.substring(0, 20)}...` : 'null',
                    error,
                    errorDescription
                });
                
                if (error) {
                    const errorMsg = errorDescription ? `${error}: ${errorDescription}` : error;
                    throw new Error(`Google authentication error: ${errorMsg}`);
                }
                
                if (!code) {
                    throw new Error('Authorization code not found in URL');
                }
                
                // Validate code format (Google auth codes are typically longer)
                if (code.length < 20) {
                    throw new Error('Invalid authorization code format');
                }
                
                // Mark as processed before making API call to prevent race conditions
                hasProcessed.current = true;
                
                const API_URL = process.env.REACT_APP_API_URL;
                console.log('Debug - Sending code to backend:', code.substring(0, 20) + '...');
                
                const response = await axios.post(`${API_URL}/auth/google/callback-frontend`, {
                    code: code
                }, {
                    timeout: 30000, // 30 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.access_token) {
                    await login(response.data.access_token, response.data.user);
                    toast.success(response.data.message || 'Đăng nhập Google thành công!');
                    navigate('/homepage');
                } else {
                    throw new Error('No access token received from server');
                }
                
            } catch (error) {
                console.error('Google callback error:', error);
                
                let errorMessage = 'Đăng nhập Google thất bại';
                
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Handle specific OAuth errors
                if (errorMessage.includes('invalid_grant')) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng thử đăng nhập lại.';
                }
                
                setError(errorMessage);
                setIsProcessing(false);
                toast.error(errorMessage);
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } finally {
                isProcessingRef.current = false;
            }
        };
        
        handleCallback();
    }, []); // IMPORTANT: Empty dependency array to run only once
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-red-600 mb-4">
                        <FiAlertTriangle className="mx-auto h-12 w-12" />
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