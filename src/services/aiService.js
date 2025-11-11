import axiosPublic from './axiosPublic';
import axiosPrivate from './axiosPrivate';

export const aiService = {

    recipeAnalysis: async (userInput) => {
        try {
            const response = await axiosPublic.post('/ai/recipe-analysis', {
                user_input: userInput
            });
            console.log("AI Recipe Analysis Response:", response);
            return response.data;
        } catch (error) {
            console.error("Error in recipe analysis API:", error);
            throw error;
        }
    },

    uploadAndAnalyze: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axiosPublic.post('/ai/upload-and-analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error in upload and analyze API:", error);
            throw error;
        }
    }
};
