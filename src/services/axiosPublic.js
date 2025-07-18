import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosPublic;