import axios from 'axios';
import config from '../config';

const axiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (conf) => {
        const token = localStorage.getItem(config.TOKEN_KEY);
        if (token) {
            conf.headers.Authorization = `Bearer ${token}`;
        }
        return conf;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(config.TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 