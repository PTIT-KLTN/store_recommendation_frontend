import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({
    item, 
    isDishIngredient = false, 
    dishId = null, 
    updateQuantity, 
    removeItem
}) => {
    const [inputValue, setInputValue] = useState(item.quantity);

    useEffect(() => {
        setInputValue(item.quantity);
    }, [item.quantity]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        const newQuantity = parseFloat(inputValue);

        if (isNaN(newQuantity) || newQuantity < 0.1) {
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

    const handleDecrease = () => {
        const currentQuantity = parseFloat(item.quantity) || 0;
        const newQuantity = Math.max(0.1, currentQuantity - 0.1);
        updateQuantity(item.id, parseFloat(newQuantity.toFixed(1)), isDishIngredient, dishId);
    };

    const handleIncrease = () => {
        const currentQuantity = parseFloat(item.quantity) || 0;
        const newQuantity = currentQuantity + 0.1;
        updateQuantity(item.id, parseFloat(newQuantity.toFixed(1)), isDishIngredient, dishId);
    };

    const handleRemove = () => {
        if (isDishIngredient) {
            // For dish ingredients, pass the item identifier and dish ID
            removeItem(item.id, true, dishId);
        } else {
            // For standalone ingredients, just pass the item ID
            removeItem(item.id, false);
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={handleDecrease}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
            >
                <span className="text-base">−</span>
            </button>

            <input
                type="number"
                min="0.1"
                step="0.1"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="mx-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-center w-24 text-base font-medium"
                aria-label="Quantity"
            />

            <button
                onClick={handleIncrease}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
            >
                <span className="text-base">+</span>
            </button>

            <span className="ml-6 font-medium text-base">
                {item.unit}
            </span>

            <button
                onClick={handleRemove}
                className="ml-8 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title={isDishIngredient ? "Xóa nguyên liệu khỏi món ăn" : "Xóa nguyên liệu"}
            >
                <FiTrash2 size={20} />
            </button>
        </div>
    );
};

export default QuantityControl;