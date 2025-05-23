// src/services/api.js
// Axios instance for making API calls to the backend. (Adapted for CRA)
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api/horizon';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API request unauthorized (401). Forcing logout.');
      // This should trigger AuthContext to update state if logout is called
      // Forcing a hard redirect might be too disruptive, rely on ProtectedRoute
      // and UI elements to guide user to login.
      // Consider calling a logout function from AuthContext if accessible here,
      // or emitting an event.
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // window.location.href = '/login'; // Could be used as a last resort
    }
    return Promise.reject(error);
  }
);

// Specific API call functions
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);

export const addExpense = (expenseData) => api.post('/financials/expenses', expenseData);
export const getExpenses = (params) => api.get('/financials/expenses', { params });
export const getExpenseById = (id) => api.get(`/financials/expenses/${id}`);
export const updateExpense = (id, data) => api.put(`/financials/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/financials/expenses/${id}`);


export const addRevenue = (revenueData) => api.post('/financials/revenue', revenueData);
export const getRevenue = (params) => api.get('/financials/revenue', { params });
export const getRevenueById = (id) => api.get(`/financials/revenue/${id}`);
export const updateRevenue = (id, data) => api.put(`/financials/revenue/${id}`, data);
export const deleteRevenue = (id) => api.delete(`/financials/revenue/${id}`);


export const addBankAccount = (accountData) => api.post('/financials/bank-accounts', accountData);
export const getBankAccounts = () => api.get('/financials/bank-accounts');
export const updateBankAccount = (id, accountData) => api.put(`/financials/bank-accounts/${id}`, accountData);
export const deleteBankAccount = (id) => api.delete(`/financials/bank-accounts/${id}`);


export const categorizeTransaction = (data) => api.post('/enhanced/transactions/categorize', data);
export const correctTransactionCategory = (id, data) => api.post(`/enhanced/transactions/${id}/correct-category`, data); // Note: Backend expects expense ID

export default api;