import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const aiService = {
    getDishSuggestionByText: async (textInput) => {
        try {
            const response = await axiosPrivate.post('/ai/text', { description: textInput });
            return response.data;
        } catch (error) {
            console.error("Error in dish suggestion by text API:", error);
            throw error;
        }
    },
    getDishSuggestionByImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axiosPrivate.post('ai/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error in dish suggestion API:", error);
            throw error;
        }
    }
};
