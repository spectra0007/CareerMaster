// ============================================================
// API Client — Axios instance for backend communication
// ============================================================
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Attach Clerk session token to every request.
 * Call this in components: api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
 * Or use the helper below.
 */
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
}

// Response interceptor — unwrap data or throw error
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export default api;
