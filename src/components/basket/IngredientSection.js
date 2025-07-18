import React from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import IngredientItem from './IngredientItem';

const IngredientSection = ({
    ingredients, expanded, toggleSection, updateQuantity, removeItem
}) => {
    return (
        <div className="border-b border-gray-100">
            <div className="flex items-center py-4 px-5">
                <h2 className="text-2xl font-bold text-gray-900">Nguyên Liệu</h2>
                <button
                    onClick={toggleSection}
                    className="ml-3 bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center"
                >
                    {expanded ? <FiChevronsUp size={24} /> : <FiChevronsDown size={24} />}
                </button>
            </div>

            {expanded && (
                <div className="pt-5 pb-5 px-6">
                    {ingredients.map((item) => (
                        <IngredientItem
                            key={item.id}
                            item={item}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IngredientSection;