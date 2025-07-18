import React, { useState } from 'react';
import { FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import IngredientItem from './IngredientItem';

const DishSection = ({
    dishes, expandedSections, toggleSection, updateQuantity, removeItem, updateDishServings
}) => {
    return (
        <div>
            <div className="flex items-center py-4 px-5 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Món ăn</h2>
                <button
                    onClick={() => toggleSection('foodSection')}
                    className="ml-3 bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center"
                >
                    {expandedSections.foodSection ?
                        <FiChevronsUp size={24} /> :
                        <FiChevronsDown size={24} />
                    }
                </button>
            </div>

            {expandedSections.foodSection && (
                <div className="pt-5 pb-5 px-6">
                    {Object.entries(dishes).map(([dishId, dish]) => (
                        <DishItem
                            key={dishId}
                            dishId={dishId}
                            dish={dish}
                            isExpanded={expandedSections.dishes[dishId]}
                            toggleDish={() => toggleSection('dish', dishId)}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                            updateDishServings={updateDishServings}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DishItem = ({
    dishId, dish, isExpanded, toggleDish, updateQuantity, removeItem, updateDishServings
}) => {
    return (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            <div className="py-4 px-5 flex items-center">
                <div className="flex items-center">
                    {dish.imageUrl && (
                        <div className="mr-4 h-16 w-16 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                                src={dish.imageUrl}
                                alt={dish.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <h3 className="font-medium text-lg text-gray-800">{dish.name}</h3>
                </div>
                <ServingsControl
                    dishId={dishId}
                    servings={dish.servings || 1}
                    updateDishServings={updateDishServings}
                />
                <button
                    onClick={toggleDish}
                    className="ml-auto bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center"
                >
                    {isExpanded ? <FiChevronsUp size={24} /> : <FiChevronsDown size={24} />}
                </button>
            </div>

            {isExpanded && (
                <div className="pt-3 pb-4 px-5 bg-white">
                    {dish.ingredients.map((ingredient) => (
                        <IngredientItem
                            key={`${dishId}-${ingredient.id}`}
                            item={ingredient}
                            isDishIngredient={true}
                            dishId={dishId}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                            dishServings={dish.servings || 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ServingsControl = ({ dishId, servings, updateDishServings }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleDecreaseServings = () => {
        if (servings === 1) {
            setShowConfirmation(true);
        } else {
            updateDishServings(dishId, servings - 1);
        }
    };

    const confirmDelete = () => {
        updateDishServings(dishId, 0);
        setShowConfirmation(false);
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="flex items-center ml-5 bg-orange-50 rounded-xl border border-orange-200 px-3 py-2">
            <span className="text-sm text-gray-600 mr-2">Phần ăn:</span>
            <button
                onClick={handleDecreaseServings}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white mr-2"
            >
                <span className="text-sm">−</span>
            </button>
            <span className="text-base font-medium mx-2">{servings}</span>
            <button
                onClick={() => {
                    const newServings = servings + 1;
                    updateDishServings(dishId, newServings);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white ml-2"
            >
                <span className="text-sm">+</span>
            </button>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa món ăn này khỏi giỏ hàng?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DishSection;