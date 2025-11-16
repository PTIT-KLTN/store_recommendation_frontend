import React from 'react';
import QuantityControl from './QuantityControl';

const IngredientItem = ({ item, isDishIngredient = false, dishId = null, updateQuantity, removeItem}) => {
    // For dish ingredients, use 'name' as identifier
    // For standalone ingredients, use 'id'
    const itemIdentifier = isDishIngredient ? item.name : item.id;
    
    return (
        <div className="flex items-center py-4 mb-3 bg-gray-50 rounded-lg">
            <div className="flex items-center w-[40%]">
                { (item.image || item.imageUrl) ? (
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
                ) : (
                    // Show a compact badge for items without images to avoid empty space
                    <div className={`flex items-center justify-center ml-4 mr-4 h-16 w-16 rounded-full font-semibold
                        ${item.ai_source ? 'bg-orange-50 border border-orange-200 text-orange-700' : 'bg-gray-100 border border-gray-200 text-gray-600'}`} title={item.ai_source ? 'Nguyên liệu từ AI' : 'Không có ảnh'}>
                        <span className="text-lg">
                            {(() => {
                                const name = item.vietnamese_name || item.name || '';
                                const parts = name.trim().split(/\s+/).filter(Boolean);
                                if (parts.length === 0) return item.ai_source ? 'AI' : '?';
                                if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
                                return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
                            })()}
                        </span>
                    </div>
                )}
                <div>
                    <p className="text-md font-medium">
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