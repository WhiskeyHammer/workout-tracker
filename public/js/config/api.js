// API Configuration - Loaded as global
// No exports needed - just define globally
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api';

const api = {
    call: async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
        
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        
        return response;
    }
};
