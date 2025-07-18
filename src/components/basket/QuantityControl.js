import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({
    item, isDishIngredient = false, dishId = null, updateQuantity, removeItem
}) => {
    const [inputValue, setInputValue] = useState(item.quantity);

    useEffect(() => {
        setInputValue(item.quantity);
    }, [item.quantity]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        const newQuantity = parseInt(inputValue, 10);

        if (isNaN(newQuantity) || newQuantity < 1) {
            setInputValue(item.quantity);
        } else {
            updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={() => {
                    const newQuantity = Math.max(1, parseInt(item.quantity, 10) - 1);
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-base">−</span>
            </button>

            <input
                type="number"
                min="1"
                step="1"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="mx-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-center w-24 text-base font-medium"
                aria-label="Quantity"
            />

            <button
                onClick={() => {
                    const newQuantity = parseInt(item.quantity, 10) + 1;
                    updateQuantity(item.id, newQuantity, isDishIngredient, dishId);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
            >
                <span className="text-base">+</span>
            </button>

            <span className="ml-6 font-medium text-base">
                {item.unit}
            </span>

            <button
                onClick={() => removeItem(item.id, isDishIngredient, dishId)}
                className="ml-8 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded"
            >
                <FiTrash2 size={20} />
            </button>
        </div>
    );
};

export default QuantityControl;