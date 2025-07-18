import React, { createContext, useContext, useState, useEffect } from 'react';
import { basketService } from '../services/basketService';

const BasketContext = createContext();

export const useBasket = () => useContext(BasketContext);

export const BasketProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState('synced');
    const [syncQueue, setSyncQueue] = useState([]);

    useEffect(() => {
        const storedBasket = localStorage.getItem('basketItems');
        if (storedBasket) {
            try {
                const parsedBasket = JSON.parse(storedBasket);

                const processedBasket = {
                    ingredients: (parsedBasket.ingredients || []).map(item => ({
                        ...item,
                        quantity: parseFloat(item.quantity) || 1
                    })),
                    dishes: { ...(parsedBasket.dishes || {}) }
                };

                Object.keys(processedBasket.dishes).forEach(dishId => {
                    const dish = processedBasket.dishes[dishId];

                    dish.servings = parseInt(dish.servings, 10) || 1;

                    if (dish.ingredients) {
                        dish.ingredients = dish.ingredients.map(ingredient => ({
                            ...ingredient,
                            quantity: parseFloat(ingredient.quantity) || 1
                        }));
                    }
                });

                setBasketItems(processedBasket);
            } catch (error) {
                console.error("Error parsing basket from localStorage:", error);
                setBasketItems({
                    ingredients: [],
                    dishes: {}
                });
            }
        }
    }, []);

    useEffect(() => {
        if (basketItems.ingredients.length > 0 || Object.keys(basketItems.dishes).length > 0) {
            localStorage.setItem('basketItems', JSON.stringify(basketItems));
        }
    }, [basketItems]);

    useEffect(() => {
        const processSyncQueue = async () => {
            if (syncQueue.length > 0 && syncStatus !== 'pending') {
                setSyncStatus('pending');

                try {
                    await basketService.updateBasket(basketItems);
                    setSyncStatus('synced');
                    setSyncQueue([]);
                } catch (error) {
                    console.error("Failed to sync basket with server:", error);
                    setSyncStatus('error');
                }
            }
        };

        processSyncQueue();
    }, [syncQueue, syncStatus, basketItems]);

    const queueSync = () => {
        setSyncQueue(prev => [...prev, Date.now()]);
    };

    const addIngredient = async (ingredientData) => {
        try {
            setLoading(true);

            const processedIngredientData = {
                ...ingredientData,
                quantity: parseFloat(ingredientData.quantity) || 0.1
            };

            const existingIndex = basketItems.ingredients.findIndex(
                item => item.id === processedIngredientData.id
            );

            let updatedBasketItems;

            if (existingIndex >= 0) {
                const updatedIngredients = [...basketItems.ingredients];
                const existingQuantity = parseFloat(updatedIngredients[existingIndex].quantity) || 0;
                updatedIngredients[existingIndex] = {
                    ...processedIngredientData,
                    quantity: existingQuantity + processedIngredientData.quantity
                };

                updatedBasketItems = {
                    ...basketItems,
                    ingredients: updatedIngredients
                };
            } else {
                updatedBasketItems = {
                    ...basketItems,
                    ingredients: [...basketItems.ingredients, processedIngredientData]
                };
            }

            setBasketItems(updatedBasketItems);

            queueSync();

            setLoading(false);
            return processedIngredientData;
        } catch (error) {
            console.error("Error adding ingredient to basket:", error);
            setLoading(false);
            return {};
        }
    };

    const addDish = async (dishData) => {
        try {
            setLoading(true);

            const processedDishData = {
                ...dishData,
                servings: Math.max(1, parseInt(dishData.servings, 10) || 1),
                ingredients: dishData.ingredients ? dishData.ingredients.map(ingredient => ({
                    ...ingredient,
                    quantity: parseFloat(ingredient.quantity) || 1
                })) : []
            };

            const dishExists = basketItems.dishes[processedDishData.name];

            let updatedBasketItems;

            if (dishExists) {
                updatedBasketItems = {
                    ...basketItems,
                    dishes: {
                        ...basketItems.dishes,
                        [processedDishData.name]: {
                            ...processedDishData,
                            servings: (parseInt(dishExists.servings, 10) || 1) + processedDishData.servings
                        }
                    }
                };
            } else {
                updatedBasketItems = {
                    ...basketItems,
                    dishes: {
                        ...basketItems.dishes,
                        [processedDishData.name]: processedDishData
                    }
                };
            }

            setBasketItems(updatedBasketItems);

            queueSync();

            setLoading(false);
            return processedDishData;
        } catch (error) {
            console.error("Error adding dish to basket:", error);
            setLoading(false);
            return {};
        }
    };

    const removeIngredient = async (ingredientId) => {
        try {
            setLoading(true);

            const updatedBasketItems = {
                ...basketItems,
                ingredients: basketItems.ingredients.filter(item => item.id !== ingredientId)
            };

            setBasketItems(updatedBasketItems);

            queueSync();

            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error removing ingredient from basket:", error);
            setLoading(false);
            return false;
        }
    };

    const removeDish = async (dishId) => {
        try {
            setLoading(true);

            const updatedDishes = { ...basketItems.dishes };
            delete updatedDishes[dishId];

            const updatedBasketItems = {
                ...basketItems,
                dishes: updatedDishes
            };

            setBasketItems(updatedBasketItems);

            queueSync();

            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error removing dish from basket:", error);
            setLoading(false);
            return false;
        }
    };

    const updateBasket = async (newBasketItems = null) => {
        try {
            setLoading(true);

            if (newBasketItems) {
                setBasketItems(newBasketItems);
                localStorage.setItem('basketItems', JSON.stringify(newBasketItems));

                queueSync();

                setLoading(false);
                return true;
            }

            setSyncStatus('pending');
            const result = await basketService.updateBasket(basketItems);
            setSyncStatus('synced');
            setSyncQueue([]);

            setLoading(false);
            return result;
        } catch (error) {
            console.error("Error updating basket:", error);
            setSyncStatus('error');
            setLoading(false);
            return false;
        }
    };

    const clearBasket = async () => {
        try {
            setLoading(true);

            const emptyBasket = {
                ingredients: [],
                dishes: {}
            };

            setBasketItems(emptyBasket);

            localStorage.removeItem('basketItems');

            const result = await basketService.updateBasket(emptyBasket);
            setSyncStatus('synced');
            setSyncQueue([]);

            setLoading(false);
            return result;
        } catch (error) {
            console.error("Error clearing basket:", error);
            setSyncStatus('error');
            setLoading(false);
            return false;
        }
    };

    const getTotalItemCount = () => {
        const ingredientCount = basketItems.ingredients.length;
        const dishCount = Object.keys(basketItems.dishes).length;
        return ingredientCount + dishCount;
    };

    return (
        <BasketContext.Provider
            value={{
                basketItems,
                loading,
                addIngredient,
                addDish,
                removeIngredient,
                removeDish,
                updateBasket,
                clearBasket,
                getTotalItemCount,
                syncStatus
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};

export default BasketContext;