import axiosPrivate from './axiosPrivate';

const formatBasketData = (basketItems) => {
    const formattedBasketItems = {
        ingredients: [...(basketItems.ingredients)],
        dishes: []
    };

    if (basketItems.dishes) {
        if (Array.isArray(basketItems.dishes)) {
            formattedBasketItems.dishes = basketItems.dishes;
        } else {
            formattedBasketItems.dishes = Object.values(basketItems.dishes);
        }
    }

    formattedBasketItems.ingredients = formattedBasketItems.ingredients.map(item => ({
        id: item.id,
        vietnamese_name: item.vietnamese_name,
        name: item.name,
        unit: item.unit,
        imageUrl: item.image,
        category: item.category,
        quantity: parseFloat(item.quantity) || 1
    }));

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
            console.log('basket:', response)
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