import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { HiArrowNarrowRight} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return false;
        }

        if (formData.password.length < 5) {
            setError('Mật khẩu phải có ít nhất 5 ký tự.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await authService.register({
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password
            });

            // Use UserContext login method
            await login(response.access_token, response.user);

            toast.success('Đăng ký thành công!');
            navigate('/homepage');
        } catch (error) {
            console.error('Registration failed:', error);
            const message = error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại sau.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleGoogleRegister = async () => {
        try {
            await authService.googleLogin();
        } catch (error) {
            console.error('Google register failed:', error);
            setError('Đăng ký Google không thành công. Vui lòng thử lại.');
            toast.error('Đăng ký Google không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl flex overflow-hidden max-w-4xl w-full">
                {/* Left side - Welcome Section */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute top-1/3 right-5 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
                        <div className="absolute bottom-1/3 left-8 w-8 h-8 bg-white bg-opacity-10 rounded-full"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-sm">
                        {/* Welcome Message */}
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold mb-4">Chào mừng bạn!</h2>
                            <p className="text-lg text-white/90 leading-relaxed">
                                Bạn đã có tài khoản? Đăng nhập để tiếp tục hành trình mua sắm thông minh
                            </p>
                        </div>

                        {/* Logo or Icon */}
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div>
                            <button
                                onClick={() => navigate('/login')}
                                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-green-500 transition-all duration-300 transform hover:scale-105"
                            >
                                ĐĂNG NHẬP
                            </button>
                        </div>

                        {/* Features */}
                        <div className="mt-12 space-y-3">
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">1,75K+ loại thực phẩm</span>
                            </div>
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">97K+ món ăn đa dạng</span>
                            </div>
                            <div className="flex items-center text-white/80">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">7.5K+ cửa hàng liên kết</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản</h1>
                            <p className="text-gray-600">
                                Đã có tài khoản? 
                                <a href="/login" className="text-green-600 hover:text-green-700 font-medium ml-1">
                                    Đăng nhập
                                </a>
                            </p>
                        </div>

                        {/* Social Register */}
                        <div className="mb-6">
                            <button
                                onClick={handleGoogleRegister}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-3"
                            >
                                <FcGoogle className="h-5 w-5 mr-2" />
                                <span className="text-gray-700 font-medium">Đăng ký với Google</span>
                            </button>
                            
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">hoặc đăng ký với email</span>
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
                            {/* Full Name Field */}
                            <div>
                                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="fullname"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Nhập email của bạn"
                                    required
                                />
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            placeholder="Tạo mật khẩu"
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

                                {/* Confirm Password Field */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            placeholder="Nhập lại mật khẩu"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    <>
                                        TẠO TÀI KHOẢN
                                        <HiArrowNarrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;