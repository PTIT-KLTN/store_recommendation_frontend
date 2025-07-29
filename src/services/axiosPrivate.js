import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosPrivate = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

// Hàm helper để clear auth data và redirect
const clearAuthAndRedirect = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Kiểm tra nếu không phải đang ở trang login
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

// Thêm interceptor cho request - thêm token vào header khi gửi request
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Nếu không có access token, kiểm tra có refresh token không
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // Không có cả access token và refresh token -> redirect ngay
                clearAuthAndRedirect();
                return Promise.reject(new Error('No authentication tokens found'));
            }
        }
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor cho response - xử lý lỗi 401 (Unauthorized)
axiosPrivate.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            
            // Nếu không có refresh token -> redirect ngay
            if (!refreshToken) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken // Sửa key cho đúng với backend
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                if (response.data.access_token) {
                    // Lưu token mới
                    localStorage.setItem('accessToken', response.data.access_token);
                    
                    // Cập nhật header cho request gốc
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                    originalRequest.headers['ngrok-skip-browser-warning'] = 'true';
                    
                    // Retry request gốc
                    return axiosPrivate(originalRequest);
                } else {
                    throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        // Nếu là lỗi 401 nhưng đã retry rồi, hoặc lỗi khác
        if (error.response?.status === 401) {
            clearAuthAndRedirect();
        }

        return Promise.reject(error);
    }
);

export default axiosPrivate;