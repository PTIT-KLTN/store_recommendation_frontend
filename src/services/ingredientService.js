import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const ingredientService = {
    async getIngredients(page = 0, pageSize = 30, filters = {}) {
        try {
            const params = new URLSearchParams({
                pageNo: page.toString(),
                pageSize: pageSize.toString()
            });

            // Add filter parameters if they exist
            if (filters.pattern) params.append('pattern', filters.pattern);
            if (filters.name) params.append('name', filters.name);
            if (filters.name_en) params.append('name_en', filters.name_en);
            if (filters.vietnamese_name) params.append('vietnamese_name', filters.vietnamese_name);
            if (filters.category) params.append('category', filters.category);
            if (filters.unit) params.append('unit', filters.unit);

            const response = await axiosPublic.get(`/public/ingredients?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            throw error;
        }
    },

    // Get ingredient by ID
    async getIngredientById(id) {
        try {
            const response = await axiosPublic.get(`/public/ingredients/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ingredient by ID:', error);
            throw error;
        }
    },

    // Get ingredient categories
    async getCategories() {
        try {
            const response = await axiosPublic.get('/public/ingredients/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Get ingredient suggestions for search
    async getSuggestions(query, limit = 10, type = 'all') {
        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit.toString(),
                type: type
            });

            const response = await axiosPublic.get(`/public/ingredients/suggestions?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            throw error;
        }
    },
};

export default ingredientService;