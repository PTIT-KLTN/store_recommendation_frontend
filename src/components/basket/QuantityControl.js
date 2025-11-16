import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const QuantityControl = ({ item,  isDishIngredient = false,  dishId = null, updateQuantity,  removeItem}) => {
    // Extract quantity value and unit from item.unit string (e.g., "5 g" -> value: 5, unit: "g")
    const extractUnitInfo = () => {
        if (!item.unit) return { value: '1', unit: 'g' };
        
        const cleanedUnit = item.unit.replace(/[()]/g, '').trim().toLowerCase();
        
        // Handle "tuỳ thích" or "tùy thích" case
        if (cleanedUnit === 'tuỳ thích' || cleanedUnit === 'tùy thích') {
            return { value: '1', unit: 'g' };
        }
        
        const parts = cleanedUnit.split(/\s+/);
        if (parts.length >= 2) {
            return { value: parts[0], unit: parts.slice(1).join(' ') };
        }
        return { value: cleanedUnit, unit: '' };
    };

    const { value: unitValue, unit: unitName } = extractUnitInfo();
    const [inputValue, setInputValue] = useState(unitValue);

    useEffect(() => {
        const { value } = extractUnitInfo();
        setInputValue(value);
    }, [item.unit]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        const newValue = parseFloat(inputValue);

        if (isNaN(newValue) || newValue < 0.1) {
            const { value } = extractUnitInfo();
            setInputValue(value);
        } else {
            const newUnit = `${newValue} ${unitName}`;
            setInputValue(newValue);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    const handleDecrease = () => {
        const currentValue = parseFloat(inputValue) || 0;
        const newValue = Math.max(0.1, currentValue - 1);
        setInputValue(newValue);
    };

    const handleIncrease = () => {
        const currentValue = parseFloat(inputValue) || 0;
        const newValue = currentValue + 1;
        setInputValue(newValue);
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
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 gap-3">
                <button
                    onClick={handleDecrease}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-xl font-medium"
                >
                    −
                </button>

                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        className="text-center w-12 text-base font-medium bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Quantity"
                    />
                    
                    <span className="font-medium text-base">
                        {unitName}
                    </span>
                </div>

                <button
                    onClick={handleIncrease}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-xl font-medium"
                >
                    +
                </button>
            </div>

            <button
                onClick={handleRemove}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 text-red-500 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors"
                title={isDishIngredient ? "Xóa nguyên liệu khỏi món ăn" : "Xóa nguyên liệu"}
            >
                <FiTrash2 size={20} />
            </button>
        </div>
    );
};

export default QuantityControl;