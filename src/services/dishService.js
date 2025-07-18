import axiosPublic from './axiosPublic';

export const dishService = {
    getDishes: async (page = 0, pageSize = 30, pattern = '', filters = {}) => {
        try {
            const params = new URLSearchParams({
                pageNo: page.toString(),
                pageSize: pageSize.toString(),
            });

            // Thêm pattern search nếu có
            if (pattern && pattern.trim()) {
                params.append('pattern', pattern.trim());
            }

            // Thêm các filter khác
            if (filters.dish) {
                params.append('dish', filters.dish);
            }
            if (filters.vietnamese_name) {
                params.append('vietnamese_name', filters.vietnamese_name);
            }
            if (filters.category) {
                params.append('category', filters.category);
            }

            const response = await axiosPublic.get(`/public/dishes?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dishes:', error);
            throw error;
        }
    },

    // Lấy danh sách categories
    getDishCategories: async () => {
        try {
            const response = await axiosPublic.get('/public/dishes/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching dish categories:', error);
            throw error;
        }
    },

    // Lấy gợi ý tìm kiếm
    getDishSuggestions: async (query, limit = 10) => {
        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit.toString()
            });

            const response = await axiosPublic.get(`/public/dishes/suggestions?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dish suggestions:', error);
            throw error;
        }
    }
};