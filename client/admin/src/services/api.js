import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token management
let authToken = localStorage.getItem('adminToken');

// Set auth token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('adminToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token if exists
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data ? 'עם נתונים' : 'ללא נתונים');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      console.log('API - גישה נדחתה, מנתק את המשתמש');
      setAuthToken(null);
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// API Service
export const apiService = {
  // Generic HTTP methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),

  // Auth endpoints
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'),

  // Dashboard endpoints
  getStats: () => api.get('/admin/stats'),

  // Questions endpoints
  getQuestions: (params) => api.get('/admin/questions', { params }),
  createQuestion: (questionData) => api.post('/admin/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/admin/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // Users endpoints
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/toggle-active`, { isActive }),

  // Games endpoints
  getGames: (params) => api.get('/admin/games', { params }),
  getGame: (id) => api.get(`/admin/games/${id}`),
  createGame: (gameData) => api.post('/admin/games', gameData),
  updateGame: (id, gameData) => api.put(`/admin/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/admin/games/${id}`),
  
  // Direct question management (new approach)
  getGameQuestions: (gameId, params) => api.get(`/admin/games/${gameId}/questions-new`, { params }),
  createGameQuestion: (gameId, questionData) => api.post(`/admin/games/${gameId}/questions-new`, questionData),
  updateGameQuestion: (gameId, questionId, questionData) => api.put(`/admin/games/${gameId}/questions-new/${questionId}`, questionData),
  deleteGameQuestion: (gameId, questionId) => api.delete(`/admin/games/${gameId}/questions-new/${questionId}`),
  bulkImportGameQuestions: (gameId, questionsData) => api.post(`/admin/games/${gameId}/questions-new/bulk-import`, questionsData),

  // Analytics endpoints
  getAnalytics: (params) => api.get('/admin/analytics', { params })
};

export default apiService;
