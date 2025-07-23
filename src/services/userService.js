import axiosPrivate from './axiosPrivate';

export const userService = {
    getUserInfo: async () => {
        try {
            const response = await axiosPrivate.get('/user');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUserLocation: async (locationData) => {
        try {
            const response = await axiosPrivate.post('/user/location', locationData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Favourite Stores APIs
    getFavouriteStores: async () => {
        try {
            const response = await axiosPrivate.get('/user/favourite-stores');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addFavouriteStore: async (storeData) => {
        try {
            const response = await axiosPrivate.post('/user/favourite-stores', storeData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    removeFavouriteStore: async (storeId) => {
        try {
            const response = await axiosPrivate.delete(`/user/favourite-stores/${storeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    saveUserToLocalStorage: (userData) => {
        if (userData) {
            const userToSave = {
                ...userData,
                password: undefined
            };

            localStorage.setItem('user', JSON.stringify(userToSave));
            return true;
        }
        return false;
    },

    getUserFromLocalStorage: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    clearUserFromLocalStorage: () => {
        localStorage.removeItem('user');
    }
};

export default userService;