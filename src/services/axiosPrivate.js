import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Track ongoing refresh request to prevent race conditions
let refreshPromise = null;

const axiosPrivate = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

// Helper function to dispatch auth events
const dispatchAuthEvent = (type, data = null) => {
    window.dispatchEvent(new CustomEvent('authEvent', {
        detail: { type, data }
    }));
};

// Helper function to clear auth data
const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

// Request interceptor
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosPrivate.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            
            // No refresh token - trigger logout
            if (!refreshToken) {
                clearAuthData();
                dispatchAuthEvent('LOGOUT', { reason: 'unauthorized' });
                return Promise.reject(error);
            }

            try {
                // Prevent multiple refresh requests
                if (!refreshPromise) {
                    refreshPromise = axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                }

                const response = await refreshPromise;
                refreshPromise = null; // Reset after successful refresh

                if (response.data.access_token) {
                    // Update tokens
                    localStorage.setItem('accessToken', response.data.access_token);
                    if (response.data.refresh_token) {
                        localStorage.setItem('refreshToken', response.data.refresh_token);
                    }
                    
                    // Update original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                    
                    // Retry original request
                    return axiosPrivate(originalRequest);
                } else {
                    throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                refreshPromise = null; // Reset on error
                console.error('Token refresh failed:', refreshError);
                
                clearAuthData();
                dispatchAuthEvent('LOGOUT', { reason: 'token_expired' });
                return Promise.reject(refreshError);
            }
        }

        // Handle other 401 errors or if retry failed
        if (error.response?.status === 401) {
            clearAuthData();
            dispatchAuthEvent('LOGOUT', { reason: 'unauthorized' });
        }

        return Promise.reject(error);
    }
);

export default axiosPrivate;