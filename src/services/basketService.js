import axiosPrivate from './axiosPrivate';

// Helper function to format ingredient data consistently
const formatIngredientItem = (item) => {
    // Ensure numeric quantity (fallback to 1)
    const quantity = (item.quantity === undefined || item.quantity === null) ? 1 : Number(item.quantity) || 1;

    // Determine net_unit_value: prefer explicit numeric field, else parse from unit string like "50 g"
    let netUnit = null;
    if (item.net_unit_value !== undefined && item.net_unit_value !== null && !Number.isNaN(Number(item.net_unit_value))) {
        netUnit = Number(item.net_unit_value);
    } else if (typeof item.unit === 'string') {
        const m = item.unit.match(/([0-9]+(?:[.,][0-9]+)?)/);
        if (m) netUnit = Number(m[1].replace(',', '.'));
    }

    // Default to 100g when unknown
    if (!netUnit) netUnit = 100;

    // Build unit string expected by API (e.g. "50 g"). Always present netUnit in grams.
    let unitStr = `${netUnit} g`;
    if (typeof item.unit === 'string' && /[0-9]/.test(item.unit)) {
        unitStr = item.unit;
    }

    return {
        name: item.name || item.vietnamese_name || null,
        vietnamese_name: item.vietnamese_name || item.name || null,
        imageUrl: item.imageUrl || item.image || null,
        image: item.imageUrl || item.image || null, // Keep both fields for compatibility
        net_unit_value: netUnit,
        quantity: quantity,
        unit: unitStr,
        category: item.category || null,
        // Keep id for standalone ingredients
        ...(item.id && { id: item.id })
    };
};

const formatBasketData = (basketItems) => {
    const formattedBasketItems = {
        ingredients: [],
        dishes: []
    };

    // Format standalone ingredients
    if (basketItems.ingredients && Array.isArray(basketItems.ingredients)) {
        formattedBasketItems.ingredients = basketItems.ingredients.map(formatIngredientItem);
    }

    // Format dishes and their ingredients
    if (basketItems.dishes) {
        let dishesArray = [];
        
        if (Array.isArray(basketItems.dishes)) {
            dishesArray = basketItems.dishes;
        } else {
            dishesArray = Object.values(basketItems.dishes);
        }

        formattedBasketItems.dishes = dishesArray.map(dish => ({
            id: dish.id,
            name: dish.name,
            imageUrl: dish.imageUrl || dish.image || null,
            servings: dish.servings || 1,
            ingredients: (dish.ingredients || []).map(formatIngredientItem)
        }));
    }

    return formattedBasketItems;
};

const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

let lastUpdatePromise = Promise.resolve();

export const basketService = {
    updateBasket: async (basketItems) => {
        lastUpdatePromise = lastUpdatePromise.then(async () => {
            try {
                const formattedBasketItems = formatBasketData(basketItems);
                const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
                return response.data;
            } catch (error) {
                console.error("Error updating basket:", error);
                throw error;
            }
        });

        return lastUpdatePromise;
    },

    debouncedUpdateBasket: debounce(async (basketItems) => {
        try {
            const formattedBasketItems = formatBasketData(basketItems);
            const response = await axiosPrivate.post('/basket/update', formattedBasketItems);
            return response.data;
        } catch (error) {
            console.error("Error updating basket:", error);
            throw error;
        }
    }, 800),

    calculateBasket: async () => {
        try {
            const response = await axiosPrivate.get('/calculate');
            return response.data;
        } catch (error) {
            console.error("Error calculating basket:", error);
            throw error;
        }
    },

    // New: send a payload (array) to calculate endpoint. Some backends expect a POST with the basket items as a list.
    calculateBasketWithPayload: async (payload) => {
        try {
            const response = await axiosPrivate.post('/calculate', payload);
            return response.data;
        } catch (error) {
            console.error("Error calculating basket with payload:", error);
            throw error;
        }
    },

    saveFavoriteBasket: async (basketData) => {
        try {
            const response = await axiosPrivate.post('/basket/save', basketData);
            return response.data;
        } catch (error) {
            console.error("Error saving favorite basket:", error);
            throw error;
        }
    },
    
    getSavedBaskets: async () => {
        try {
            const response = await axiosPrivate.get('/basket/savedBaskets');
            return response.data.saved_baskets;
        } catch (error) {
            console.error("Error fetching saved baskets:", error);
            throw error;
        }
    },

    removeSavedBasket: async (basketIndex) => {
        try {
            const response = await axiosPrivate.post(`/basket/remove/${basketIndex}`);
            return response.data;
        } catch (error) {
            console.error("Error removing saved basket:", error);
            throw error;
        }
    },

    getBasket: async () => {
        try {
            const response = await axiosPrivate.get('/basket');
            return response.data;
        } catch (error) {
            console.error("Error fetching basket:", error);
            throw error;
        }
    }
};

export { formatBasketData };

const formatBasketList = (basketItems) => {
    const formatted = formatBasketData(basketItems);
    // Return a single list containing both ingredients and dishes
    // This flattens the structure into an array: [ingredient1, ..., dish1, ...]
    return [
        ...(formatted.ingredients || []),
        ...(formatted.dishes || [])
    ];
};

export { formatBasketList };