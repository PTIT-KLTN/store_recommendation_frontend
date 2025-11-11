import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import BasketHeader from '../components/basket/BasketHeader';
import IngredientSection from '../components/basket/IngredientSection';
import DishSection from '../components/basket/DishSection';
import SaveBasketDialog from '../components/basket/SaveBasketDialog';
import { useBasket } from '../context/BasketContext';
import { basketService, formatBasketData } from '../services/basketService';
import { toast } from 'react-toastify';
import { FiPlusCircle } from "react-icons/fi";
import { HiOutlineCalculator } from "react-icons/hi";
import { IoFastFoodOutline } from "react-icons/io5";

const BasketPage = () => {
    const navigate = useNavigate();

    const {
        basketItems,
        loading,
        updateBasket,
        syncStatus,
        removeIngredient,
        removeDish,
        getTotalItemCount
    } = useBasket();

    const [expandedSections, setExpandedSections] = useState({
        ingredients: true,
        dishes: {},
        foodSection: true
    });

    const [calculating, setCalculating] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [savingBasket, setSavingBasket] = useState(false);

    useEffect(() => {
        if (!loading && basketItems.dishes) {
            const initialExpandedState = {};
            Object.keys(basketItems.dishes).forEach(dishId => {
                initialExpandedState[dishId] = true;
            });

            setExpandedSections(prev => ({
                ...prev,
                dishes: initialExpandedState
            }));
        }
    }, [loading, basketItems.dishes]);

    const toggleSection = (section, id = null) => {
        if (section === 'ingredients') {
            setExpandedSections(prev => ({ ...prev, ingredients: !prev.ingredients }));
        } else if (section === 'foodSection') {
            setExpandedSections(prev => ({ ...prev, foodSection: !prev.foodSection }));
        } else if (section === 'dish' && id !== null) {
            setExpandedSections(prev => ({ ...prev, dishes: { ...prev.dishes, [id]: !prev.dishes[id] } }));
        }
    };

    // Fixed update quantity function
    const handleUpdateQuantity = async (id, newQuantity, isDishIngredient = false, dishId = null) => {
        try {
            if (newQuantity <= 0) {
                // If quantity is 0 or less, remove the item
                await handleRemoveItem(id, isDishIngredient, dishId);
                return;
            }

            let updatedBasketItems = { ...basketItems };

            if (isDishIngredient && dishId) {
                // Update ingredient in specific dish
                if (updatedBasketItems.dishes[dishId]) {
                    const updatedIngredients = updatedBasketItems.dishes[dishId].ingredients.map(item => {
                        if (item.name === id) { // Use 'name' as identifier for dish ingredients
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    });

                    updatedBasketItems.dishes[dishId] = {
                        ...updatedBasketItems.dishes[dishId],
                        ingredients: updatedIngredients
                    };
                }
            } else {
                // Update standalone ingredient
                updatedBasketItems.ingredients = updatedBasketItems.ingredients.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
            }

            await updateBasket(updatedBasketItems);
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
        }
    };

    // Fixed remove item function
    const handleRemoveItem = async (id, isDishIngredient = false, dishId = null) => {
        try {
            let updatedBasketItems = { ...basketItems };

            if (isDishIngredient && dishId) {
                // Remove specific ingredient from dish
                if (updatedBasketItems.dishes[dishId]) {
                    const updatedIngredients = updatedBasketItems.dishes[dishId].ingredients.filter(
                        item => item.name !== id // Use 'name' as identifier for dish ingredients
                    );

                    // If dish has no ingredients left, remove the entire dish
                    if (updatedIngredients.length === 0) {
                        delete updatedBasketItems.dishes[dishId];

                        setExpandedSections(prev => {
                            const updatedExpanded = { ...prev.dishes };
                            delete updatedExpanded[dishId];
                            return {
                                ...prev,
                                dishes: updatedExpanded
                            };
                        });
                    } else {
                        // Update dish with remaining ingredients
                        updatedBasketItems.dishes[dishId] = {
                            ...updatedBasketItems.dishes[dishId],
                            ingredients: updatedIngredients
                        };
                    }
                }
            } else if (dishId) {
                // Remove entire dish
                delete updatedBasketItems.dishes[dishId];

                setExpandedSections(prev => {
                    const updatedExpanded = { ...prev.dishes };
                    delete updatedExpanded[dishId];
                    return {
                        ...prev,
                        dishes: updatedExpanded
                    };
                });
            } else {
                // Remove standalone ingredient
                updatedBasketItems.ingredients = updatedBasketItems.ingredients.filter(
                    item => item.id !== id
                );
            }

            await updateBasket(updatedBasketItems);
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Không thể xóa mục. Vui lòng thử lại sau.");
        }
    };

    const handleUpdateDishServings = async (dishId, newServings) => {
        try {
            let updatedBasketItems = { ...basketItems };

            if (newServings <= 0) {
                // Remove entire dish if servings is 0
                delete updatedBasketItems.dishes[dishId];

                setExpandedSections(prev => {
                    const updatedExpanded = { ...prev.dishes };
                    delete updatedExpanded[dishId];
                    return {
                        ...prev,
                        dishes: updatedExpanded
                    };
                });
            } else {
                // Update dish servings
                updatedBasketItems.dishes[dishId] = {
                    ...updatedBasketItems.dishes[dishId],
                    servings: newServings
                };
            }

            await updateBasket(updatedBasketItems);
        } catch (error) {
            console.error("Error updating dish servings:", error);
            toast.error("Không thể cập nhật số phần ăn. Vui lòng thử lại sau.");
        }
    };

    const openSaveDialog = () => {
        setShowSaveDialog(true);
    };

    const closeSaveDialog = () => {
        setShowSaveDialog(false);
    };

    const handleSaveFavoriteBasket = async (basketName) => {
        try {
            setSavingBasket(true);

            if (syncStatus !== 'synced') {
                await updateBasket();
            }

            const result = await basketService.saveFavoriteBasket({
                ...basketItems,
                basket_name: basketName
            });

            if (result) {
                toast.success(`Đã lưu giỏ hàng "${basketName}" thành công!`);
                closeSaveDialog();
            } else {
                toast.error("Không thể lưu giỏ hàng yêu thích. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error saving favorite basket:", error);
            toast.error("Không thể lưu giỏ hàng yêu thích. Vui lòng thử lại sau.");
        } finally {
            setSavingBasket(false);
        }
    };

    const handleCalculateCart = async () => {
        // check user location & basket before calling api 
        try {
            setCalculating(true);

            if (syncStatus !== 'synced') {
                await updateBasket();
            }
            
            // DEBUG: log formatted payload that would be sent to the backend
            try {
                const debugPayload = formatBasketData(basketItems || { ingredients: [], dishes: [] });
                console.log('DEBUG calculate payload (formatBasketData):', JSON.stringify(debugPayload, null, 2));
                localStorage.setItem('debug_calculate_payload', JSON.stringify(debugPayload, null, 2));
                
                // Send the formatted payload to the calculate endpoint
                const result = await basketService.calculateBasketWithPayload(debugPayload);
                console.log('DEBUG calculate response:', result);
                toast.success("Đã tính toán giỏ hàng thành công!");

                navigate('/calculate', { state: { calculationResult: result } });
            } catch (e) {
                console.error('Error preparing debug payload:', e);
                // Fallback to original method if formatting fails
                const result = await basketService.calculateBasket();
                console.log('DEBUG calculate response (fallback):', result);
                toast.success("Đã tính toán giỏ hàng thành công!");

                navigate('/calculate', { state: { calculationResult: result } });
            }

            setCalculating(false);
        } catch (error) {
            console.error("Error calculating basket:", error);
            toast.error(error.data?.message || "Có lỗi xảy ra khi tính toán");
            setCalculating(false);
        }
    };

    const totalItemCount = () => {
        if (!basketItems) return 0;

        const ingredientCount = basketItems.ingredients?.length || 0;
        let dishIngredientsCount = 0;

        if (basketItems.dishes) {
            Object.values(basketItems.dishes).forEach(dish => {
                dishIngredientsCount += dish.ingredients?.length || 0;
            });
        }

        return ingredientCount + dishIngredientsCount;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <BasketHeader saveCart={openSaveDialog} />

                {loading || calculating ? (
                    <div className="bg-white p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : totalItemCount() === 0 ? (
                    // Empty State
                    <div className="bg-white shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
                                <IoFastFoodOutline className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Giỏ hàng của bạn đang trống</h3>
                            <p className="text-gray-600 mb-6">
                                Khám phá và thêm những nguyên liệu mới từ trang web của chúng tôi
                            </p>
                            <button
                                onClick={() => window.location.href = '/ingredients-bank'}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Khám phá các nguyên liệu hiện có
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 border-t-0">
                        {/* Ingredients Section */}
                        {basketItems.ingredients && basketItems.ingredients.length > 0 && (
                            <IngredientSection
                                ingredients={basketItems.ingredients}
                                expanded={expandedSections.ingredients}
                                toggleSection={() => toggleSection('ingredients')}
                                updateQuantity={handleUpdateQuantity}
                                removeItem={handleRemoveItem}
                            />
                        )}

                        {/* Dishes Section */}
                        {basketItems.dishes && Object.keys(basketItems.dishes).length > 0 && (
                            <DishSection
                                dishes={basketItems.dishes}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                updateQuantity={handleUpdateQuantity}
                                removeItem={handleRemoveItem}
                                updateDishServings={handleUpdateDishServings}
                            />
                        )}

                        {/* Checkout Button Section */}
                        <div className="p-4 flex justify-between items-center gap-4 border-t border-gray-200 mt-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Link
                                    to="/dishes-bank"
                                    className="bg-orange-500 text-white px-6 py-2 flex items-center justify-center rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    <FiPlusCircle className="h-5 w-5 mr-2" /> Thêm món ăn
                                </Link>

                                <Link
                                    to="/ingredients-bank"
                                    className="bg-blue-500 text-white px-6 py-2 flex items-center justify-center rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <FiPlusCircle className="h-5 w-5 mr-2" /> Thêm nguyên liệu
                                </Link>
                            </div>

                            <div>
                                <button
                                    onClick={handleCalculateCart}
                                    className="bg-green-600 text-white px-8 py-3 font-bold flex items-center justify-center rounded-md hover:bg-green-700 transition-colors shadow-lg transform hover:scale-105 border-2 border-green-400"
                                    disabled={calculating}
                                >
                                    <HiOutlineCalculator className="h-6 w-6 mr-2" />
                                    {calculating ? "Đang tính toán..." : "Bắt đầu tính toán"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SaveBasketDialog
                isOpen={showSaveDialog}
                onClose={closeSaveDialog}
                onSave={handleSaveFavoriteBasket}
                loading={savingBasket}
            />

            <Footer />
        </div>
    );
};

export default BasketPage;