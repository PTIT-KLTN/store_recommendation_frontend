// components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { HiArrowNarrowRight } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StatisticsSidebar from './StatisticsSidebar';
import { images } from '../../assets/assets';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Vui lòng nhập email của bạn');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Vui lòng nhập email hợp lệ');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.forgotPassword(email);

            if (response.success) {
                setIsSubmitted(true);
                toast.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!');
            } else {
                setError(response.message);
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Forgot password failed:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTryAgain = () => {
        setIsSubmitted(false);
        setError(null);
        setEmail('');
    };

    const forgotPasswordTestimonial = {
        quote: "Markendation giúp tôi quản lý thực phẩm và lên kế hoạch bữa ăn một cách thông minh. Giao diện đơn giản và dễ sử dụng.",
        author: "Nguyễn Minh",
        since: "2023",
        initials: "NM"
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center items-center border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
                    {!isSubmitted ? (
                        <>
                            <h1 className="text-3xl font-bold mb-2 text-gray-800">Quên mật khẩu</h1>
                            <p className="text-gray-600 mb-6">
                                Nhớ mật khẩu? <a href="/login" className="text-orange-500 hover:underline font-medium">Đăng nhập</a>
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Nhập email của bạn"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Đang gửi...' : (
                                        <>
                                            Gửi liên kết đặt lại
                                            <HiArrowNarrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Cần hỗ trợ? {' '}
                                    <a href="/contact" className="text-orange-500 hover:underline font-medium">
                                        Liên hệ hỗ trợ
                                    </a>
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-bold mb-2 text-gray-800">Kiểm tra email</h1>
                            <p className="text-gray-600 mb-6">
                                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email <strong>{email}</strong>
                            </p>

                            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                                <p className="text-sm">
                                    Không nhận được email? Kiểm tra thư mục spam hoặc thử lại với email khác.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleTryAgain}
                                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                                >
                                    Thử email khác
                                </button>

                                <a
                                    href="/login"
                                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 text-center"
                                >
                                    Về trang đăng nhập
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;