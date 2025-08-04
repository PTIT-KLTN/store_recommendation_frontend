import React, { useState, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { HiArrowNarrowRight} from "react-icons/hi";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { LuHandPlatter } from "react-icons/lu";

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useUser(); 
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    // Handle message from location state (e.g., from password reset)
    useEffect(() => {
        if (location.state?.message) {
            if (location.state.messageType === 'success') {
                toast.success(location.state.message);
            } else {
                toast.info(location.state.message);
            }
            // Clear the state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login({
                email: formData.email,
                password: formData.password
            });

            // Use UserContext login method
            await login(response.access_token, response.refresh_token, response.user);

            if (formData.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            toast.success('Đăng nhập thành công!');
            navigate('/homepage');
        } catch (error) {
            console.error('Login failed:', error);
            const message = error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = async () => {
        try {
            await authService.googleLogin();
        } catch (error) {
            console.error('Google login failed:', error);
            setError('Đăng nhập Google không thành công. Vui lòng thử lại.');
            toast.error('Đăng nhập Google không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl flex overflow-hidden max-w-4xl w-full">
                {/* Left side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
                            <p className="text-gray-600">
                                Chưa có tài khoản? 
                                <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                                    Tạo tài khoản
                                </a>
                            </p>
                        </div>

                        {/* Social Login */}
                        <div className="mb-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-3"
                            >
                                <FcGoogle className="h-5 w-5 mr-2" />
                                <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
                            </button>
                            
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">hoặc sử dụng tài khoản</span>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Nhập email của bạn"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Mật khẩu
                                    </label>
                                    <a 
                                        href="/forgot-password" 
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Nhập mật khẩu"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        ĐĂNG NHẬP
                                        <HiArrowNarrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right side - Welcome Section */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-400 via-red-400 to-red-500 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 right-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute bottom-20 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute top-1/3 left-5 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute bottom-1/3 right-8 w-8 h-8 bg-white bg-opacity-10 rounded-full"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-sm">
                        {/* Welcome Message */}
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold mb-4">Xin chào!</h2>
                            <p className="text-lg text-white/90 leading-relaxed">
                                Nhập thông tin cá nhân của bạn và bắt đầu hành trình cùng chúng tôi
                            </p>
                        </div>

                        {/* Logo or Icon */}
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LuHandPlatter className="w-12 h-12 text-white"/>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div>
                            <button
                                onClick={() => navigate('/register')}
                                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-red-500 transition-all duration-300 transform hover:scale-105"
                            >
                                TẠO TÀI KHOẢN
                            </button>
                        </div>

                        {/* Features */}
                        <div className="mt-12 space-y-3">
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Gợi ý cửa hàng thông minh</span>
                            </div>
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Tiết kiệm thời gian & chi phí</span>
                            </div>
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Quản lý giỏ hàng dễ dàng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;