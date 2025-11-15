import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { MdOutlineImageNotSupported } from "react-icons/md";
import { toast } from 'react-toastify';
import { useBasket } from '../context/BasketContext';
import { AIWarnings, AISuggestions, AISimilarDishes } from './AIComponents';

const S3_BASE_URL = 'https://recipe-images-bucket-v1.s3.us-east-1.amazonaws.com';

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

                // Convert AI result to dish format - FIXED STRUCTURE
                if (itemData.cart && itemData.cart.items) {
                    // s3_key is at result level, not in dish
                    const dishImageUrl = itemData.s3_key ? `${S3_BASE_URL}/${itemData.s3_key}` : null;
                    console.log('Result s3_key:', itemData.s3_key);
                    console.log('Dish image URL:', dishImageUrl);
                    
                    const aiDish = {
                        id: 'ai_' + Date.now(),
                        name: itemData.dish.name,
                        vietnamese_name: itemData.dish.vietnamese_name || itemData.dish.name,
                        image: dishImageUrl,
                        servings: itemData.dish?.servings || 1,
                        ingredients: itemData.cart.items.map(item => ({
                            _id: item.ingredient_id,
                            ingredient_name: item.name,
                            vietnamese_name: item.vietnamese_name,
                            image: null, // Ingredients don't have s3_key
                            quantity: item.quantity,
                            unit: item.unit,
                            category: item.category
                        })),
                        // Store AI-specific data
                        aiData: {
                            suggestions: itemData.suggestions || [],
                            warnings: itemData.warnings || [],
                            similar_dishes: itemData.similar_dishes || [],
                            insights: itemData.insights || []
                        }
                    };
                    setDishWithIngredients(aiDish);

                    // Auto-select all main ingredients
                    const initialSelected = {};
                    aiDish.ingredients.forEach(ing => {
                        const key = ing._id; // Use _id as consistent key
                        initialSelected[key] = true;
                    });
                    setSelectedIngredients(initialSelected);

                    // Initialize suggestions selection state (default to false)
                    const initialSuggestions = {};
                    if (itemData.suggestions) {
                        itemData.suggestions.forEach(sug => {
                            const key = sug.ingredient_id;
                            initialSuggestions[key] = false;
                        });
                    }
                    setSelectedSuggestions(initialSuggestions);
                }
            } else if (type === 'dish' && itemData) {
                if (itemData.ingredients && itemData.ingredients.length > 0) {
                    setDishWithIngredients(itemData);
                } else {
                    setDishWithIngredients(itemData);
                }

                // FIX 1: Auto-select ALL main ingredients (set to true)
                const initialSelected = {};
                if (itemData.ingredients) {
                    itemData.ingredients.forEach(ing => {
                        // Use ingredient_name as key since there's no id field
                        const key = ing.ingredient_name;
                        initialSelected[key] = true;
                    });
                }
                setSelectedIngredients(initialSelected);

                // FIX 2: Auto-select ALL optional ingredients (set to true instead of false)
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
                const selectedMainIngredients = (dishWithIngredients.ingredients || [])
                    .filter(ing => {
                        // For AI results use _id, for regular dishes use ingredient_name
                        const key = isAiResult ? ing._id : ing.ingredient_name;
                        return selectedIngredients[key];
                    })
                    .map(ingredient => ({
                        id: ingredient.id || ingredient.ingredient_id,
                        name: ingredient.ingredient_name || ingredient.name,
                        vietnamese_name: ingredient.vietnamese_name,
                        imageUrl: ingredient.image,
                        net_unit_value: ingredient.net_unit_value || 100,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        category: ingredient.category
                    }));

                const selectedOptIngredients = (dishWithIngredients.optionalIngredients || [])
                    .filter(ing => {
                        const key = ing._id || ing.ingredient_name;
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

                // Handle AI suggestions if present
                const selectedSuggestionsArray = [];
                if (isAiResult && dishWithIngredients.aiData?.suggestions) {
                    dishWithIngredients.aiData.suggestions.forEach(sug => {
                        const key = sug.ingredient_id;
                        if (selectedSuggestions[key]) {
                            selectedSuggestionsArray.push({
                                id: sug.ingredient_id,
                                name: sug.name,
                                vietnamese_name: sug.vietnamese_name,
                                imageUrl: null,
                                net_unit_value: sug.net_unit_value || 100,
                                quantity: sug.quantity || '100',
                                unit: sug.unit || 'g',
                                category: sug.category
                            });
                        }
                    });
                }

                const allSelectedIngredients = [...selectedMainIngredients, ...selectedOptIngredients, ...selectedSuggestionsArray];

                const dish = {
                    id: dishWithIngredients.id,
                    name: dishWithIngredients.name,
                    vietnamese_name: dishWithIngredients.vietnamese_name,
                    imageUrl: dishWithIngredients.image,
                    servings: quantity,
                    ingredients: allSelectedIngredients
                };

                await addDish(dish);
                toast.success(`Đã thêm ${dish.vietnamese_name || dish.name} (${quantity} phần) vào giỏ hàng!`);
            } else if ((type === 'ingredients' || type === 'search') && itemData) {
                const ingredientsArray = itemData;
                console.log (ingredientsArray)
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
            }

            window.dispatchEvent(new CustomEvent('basketUpdated'));

            onClose();
        } catch (error) {
            console.error("Error adding items to basket:", error);
            toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    const getUnit = () => {
        if (type === 'dish') {
            return 'phần';
        } else if ((type === 'ingredients' || type === 'search') && itemData) {
            if (Array.isArray(itemData) && itemData.length > 0) {
                return itemData[0].unit || 'g';
            }
            return Array.isArray(itemData) ? (itemData[0]?.unit || 'g') : (itemData?.unit || 'g');
        }
        return 'g';
    };

    let title = '';
    let image = '';
    let ingredients = [];
    let optionalIngredients = [];
    let showMultipleIngredients = false;

    if ((type === 'dish' || isAiResult) && dishWithIngredients) {
        title = dishWithIngredients.vietnamese_name || dishWithIngredients.name;
        image = dishWithIngredients.imageUrl || dishWithIngredients.image;
        ingredients = (dishWithIngredients.ingredients || []).map(ing => ({
            // For AI results: use _id, for regular dishes: use ingredient_name
            id: isAiResult ? ing._id : ing.ingredient_name,
            vietnamese_name: ing.vietnamese_name,
            name: ing.ingredient_name || ing.name,
            category: ing.category,
            quantity: typeof ing.quantity === 'string' ? ing.quantity : ing.unit,
            unit: ing.unit
        }));

        optionalIngredients = (dishWithIngredients.optionalIngredients || []).map(ing => ({
            id: ing._id || ing.ingredient_name,
            name: ing.vietnamese_name,
            category: ing.category,
            quantity: ing.quantity,
            unit: ing.unit
        }));
    } else if (type === 'ingredients') {
        if (itemData.length > 1) {
            title = "Danh sách nguyên liệu";
            showMultipleIngredients = true;
            image = itemData[0]?.image;
        } else {
            const ingredient = Array.isArray(itemData) ? itemData[0] : itemData;
            title = ingredient?.vietnamese_name || ingredient?.name || 'Nguyên liệu';
            image = ingredient?.imageUrl || ingredient?.image || '';
        }
    } else if (type === 'search') {
        title = `Kết quả cho "${searchQuery}"`;
        showMultipleIngredients = Array.isArray(itemData) && itemData.length > 0;
        image = Array.isArray(itemData) && itemData.length > 0
            ? (itemData[0].imageUrl || itemData[0].image)
            : '';
    }

    const maxQuantity = getQuantityLimit();

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FiX size={24} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left content */}
                    <div className="p-6 flex-1">
                        <h2 className="text-2xl font-bold mb-6">
                            {title}
                        </h2>

                        {/* Dish ingredients list */}
                        {(type === 'dish' || isAiResult) && ingredients.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu chính</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <ul className="divide-y divide-gray-200">
                                        {ingredients.map((ing, index) => (
                                            <li key={index} className="flex py-2">
                                                <div className="flex items-center mr-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`ing-${ing.id}`}
                                                        checked={selectedIngredients[ing.id]}
                                                        onChange={() => toggleIngredient(ing.id)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex flex-1 items-center justify-between">
                                                    <label htmlFor={`ing-${ing.id}`} className="font-medium cursor-pointer flex-1">
                                                        {ing.vietnamese_name}
                                                    </label>
                                                    {ing.quantity && (
                                                        <span className="text-gray-700 font-medium ml-2">
                                                            {ing.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
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
                            </>
                        )}

                        {/* Optional ingredients list */}
                        {type === 'dish' && optionalIngredients.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu tùy chọn</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <ul className="divide-y divide-gray-200">
                                        {optionalIngredients.map((ing, index) => (
                                            <li key={index} className="flex items-start py-2">
                                                <div className="flex items-center mr-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`opt-ing-${ing.id}`}
                                                        checked={selectedOptionalIngredients[ing.id]} 
                                                        onChange={() => toggleIngredient(ing.id, true)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex flex-1 items-center justify-between">
                                                    <label htmlFor={`opt-ing-${ing.id}`} className="font-medium cursor-pointer flex-1">
                                                        {ing.name}
                                                    </label>
                                                    {ing.quantity && ing.unit &&
                                                        <span className="text-gray-700 font-medium">
                                                            {ing.quantity} <span className="text-gray-500">{ing.unit}</span>
                                                        </span>
                                                    }
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Multiple ingredients display */}
                        {showMultipleIngredients && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Nguyên liệu được nhận diện</h3>
                                <ul className="space-y-2">
                                    {Array.isArray(itemData) && itemData.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <div className="flex">
                                                {(item.image || item.imageUrl) && (
                                                    <div className="w-8 h-8 flex-shrink-0 mr-2">
                                                        <img
                                                            src={item.imageUrl || item.image}
                                                            alt={item.vietnamese_name || item.name}
                                                            className="w-full h-full object-contain rounded-full"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/images/default-ingredient.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <span className="font-medium">{item.vietnamese_name || item.name}</span>
                                            </div>
                                            {item.quantity && item.unit &&
                                                <span className="text-gray-700 font-medium">
                                                    {item.quantity} <span className="text-gray-500">{item.unit}</span>
                                                </span>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* AI Components */}
                        {isAiResult && dishWithIngredients?.aiData && (
                            <>
                                <AIWarnings warnings={dishWithIngredients.aiData.warnings} />
                            </>
                        )}

                        {/* Quantity input with controls */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xl font-bold">
                                    Nhập số lượng mong muốn:
                                </label>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* Decrease button */}
                                <button
                                    type="button"
                                    onClick={handleQuantityDecrease}
                                    disabled={quantity <= 1}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 hover:text-green-600 transition-colors"
                                >
                                    <span className="text-xl font-bold">−</span>
                                </button>
                                
                                {/* Quantity input */}
                                <input
                                    type="number" 
                                    min="1" 
                                    max={maxQuantity}
                                    step="1" 
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full text-center text-xl font-bold focus:border-green-500 focus:outline-none"
                                />
                                
                                {/* Increase button */}
                                <button
                                    type="button"
                                    onClick={handleQuantityIncrease}
                                    disabled={quantity >= maxQuantity}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 hover:text-green-600 transition-colors"
                                >
                                    <span className="text-xl font-bold">+</span>
                                </button>
                                
                                {/* Unit display */}
                                <div className="ml-2 text-gray-500 font-medium min-w-[60px]">
                                    {getUnit()}
                                </div>
                            </div>
                            
                            {/* Quantity warning */}
                            {quantity >= maxQuantity && (
                                <div className="mt-2 text-center text-sm text-orange-600">
                                    Đã đạt số lượng tối đa
                                </div>
                            )}
                        </div>

                        {/* Add to cart button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                    {/* Right image section */}
                    <div className="flex-shrink-0 w-full md:w-64 flex justify-center p-4 pt-20">
                        <div className="w-48 h-64 overflow-hidden rounded-3xl bg-gray-100 flex justify-center">
                            {image ? (
                                <>
                                    <img
                                        src={image}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="w-full h-full flex-col items-center justify-center hidden">
                                        <MdOutlineImageNotSupported className="h-16 w-16 mb-2 text-gray-400" />
                                        <span className="text-sm text-gray-400">Không có hình ảnh</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center justify-center">
                                    <MdOutlineImageNotSupported className="h-16 w-16 mb-2" />
                                    <span className="text-sm">Không có hình ảnh</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingModal;