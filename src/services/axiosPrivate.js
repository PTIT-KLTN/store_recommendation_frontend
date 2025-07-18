import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosPrivate = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor cho request - thêm token vào header khi gửi request
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
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

            try {
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    token: localStorage.getItem('refreshToken')
                });

                if (response.data.token) {
                    localStorage.setItem('accessToken', response.data.token);

                    originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                    return axiosPrivate(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Chuyển hướng đến trang đăng nhập
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosPrivate;