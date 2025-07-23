// services/storeService.js
import axiosPrivate from './axiosPrivate';

export const storeService = {
    // Get all stores with pagination and filters
    // Endpoint: GET /stores
    getAllStores: async (params = {}) => {
        try {
            const {
                pageNo = 0,
                pageSize = 20,
                pattern = '',
                store_name = '',
                chain = '',
                store_location = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageNo', pageNo);
            queryParams.append('pageSize', pageSize);
            
            if (pattern) queryParams.append('pattern', pattern);
            if (store_name) queryParams.append('store_name', store_name);
            if (chain) {
                // Handle chain parameter properly - don't double encode
                queryParams.append('chain', chain);
            }
            if (store_location) queryParams.append('store_location', store_location);

            const response = await axiosPrivate.get(`/stores?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get store by ID
    // Endpoint: GET /stores/{store_id}
    getStoreById: async (storeId) => {
        try {
            const response = await axiosPrivate.get(`/stores/${storeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get store suggestions
    // Endpoint: GET /stores/suggestions
    getStoreSuggestions: async (params = {}) => {
        try {
            const { query, limit = 10, type = 'all' } = params;

            if (!query || query.trim().length < 1) {
                throw new Error('Vui lòng nhập ít nhất 1 ký tự để tìm kiếm');
            }

            const queryParams = new URLSearchParams();
            queryParams.append('q', query.trim());
            queryParams.append('limit', limit);
            queryParams.append('type', type);

            const response = await axiosPrivate.get(`/stores/suggestions?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get nearby stores from user collection (requires JWT token)
    // Endpoint: GET /stores/near
    getNearbyStores: async (params = {}) => {
        try {
            const {
                refresh = false,
                radius_km = 10,
                limit = 20
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('refresh', refresh);
            queryParams.append('radius_km', radius_km);
            queryParams.append('limit', limit);

            const response = await axiosPrivate.get(`/stores/near?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Helper method to get store chains (derived from getAllStores)
    getStoreChains: async () => {
        try {
            // Get first page with large size to get chain data
            const response = await axiosPrivate.get('/stores?pageNo=0&pageSize=1000');
            const stores = response.data.stores || [];
            
            // Extract unique chains with count
            const chainMap = new Map();
            stores.forEach(store => {
                const chain = store.chain;
                if (chain) {
                    chainMap.set(chain, (chainMap.get(chain) || 0) + 1);
                }
            });
            
            const chains = Array.from(chainMap.entries()).map(([chain, count]) => ({
                chain,
                store_count: count
            }));
            
            chains.sort((a, b) => b.store_count - a.store_count);
            
            return { chains };
        } catch (error) {
            throw error;
        }
    },

    // Legacy method name for backward compatibility
    searchStores: async (params = {}) => {
        try {
            const { query, limit = 20 } = params;
            return await storeService.getStoreSuggestions({ query, limit });
        } catch (error) {
            throw error;
        }
    }
};

export default storeService;