import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from "react-icons/fc";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import StatisticsSidebar from '../StatisticsSidebar';
import { images } from '../../assets/assets';
import { authService } from '../../services/authService';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
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

        if (!formData.agreeTerms) {
            setError('Bạn cần đồng ý với điều khoản dịch vụ.');
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
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            navigate('/homepage');
        } catch (error) {
            console.error('Registration failed:', error);
            setError(
                error.response?.data?.message ||
                'Đăng ký không thành công. Vui lòng thử lại sau.'
            );
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

    const registerTestimonial = {
        quote: "Markendation đã giúp tôi quản lý việc nấu ăn hàng ngày dễ dàng hơn rất nhiều. Tôi tiết kiệm được thời gian và không còn lãng phí thực phẩm nữa!",
        author: "Nguyễn Thành",
        since: "2024",
        initials: "NT"
    };

    const handleGoogleRegister = async () => {
        try {
            await authService.googleLogin();
        } catch (error) {
            console.error('Google register failed:', error);
            setError('Đăng ký Google không thành công. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            {/* Left side - Form */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-white border-r border-gray-200">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">Tạo tài khoản</h1>
                        <p className="text-gray-600 mb-6">
                            Đã có tài khoản? <a href="/login" className="text-orange-500 hover:underline font-medium">Đăng nhập</a>
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

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

                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                            placeholder="Tạo mật khẩu"
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

                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                            placeholder="Nhập lại mật khẩu"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        required
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Tôi đồng ý với <a href="/terms" className="text-orange-500 hover:underline">Điều khoản dịch vụ</a> và <a href="/privacy" className="text-orange-500 hover:underline">Chính sách bảo mật</a>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Đang xử lý...' : (
                                    <>
                                        Tạo tài khoản
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
                                onClick={handleGoogleRegister}
                            >
                                <FcGoogle className="h-5 w-5 mr-2" />
                                Đăng ký với Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <StatisticsSidebar logo={images.logo} testimonial={registerTestimonial} />
        </div>
    );
};

export default RegisterForm;