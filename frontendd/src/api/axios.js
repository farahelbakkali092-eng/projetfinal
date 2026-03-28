import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Accept': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem('lang') || 'fr';
    config.headers['Accept-Language'] = lang;
    return config;
});

// If the server returns 401, the token is expired/invalid.
// Clear the session and redirect to home so the user can log in again.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if currently on an admin page to avoid disrupting normal users
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;