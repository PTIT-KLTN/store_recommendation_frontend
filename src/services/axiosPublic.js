import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Thêm interceptor để đảm bảo header ngrok luôn có
axiosPublic.interceptors.request.use(
    (config) => {
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosPublic;