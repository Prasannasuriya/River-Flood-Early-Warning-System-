// API Client Module
const API_BASE = '/api';

const API = {
    async fetchJSON(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error ${response.status}`);
            }
            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        }
    },

    // Authentication
    async login(username, password) {
        return this.fetchJSON('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // Dashboard Data
    async getDashboard() {
        return this.fetchJSON('/dashboard');
    },

    // Readings CRUD
    async getReadings(search = '', status = 'All', sort = 'latest') {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (status && status !== 'All') queryParams.append('status', status);
        if (sort) queryParams.append('sort', sort);

        return this.fetchJSON(`/readings?${queryParams.toString()}`);
    },

    async getReadingById(id) {
        return this.fetchJSON(`/readings/${id}`);
    },

    async createReading(readingData) {
        return this.fetchJSON('/readings', {
            method: 'POST',
            body: JSON.stringify(readingData)
        });
    },

    async updateReading(id, readingData) {
        return this.fetchJSON(`/readings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(readingData)
        });
    },

    async deleteReading(id) {
        return this.fetchJSON(`/readings/${id}`, {
            method: 'DELETE'
        });
    }
};
