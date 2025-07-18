import React from 'react';
import QuantityControl from './QuantityControl';

const IngredientItem = ({
    item, isDishIngredient = false, dishId = null, updateQuantity, removeItem
}) => {
    return (
        <div className="flex items-center py-4 mb-3 bg-gray-50 rounded-lg">
            <div className="flex items-center w-[40%]">
                <div className="bg-white p-3 rounded-md shadow-md flex justify-center items-center h-28 w-28 ml-4 mr-4">
                    <img
                        src={item.image || item.imageUrl}
                        alt={item.name}
                        className="h-24 w-24 object-contain"
                    />
                </div>
                <div>
                    <p className="text-lg font-medium">{item.vietnamese_name}</p>
                </div>
            </div>
            <div className="w-[60%] flex justify-end items-center pr-4">
                <QuantityControl
                    item={item}
                    isDishIngredient={isDishIngredient}
                    dishId={dishId}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                />
            </div>
        </div>
    );
};

export default IngredientItem;