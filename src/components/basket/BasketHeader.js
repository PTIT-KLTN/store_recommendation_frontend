import React, { useState } from 'react';
import { FiBookmark } from 'react-icons/fi';
import cartIcon from '../../assets/images/cart.png';

const BasketHeader = ({ saveCart }) => {

    return (
        <div className="bg-green-600 py-3 px-4 flex justify-between items-center mb-px">
            <div className="flex items-center gap-2">
                <img src={cartIcon} alt="" className="h-7 w-7 mr-2" />
                <h1 className="text-white text-xl font-medium">Giỏ hàng của tôi</h1>
            </div>
            <button
                onClick={saveCart}
                className="bg-orange-500 text-lg text-white px-4 py-2 rounded flex items-center text-sm"
            >
                <FiBookmark className="w-5 h-5 mr-1" />
                Lưu giỏ hàng yêu thích
            </button>
        </div>
    );
};

export default BasketHeader;