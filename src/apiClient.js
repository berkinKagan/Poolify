// src/api/apiClient.js
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: 'http://0.0.0.0:5000', // Base URL for your API
    timeout: 10000, // Optional: Timeout for requests (10 seconds)
    headers: {
        'Content-Type': 'application/json', // Default content type
    },
});

// Optional: Add request interceptors
apiClient.interceptors.request.use(
    (config) => {
        // You can add custom logic here, like adding tokens
        // For example:
        // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: Add response interceptors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally, e.g., log out on 401
        if (error.response && error.response.status === 401) {
            // Logic for unauthorized access
        }
        return Promise.reject(error);
    }
);

export default apiClient;
