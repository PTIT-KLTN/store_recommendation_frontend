import React, { useState } from 'react';
import { FiSave, FiX, FiShoppingBag } from 'react-icons/fi';

const SaveBasketDialog = ({ isOpen, onClose, onSave, loading = false }) => {
    const [basketName, setBasketName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!basketName.trim()) {
            setError('Vui lòng nhập tên giỏ hàng');
            return;
        }

        if (basketName.trim().length < 3) {
            setError('Tên giỏ hàng phải có ít nhất 3 ký tự');
            return;
        }

        onSave(basketName.trim());
    };

    const handleClose = () => {
        setBasketName('');
        setError('');
        onClose();
    };

    const handleInputChange = (e) => {
        setBasketName(e.target.value);
        if (error) {
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <FiShoppingBag className="text-green-600 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Lưu giỏ hàng yêu thích
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label htmlFor="basketName" className="block text-sm font-medium text-gray-700 mb-2">
                            Tên giỏ hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="basketName"
                            value={basketName}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Nguyên liệu hàng tháng, Đi picnic..."
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                            autoFocus
                            maxLength={50}
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {basketName.length}/50 ký tự
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                        <p className="text-sm text-blue-700">
                            💡 <strong>Gợi ý:</strong> Đặt tên mô tả để dễ nhận biết như "Nấu ăn cuối tuần", "Tiệc sinh nhật", "Mua sắm tháng 1"...
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                            disabled={loading || !basketName.trim()}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" />
                                    Lưu giỏ hàng
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveBasketDialog;