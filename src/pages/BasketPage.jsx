import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineCalculator } from "react-icons/hi";
import { FiPlusCircle } from "react-icons/fi";
import BasketHeader from '../components/basket/BasketHeader';
import IngredientSection from '../components/basket/IngredientSection';
import DishSection from '../components/basket/DishSection';
import SaveBasketDialog from '../components/basket/SaveBasketDialog';
import { useBasket } from '../context/BasketContext';
import { basketService } from '../services/basketService';
import { toast } from 'react-toastify';

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
        try {
            setCalculating(true);

            if (syncStatus !== 'synced') {
                await updateBasket();
            }

            const result = await basketService.calculateBasket();
            toast.success("Đã tính toán giỏ hàng thành công!");

            navigate('/calculate', { state: { calculationResult: result } });

            setCalculating(false);
        } catch (error) {
            console.error("Error calculating basket:", error);
            toast.error("Không thể tính toán giỏ hàng. Vui lòng thử lại sau.");
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

    const renderSyncStatus = () => {
        if (syncStatus === 'pending') {
            return (
                <div className="text-yellow-600 text-xs flex items-center">
                    <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-yellow-600 rounded-full mr-1"></div>
                    Đang đồng bộ...
                </div>
            );
        } else if (syncStatus === 'error') {
            return (
                <div className="text-red-600 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Đồng bộ thất bại
                </div>
            );
        } else {
            return (
                <div className="text-green-600 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã đồng bộ
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <BasketHeader saveCart={openSaveDialog} />

                <div className="mb-2 flex justify-end">
                    {renderSyncStatus()}
                </div>

                {loading || calculating ? (
                    <div className="bg-white p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : totalItemCount() === 0 ? (
                    <div className="bg-white p-8 text-center">
                        <h2 className="text-xl font-medium mb-4">Giỏ hàng trống</h2>
                        <Link to="/ingredients-bank" className="bg-green-600 text-white px-4 py-2 rounded">
                            Thêm nguyên liệu
                        </Link>
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