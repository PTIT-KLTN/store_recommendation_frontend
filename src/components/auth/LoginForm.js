import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from "react-icons/fc";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import StatisticsSidebar from '../StatisticsSidebar';
import { images } from '../../assets/assets';
import { authService } from '../../services/authService';

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.login({
                email: formData.email,
                password: formData.password
            });

            if (formData.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            navigate('/homepage');
        } catch (error) {
            console.error('Login failed:', error);
            setError(
                error.response?.data?.message ||
                'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginTestimonial = {
        quote: "Markendation giúp tôi lên kế hoạch bữa ăn và mua sắm thực phẩm hiệu quả. Tôi tiết kiệm được cả thời gian và tiền bạc khi sử dụng ứng dụng này.",
        author: "Trần Huyền",
        since: "2023",
        initials: "TH"
    };

    const handleGoogleLogin = async () => {
        try {
            await authService.googleLogin();
        } catch (error) {
            console.error('Google login failed:', error);
            setError('Đăng nhập Google không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            {/* Left side - Form */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-white border-r border-gray-200">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">Đăng nhập</h1>
                        <p className="text-gray-600 mb-6">
                            Chưa có tài khoản? <a href="/register" className="text-orange-500 hover:underline font-medium">Tạo tài khoản</a>
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    placeholder="Nhập email của bạn"
                                    required
                                />
                            </div>

                            <div className="mb-6 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Mật khẩu</label>
                                    <a href="/forgot-password" className="text-sm text-orange-500 hover:underline">Quên mật khẩu?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                        placeholder="Nhập mật khẩu"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                    >
                                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Đang đăng nhập...' : (
                                    <>
                                        Đăng nhập
                                        <HiArrowNarrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <div className="relative flex items-center justify-center mb-4">
                                <div className="border-t border-gray-300 absolute w-full"></div>
                                <div className="bg-white px-4 relative text-gray-500 text-sm">Hoặc</div>
                            </div>
                            <button
                                className="w-full border border-gray-300 bg-white text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center"
                                onClick={handleGoogleLogin}
                            >
                                <FcGoogle className="h-5 w-5 mr-2" />
                                Đăng nhập với Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <StatisticsSidebar logo={images.logo} testimonial={loginTestimonial} />
        </div>
    );
};

export default LoginForm;