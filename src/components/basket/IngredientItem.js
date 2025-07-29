import React from 'react';
import QuantityControl from './QuantityControl';

const IngredientItem = ({
    item, 
    isDishIngredient = false, 
    dishId = null, 
    updateQuantity, 
    removeItem
}) => {
    // For dish ingredients, use 'name' as identifier
    // For standalone ingredients, use 'id'
    const itemIdentifier = isDishIngredient ? item.name : item.id;
    
    return (
        <div className="flex items-center py-4 mb-3 bg-gray-50 rounded-lg">
            <div className="flex items-center w-[40%]">
                <div className="bg-white p-3 rounded-md shadow-md flex justify-center items-center h-28 w-28 ml-4 mr-4">
                    <img
                        src={item.image || item.imageUrl}
                        alt={item.vietnamese_name || item.name}
                        className="h-24 w-24 object-contain"
                        onError={(e) => {
                            e.target.src = '/images/default-ingredient.jpg';
                        }}
                    />
                </div>
                <div>
                    <p className="text-lg font-medium">
                        {item.vietnamese_name || item.name}
                    </p>
                    {item.name && item.vietnamese_name && item.name !== item.vietnamese_name && (
                        <p className="text-sm text-gray-500 italic">
                            {item.name}
                        </p>
                    )}
                    {item.category && (
                        <p className="text-xs text-gray-400 mt-1">
                            {item.category}
                        </p>
                    )}
                </div>
            </div>
            <div className="w-[60%] flex justify-end items-center pr-4">
                <QuantityControl
                    item={{
                        ...item,
                        id: itemIdentifier // Use the correct identifier
                    }}
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