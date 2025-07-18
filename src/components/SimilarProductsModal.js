import React, { useState, useEffect } from 'react';
import { HiCheck, HiOutlineX } from 'react-icons/hi';

const SimilarProductsModal = ({
    isOpen,
    onClose,
    product,
    similarProducts = [],
    onSelectProduct,
    formatPrice
}) => {
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        setSelectedProduct(null);
    }, [isOpen, product]);

    if (!isOpen) return null;

    const handleSelectProduct = (similarProduct) => {
        setSelectedProduct(similarProduct);
    };

    const handleConfirmSelection = () => {
        if (selectedProduct && onSelectProduct) {
            onSelectProduct(product, selectedProduct);
            onClose();
        }
    };

    const formatProductInfo = (prod) => {
        return (
            <div className="flex-1">
                <div className="text-sm font-medium">{prod?.name_vi || prod?.name}</div>
                {prod?.name_en && prod?.name_en !== prod?.name_vi && (
                    <div className="text-xs text-gray-500 italic">{prod.name_en}</div>
                )}
                <div className="flex justify-between text-sm mt-1">
                    <div className="flex flex-col">
                        {prod?.discount_percent > 0 && (
                            <span className="text-xs text-red-500 line-through">
                                {formatPrice ? formatPrice(prod.original_price) : prod.original_price}đ
                            </span>
                        )}
                        <span className="text-orange-600 font-medium">
                            {formatPrice ? formatPrice(prod.cost) : prod.cost}đ
                        </span>
                    </div>
                    <div className="text-right text-gray-500">
                        <div className="text-xs">{prod.quantity} {prod.unit}</div>
                        {prod.product_net_unit_value && (
                            <div className="text-xs">({prod.product_net_unit_value}{prod.unit}/sp)</div>
                        )}
                    </div>
                </div>
                {prod?.promotion && (
                    <div className="text-xs text-blue-600 mt-1">{prod.promotion}</div>
                )}
                {prod?.match_score && (
                    <div className="text-xs text-gray-500 mt-1">
                        Độ phù hợp: {Math.round(prod.match_score * 100)}%
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-green-600 px-4 py-3 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white" id="modal-title">
                            Chọn sản phẩm thay thế
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <HiOutlineX className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Original product */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="text-sm text-gray-500 mb-2">Sản phẩm hiện tại:</div>
                        <div className="flex items-center">
                            {product?.image && (
                                <div className="w-16 h-16 flex-shrink-0 mr-3 bg-white rounded-md p-1 border border-gray-200">
                                    <img
                                        src={product.image}
                                        alt={product.name_vi || product.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-product.jpg';
                                        }}
                                    />
                                </div>
                            )}
                            {formatProductInfo(product)}
                        </div>
                        {product?.ingredientVietnameseName && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                Cho nguyên liệu: {product.ingredientVietnameseName}
                            </div>
                        )}
                    </div>

                    {/* Similar products list */}
                    <div className="px-4 py-3">
                        <div className="text-sm text-gray-500 mb-2">Sản phẩm thay thế có sẵn ({similarProducts.length}):</div>
                        <div className="max-h-60 overflow-y-auto pr-1">
                            {similarProducts.map((similarProduct) => (
                                <div
                                    key={similarProduct.id}
                                    className={`p-3 border rounded-lg mb-2 flex items-center cursor-pointer transition-colors ${selectedProduct?.id === similarProduct.id
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleSelectProduct(similarProduct)}
                                >
                                    {similarProduct.image && (
                                        <div className="w-12 h-12 flex-shrink-0 mr-3 bg-white rounded-md p-1 border border-gray-100">
                                            <img
                                                src={similarProduct.image}
                                                alt={similarProduct.name_vi || similarProduct.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/default-product.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    {formatProductInfo(similarProduct)}
                                    {selectedProduct?.id === similarProduct.id && (
                                        <div className="ml-2 bg-green-100 text-green-600 rounded-full p-1">
                                            <HiCheck className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${selectedProduct
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            onClick={handleConfirmSelection}
                            disabled={!selectedProduct}
                        >
                            Chọn sản phẩm này
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimilarProductsModal;