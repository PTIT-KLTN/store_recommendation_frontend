import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { MdOutlineImageNotSupported } from "react-icons/md";
import { toast } from 'react-toastify';
import { useBasket } from '../context/BasketContext';
import { AIWarnings, AISuggestions, AISimilarDishes, AIInsights } from './AIComponents';

const ShoppingModal = ({ isOpen, onClose, type, itemData, searchQuery }) => {
    const [quantity, setQuantity] = useState(1);
    const [dishWithIngredients, setDishWithIngredients] = useState(null);
    const { addIngredient, addDish } = useBasket();
    const [selectedIngredients, setSelectedIngredients] = useState({});
    const [selectedOptionalIngredients, setSelectedOptionalIngredients] = useState({});
    const [selectedSuggestions, setSelectedSuggestions] = useState({});

    // Check if this is an AI result
    const isAiResult = type === 'ai_result' || (itemData && (itemData.status || itemData.cart));

    // Quantity limits based on type
    const getQuantityLimit = () => {
        if (type === 'dish' || isAiResult) {
            return 10; 
        }
        return 5000; 
    };

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);

            // Handle AI Result
            if (isAiResult && itemData) {
                // Check for error status
                if (itemData.status === 'error' || itemData.status === 'guardrail_blocked') {
                    return;
                }

                // Convert AI result to dish format
                if (itemData.cart && itemData.cart.items) {
                    const aiDish = {
                        id: 'ai_' + Date.now(),
                        name: itemData.dish?.name || 'Món ăn từ AI',
                        vietnamese_name: itemData.dish?.name || 'Món ăn từ AI',
                        image: null,
                        servings: itemData.dish?.servings || 1,
                        ingredients: itemData.cart.items.map(item => ({
                            _id: item.ingredient_id || 'ai_ing_' + Math.random(),
                            ingredient_name: item.name_en || item.name_vi,
                            vietnamese_name: item.name_vi,
                            image: null,
                            quantity: item.quantity,
                            unit: item.unit,
                            category: item.category,
                            estimated_price: item.estimated_price
                        })),
                        // Store AI-specific data
                        aiData: {
                            suggestions: itemData.suggestions || [],
                            warnings: itemData.warnings || [],
                            similar_dishes: itemData.similar_dishes || [],
                            insights: itemData.insights || [],
                            prep_time: itemData.dish?.prep_time,
                            servings: itemData.dish?.servings
                        }
                    };
                    setDishWithIngredients(aiDish);

                    // Auto-select all main ingredients
                    const initialSelected = {};
                    aiDish.ingredients.forEach(ing => {
                        const key = ing.ingredient_name;
                        initialSelected[key] = true;
                    });
                    setSelectedIngredients(initialSelected);
                    setSelectedSuggestions({});
                }
            }
            // Handle regular dish
            else if (type === 'dish' && itemData) {
                if (itemData.ingredients && itemData.ingredients.length > 0) {
                    setDishWithIngredients(itemData);
                } else {
                    setDishWithIngredients(itemData);
                }

                // Auto-select ALL main ingredients
                const initialSelected = {};
                if (itemData.ingredients) {
                    itemData.ingredients.forEach(ing => {
                        const key = ing.ingredient_name;
                        initialSelected[key] = true;
                    });
                }
                setSelectedIngredients(initialSelected);

                // Auto-select ALL optional ingredients
                const initialOptionalSelected = {};
                if (itemData.optionalIngredients) {
                    itemData.optionalIngredients.forEach(ing => {
                        const key = ing.ingredient_name;
                        initialOptionalSelected[key] = true;
                    });
                }
                setSelectedOptionalIngredients(initialOptionalSelected);
            }
        } else {
            setDishWithIngredients(null);
            setSelectedIngredients({});
            setSelectedOptionalIngredients({});
            setSelectedSuggestions({});
        }
    }, [isOpen, type, itemData, isAiResult]);

    if (!isOpen) return null;

    const handleQuantityChange = (value) => {
        const parsedValue = parseInt(value, 10);
        const maxQuantity = getQuantityLimit();
        
        if (isNaN(parsedValue) || parsedValue < 1) {
            setQuantity(1);
        } else if (parsedValue > maxQuantity) {
            setQuantity(maxQuantity);
            toast.warning(`Số lượng tối đa là ${maxQuantity} ${getUnit()}`);
        } else {
            setQuantity(parsedValue);
        }
    };

    const handleQuantityIncrease = () => {
        const maxQuantity = getQuantityLimit();
        if (quantity < maxQuantity) {
            setQuantity(quantity + 1);
        } else {
            toast.warning(`Số lượng tối đa là ${maxQuantity} ${getUnit()}`);
        }
    };

    const handleQuantityDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const toggleIngredient = (id, isOptional = false) => {
        if (isOptional) {
            setSelectedOptionalIngredients(prev => ({
                ...prev,
                [id]: !prev[id]
            }));
        } else {
            setSelectedIngredients(prev => ({
                ...prev,
                [id]: !prev[id]
            }));
        }
    };

    const toggleSuggestion = (id) => {
        setSelectedSuggestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleAddToCart = async () => {
        try {
            if ((type === 'dish' || isAiResult) && dishWithIngredients) {
                // Get selected main ingredients
                const selectedMainIngredients = (dishWithIngredients.ingredients || [])
                    .filter(ing => {
                        const key = ing.ingredient_name;
                        return selectedIngredients[key];
                    })
                    .map(ingredient => ({
                        id: ingredient._id,
                        name: ingredient.ingredient_name,
                        vietnamese_name: ingredient.vietnamese_name,
                        imageUrl: ingredient.image,
                        net_unit_value: ingredient.net_unit_value,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        category: ingredient.category,
                        estimated_price: ingredient.estimated_price
                    }));

                // Get selected optional ingredients
                const selectedOptIngredients = (dishWithIngredients.optionalIngredients || [])
                    .filter(ing => {
                        const key = ing.ingredient_name;
                        return selectedOptionalIngredients[key];
                    })
                    .map(ingredient => ({
                        id: ingredient._id,
                        name: ingredient.ingredient_name,
                        vietnamese_name: ingredient.vietnamese_name,
                        imageUrl: ingredient.image,
                        net_unit_value: ingredient.net_unit_value,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        category: ingredient.category
                    }));

                // Get selected suggestions (for AI results)
                let selectedSuggestionIngredients = [];
                if (isAiResult && dishWithIngredients.aiData?.suggestions) {
                    selectedSuggestionIngredients = dishWithIngredients.aiData.suggestions
                        .filter(sug => {
                            const key = sug.ingredient_id || sug.name_vi;
                            return selectedSuggestions[key];
                        })
                        .map(suggestion => ({
                            id: suggestion.ingredient_id || 'sug_' + Math.random(),
                            name: suggestion.name_en || suggestion.name_vi,
                            vietnamese_name: suggestion.name_vi,
                            imageUrl: null,
                            quantity: '100',
                            unit: 'gram',
                            category: 'suggestion'
                        }));
                }

                const allSelectedIngredients = [
                    ...selectedMainIngredients, 
                    ...selectedOptIngredients,
                    ...selectedSuggestionIngredients
                ];

                if (allSelectedIngredients.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất một nguyên liệu');
                    return;
                }

                const dish = {
                    id: dishWithIngredients.id,
                    name: dishWithIngredients.name,
                    vietnamese_name: dishWithIngredients.vietnamese_name,
                    imageUrl: dishWithIngredients.image,
                    servings: quantity,
                    ingredients: allSelectedIngredients
                };

                await addDish(dish);
                toast.success(`Đã thêm món "${dish.vietnamese_name}" vào giỏ hàng!`);
                onClose();
            } 
            else if (type === 'ingredient') {
                if (!itemData.id || !itemData.name) {
                    toast.error('Thông tin nguyên liệu không hợp lệ');
                    return;
                }

                const ingredient = {
                    id: itemData.id,
                    name: itemData.name,
                    vietnamese_name: itemData.vietnamese_name,
                    imageUrl: itemData.image,
                    quantity: quantity.toString(),
                    unit: itemData.unit,
                    net_unit_value: itemData.net_unit_value,
                    category: itemData.category
                };

                await addIngredient(ingredient);
                toast.success(`Đã thêm ${quantity} ${itemData.unit} ${itemData.vietnamese_name} vào giỏ hàng!`);
                onClose();
            }
            else if ((type === 'ingredients' || type === 'search') && itemData) {
                const ingredientsArray = itemData;
                for (const ingredient of ingredientsArray) {
                    const processedIngredient = {
                        id: ingredient.id,
                        vietnamese_name: ingredient.vietnamese_name,
                        name: ingredient.name,
                        image: ingredient.image,
                        quantity: quantity,
                        net_unit_value: ingredient.net_unit_value,
                        unit: ingredient.unit || 'g',
                        category: ingredient.category
                    };

                    await addIngredient(processedIngredient);
                }

                if (type === 'search' && searchQuery) {
                    toast.success(`Đã thêm nguyên liệu cho "${searchQuery}" vào giỏ hàng!`);
                } else {
                    toast.success(
                        `Đã thêm ${ingredientsArray.length > 1
                            ? 'các nguyên liệu'
                            : ingredientsArray[0].vietnamese_name} (${quantity} ${getUnit()}) vào giỏ hàng!`
                    );
                }
                onClose();
            }

            window.dispatchEvent(new CustomEvent('basketUpdated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    const getTitle = () => {
        if (isAiResult && itemData) {
            if (itemData.status === 'error' || itemData.status === 'guardrail_blocked') {
                return itemData.dish?.name || 'Lỗi phân tích';
            }
            return itemData.dish?.name || 'Kết quả phân tích AI';
        }
        if (type === 'dish' && dishWithIngredients) {
            return dishWithIngredients.vietnamese_name || dishWithIngredients.name;
        }
        if (type === 'ingredient') {
            return itemData?.vietnamese_name || itemData?.name;
        }
        if ((type === 'ingredients' || type === 'search') && itemData) {
            if (Array.isArray(itemData) && itemData.length === 1) {
                return itemData[0].vietnamese_name || itemData[0].name;
            }
            return 'Chi tiết nguyên liệu';
        }
        return 'Chi tiết';
    };

    const getUnit = () => {
        if (type === 'dish' || isAiResult) {
            return 'khẩu phần';
        }
        if ((type === 'ingredients' || type === 'search') && itemData) {
            if (Array.isArray(itemData) && itemData.length > 0) {
                return itemData[0].unit || 'g';
            }
            return itemData?.unit || 'g';
        }
        return itemData?.unit || 'g';
    };

    const getImage = () => {
        if (type === 'dish' && dishWithIngredients) {
            return dishWithIngredients.image || dishWithIngredients.imageUrl;
        }
        if (type === 'ingredient') {
            return itemData?.image;
        }
        return null;
    };

    const title = getTitle();
    const image = getImage();
    const maxQuantity = getQuantityLimit();

    // Check if showing multiple ingredients (from search)
    const showMultipleIngredients = Array.isArray(itemData) && itemData.length > 1 && type !== 'dish' && !isAiResult;

    // Handle error states for AI results
    if (isAiResult && itemData && (itemData.status === 'error' || itemData.status === 'guardrail_blocked')) {
        return (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                onClick={onClose}
            >
                <div 
                    className="bg-white rounded-3xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <FiAlertTriangle className="text-red-600 text-2xl" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                {itemData.status === 'guardrail_blocked' ? 'Nội dung không phù hợp' : 'Không thể phân tích'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700">
                            {itemData.message || itemData.error || 'Đã xảy ra lỗi khi phân tích. Vui lòng thử lại.'}
                        </p>
                    </div>
                    <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-600 text-white py-4 rounded-full font-bold hover:bg-gray-700"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl z-10">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        {isAiResult && dishWithIngredients?.aiData?.prep_time && (
                            <p className="text-gray-600 text-sm mt-1">⏱️ Thời gian: {dishWithIngredients.aiData.prep_time}</p>
                        )}
                        {isAiResult && dishWithIngredients?.aiData?.servings && (
                            <p className="text-gray-600 text-sm">👥 Khẩu phần gốc: {dishWithIngredients.aiData.servings} người</p>
                        )}
                        {searchQuery && (
                            <p className="text-sm text-gray-500 mt-2">
                                Kết quả cho: <span className="font-medium">"{searchQuery}"</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row">
                    {/* Left content */}
                    <div className="flex-1 p-6">
                        {/* AI Components */}
                        {isAiResult && dishWithIngredients?.aiData && (
                            <>
                                <AIWarnings warnings={dishWithIngredients.aiData.warnings} />
                            </>
                        )}

                        {/* Main ingredients */}
                        {(type === 'dish' || isAiResult) && dishWithIngredients?.ingredients && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">
                                    Nguyên liệu chính ({dishWithIngredients.ingredients.length})
                                </h3>
                                <ul className="space-y-2">
                                    {dishWithIngredients.ingredients.map((ing, idx) => {
                                        const key = ing.ingredient_name;
                                        const isSelected = selectedIngredients[key];
                                        
                                        return (
                                            <li 
                                                key={ing._id || idx} 
                                                className={`flex items-center py-3 px-4 rounded-lg border-2 cursor-pointer ${
                                                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => toggleIngredient(key)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleIngredient(key)}
                                                    className="w-5 h-5 mr-3"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex flex-1 justify-between items-center">
                                                    <span className="font-medium">{ing.vietnamese_name || ing.name}</span>
                                                    <div className="text-right">
                                                        {ing.quantity && ing.unit && (
                                                            <span className="text-gray-700">
                                                                {ing.quantity} <span className="text-gray-500">{ing.unit}</span>
                                                            </span>
                                                        )}
                                                        {ing.estimated_price && (
                                                            <div className="text-sm text-green-600">
                                                                ~{ing.estimated_price.toLocaleString()}đ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Optional ingredients */}
                        {dishWithIngredients?.optionalIngredients?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">
                                    Nguyên liệu tùy chọn ({dishWithIngredients.optionalIngredients.length})
                                </h3>
                                <ul className="space-y-2">
                                    {dishWithIngredients.optionalIngredients.map((ing, idx) => {
                                        const key = ing.ingredient_name;
                                        const isSelected = selectedOptionalIngredients[key];
                                        
                                        return (
                                            <li 
                                                key={ing._id || idx} 
                                                className={`flex items-center py-3 px-4 rounded-lg border-2 cursor-pointer ${
                                                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => toggleIngredient(key, true)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleIngredient(key, true)}
                                                    className="w-5 h-5 mr-3"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex flex-1 justify-between">
                                                    <span className="font-medium">{ing.vietnamese_name || ing.name}</span>
                                                    {ing.quantity && ing.unit && (
                                                        <span className="text-gray-700">
                                                            {ing.quantity} <span className="text-gray-500">{ing.unit}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* AI Suggestions & Info */}
                        {isAiResult && dishWithIngredients?.aiData && (
                            <>
                                <AISuggestions 
                                    suggestions={dishWithIngredients.aiData.suggestions}
                                    selectedSuggestions={selectedSuggestions}
                                    onToggle={toggleSuggestion}
                                />
                                <AISimilarDishes similarDishes={dishWithIngredients.aiData.similar_dishes} />
                                <AIInsights insights={dishWithIngredients.aiData.insights} />
                            </>
                        )}

                        {/* Multiple ingredients (search) */}
                        {showMultipleIngredients && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu được nhận diện</h3>
                                <ul className="space-y-2">
                                    {itemData.map((item, idx) => (
                                        <li key={idx} className="flex justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.vietnamese_name}
                                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                                        onError={(e) => {e.target.src = '/images/default-ingredient.jpg'}}
                                                    />
                                                )}
                                                <span className="font-medium">{item.vietnamese_name || item.name}</span>
                                            </div>
                                            {item.quantity && item.unit && (
                                                <span className="text-gray-700">
                                                    {item.quantity} <span className="text-gray-500">{item.unit}</span>
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity controls */}
                        <div className="mb-6">
                            <label className="text-xl font-bold mb-4 block">Nhập số lượng mong muốn:</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleQuantityDecrease}
                                    disabled={quantity <= 1}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 hover:border-green-500"
                                >
                                    <span className="text-xl font-bold">−</span>
                                </button>
                                <input
                                    type="number" 
                                    min="1" 
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full text-center text-xl font-bold focus:border-green-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleQuantityIncrease}
                                    disabled={quantity >= maxQuantity}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 hover:border-green-500"
                                >
                                    <span className="text-xl font-bold">+</span>
                                </button>
                                <div className="text-gray-500 font-medium min-w-[100px]">
                                    {getUnit()}
                                </div>
                            </div>
                            {quantity >= maxQuantity && (
                                <p className="text-center text-sm text-orange-600 mt-2">Đã đạt số lượng tối đa</p>
                            )}
                        </div>

                        {/* Add to cart button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                    {/* Right image */}
                    <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center p-4">
                        <div className="w-48 h-64 rounded-3xl bg-gray-100 flex items-center justify-center overflow-hidden">
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`flex-col items-center justify-center ${image ? 'hidden' : 'flex'}`}>
                                <MdOutlineImageNotSupported className="h-16 w-16 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-400">Không có hình ảnh</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingModal;