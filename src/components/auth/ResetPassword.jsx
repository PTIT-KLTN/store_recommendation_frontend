import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiArrowNarrowRight } from "react-icons/hi";
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState(null);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isResetComplete, setIsResetComplete] = useState(false);

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
            setIsVerifying(false);
            return;
        }

        try {
            const response = await authService.verifyResetToken(token);

            if (response.valid) {
                setTokenValid(true);
                setUserEmail(response.email);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            if (error.response?.data?.error === 'TOKEN_EXPIRED') {
                setError('Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Không thể xác minh liên kết đặt lại mật khẩu. Vui lòng thử lại.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (error) setError(null);
    };

    const validatePassword = (password) => {
        if (password.length < 5) {
            return 'Mật khẩu phải có ít nhất 5 ký tự';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { newPassword, confirmPassword } = formData;

        if (!newPassword || !confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.resetPassword(token, newPassword);

            if (response.success) {
                setIsResetComplete(true);
                toast.success('Đặt lại mật khẩu thành công!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.',
                            messageType: 'success'
                        }
                    });
                }, 3000);
            } else {
                setError(response.message);
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Reset password failed:', error);
            const message = error.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, text: '', color: 'gray' };
        if (password.length < 5) return { strength: 1, text: 'Quá ngắn', color: 'red' };
        if (password.length < 8) return { strength: 2, text: 'Trung bình', color: 'yellow' };
        if (password.length < 12) return { strength: 3, text: 'Tốt', color: 'blue' };
        return { strength: 4, text: 'Mạnh', color: 'green' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex flex-col md:flex-row border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-white border-r border-gray-200">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang xác minh liên kết...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex flex-col md:flex-row justify-center items-center border border-gray-200 shadow-lg rounded-xl overflow-hidden">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Liên kết không hợp lệ
                        </h1>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="space-y-3">
                            <a
                                href="/forgot-password"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 text-center"
                            >
                                Yêu cầu đặt lại mật khẩu mới
                            </a>
                            <a
                                href="/login"
                                className="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300 text-center"
                            >
                                Về trang đăng nhập
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center items-center border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
                    {!isResetComplete ? (
                        <>
                            <h1 className="text-3xl font-bold mb-2 text-gray-800">Đặt lại mật khẩu</h1>
                            <p className="text-gray-600 mb-6">
                                Tạo mật khẩu mới cho <span className="font-medium text-orange-500">{userEmail}</span>
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* New Password */}
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.newPassword && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color === 'red' ? 'bg-red-500' :
                                                                passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                                    passwordStrength.color === 'blue' ? 'bg-blue-500' :
                                                                        passwordStrength.color === 'green' ? 'bg-green-500' : 'bg-gray-300'
                                                            }`}
                                                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-medium ${passwordStrength.color === 'red' ? 'text-red-600' :
                                                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                                            passwordStrength.color === 'blue' ? 'text-blue-600' :
                                                                passwordStrength.color === 'green' ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                    {passwordStrength.text}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-6">
                                    <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Password Match Indicator */}
                                    {formData.confirmPassword && (
                                        <div className="mt-2">
                                            {formData.newPassword === formData.confirmPassword ? (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-xs">Mật khẩu khớp</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <span className="text-xs">Mật khẩu không khớp</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${(isLoading || !formData.newPassword || !formData.confirmPassword) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Đang đặt lại mật khẩu...' : (
                                        <>
                                            Đặt lại mật khẩu
                                            <HiArrowNarrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <a href="/login" className="text-sm text-orange-500 hover:underline font-medium">
                                    ← Về trang đăng nhập
                                </a>
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

                            <h1 className="text-3xl font-bold mb-2 text-gray-800">Thành công!</h1>
                            <p className="text-gray-600 mb-6">
                                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.
                            </p>

                            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                                <p className="text-sm">
                                    Đang chuyển hướng trong 3 giây...
                                </p>
                            </div>

                            <a
                                href="/login"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 text-center"
                            >
                                Đăng nhập ngay
                            </a>
                        </div>
                    )}

                    {/* Security Note */}
                    {!isResetComplete && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Lời khuyên bảo mật:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        <li>Sử dụng mật khẩu mạnh và duy nhất</li>
                                        <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                                        <li>Cân nhắc sử dụng trình quản lý mật khẩu</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;