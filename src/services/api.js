// src/services/api.js
// Axios instance for making API calls to the backend.
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      if (window.location.pathname !== '/login') {
        // window.location.href = '/login'; // Consider a more graceful context-based logout
      }
    }
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);

// --- Financials ---
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

// --- Transaction Categorization (Enhanced Routes) ---
export const categorizeTransaction = (data) => api.post('/enhanced/transactions/categorize', data);
export const correctTransactionCategory = (expenseId, data) => api.post(`/enhanced/transactions/${expenseId}/correct-category`, data);

// --- KPI Snapshots (Original KPI Routes) ---
export const createManualKpiSnapshot = (snapshotData) => api.post('/kpis/snapshots', snapshotData);
export const getManualKpiSnapshots = (params) => api.get('/kpis/snapshots', { params });
export const getManualKpiSnapshotByDate = (date) => api.get(`/kpis/snapshots/${date}`);
export const updateManualKpiSnapshot = (id, snapshotData) => api.put(`/kpis/snapshots/${id}`, snapshotData);
export const deleteManualKpiSnapshot = (id) => api.delete(`/kpis/snapshots/${id}`);

// --- Derived KPIs from Snapshots (Original KPI Routes) ---
export const getUserGrowthMetrics = () => api.get('/kpis/user-growth');
export const getDauMauHistory = (params) => api.get('/kpis/dau-mau-history', { params });

// --- Recurring Transactions (Enhanced Routes) ---
export const addRecurringTransaction = (data) => api.post('/enhanced/recurring-transactions', data);
export const getRecurringTransactions = (params) => api.get('/enhanced/recurring-transactions', { params });
export const getUpcomingRecurringTransactions = (params) => api.get('/enhanced/recurring-transactions/upcoming', { params });
export const getRecurringTransactionById = (id) => api.get(`/enhanced/recurring-transactions/${id}`);
export const updateRecurringTransaction = (id, data) => api.put(`/enhanced/recurring-transactions/${id}`, data);
export const deleteRecurringTransaction = (id) => api.delete(`/enhanced/recurring-transactions/${id}`);
export const pauseRecurringTransaction = (id) => api.post(`/enhanced/recurring-transactions/${id}/pause`);
export const resumeRecurringTransaction = (id) => api.post(`/enhanced/recurring-transactions/${id}/resume`);
export const getRecurringSummary = () => api.get('/enhanced/recurring-transactions/summary');

// --- Budget Management (Advanced Features Routes) ---
export const createBudget = (budgetData) => api.post('/advanced/budgets', budgetData);
export const getBudgets = (params) => api.get('/advanced/budgets', { params });
export const getBudgetById = (id) => api.get(`/advanced/budgets/${id}`);
export const updateBudget = (id, budgetData) => api.put(`/advanced/budgets/${id}`, budgetData);
export const deleteBudget = (id) => api.delete(`/advanced/budgets/${id}`);
export const getBudgetVsActualsReport = (params) => api.get('/advanced/reports/budget-vs-actuals', { params });

// --- Fundraising Module ---
// Rounds
export const createRound = (roundData) => api.post('/fundraising/rounds', roundData);
export const getRounds = () => api.get('/fundraising/rounds');
export const getRoundById = (id) => api.get(`/fundraising/rounds/${id}`);
export const updateRound = (id, roundData) => api.put(`/fundraising/rounds/${id}`, roundData);
export const deleteRound = (id) => api.delete(`/fundraising/rounds/${id}`);

// Investors
export const addInvestor = (investorData) => api.post('/fundraising/investors', investorData);
export const getInvestors = (params) => api.get('/fundraising/investors', { params }); // e.g., ?roundId=xyz
export const getInvestorById = (id) => api.get(`/fundraising/investors/${id}`);
export const updateInvestor = (id, investorData) => api.put(`/fundraising/investors/${id}`, investorData);
export const deleteInvestor = (id) => api.delete(`/fundraising/investors/${id}`);

// Tranches (nested under investors)
export const addTranche = (investorId, trancheData) => api.post(`/fundraising/investors/${investorId}/tranches`, trancheData);
export const updateTranche = (investorId, trancheId, trancheData) => api.put(`/fundraising/investors/${investorId}/tranches/${trancheId}`, trancheData);
export const deleteTranche = (investorId, trancheId) => api.delete(`/fundraising/investors/${investorId}/tranches/${trancheId}`);

// Cap Table
export const addCapTableEntry = (entryData) => api.post('/fundraising/captable', entryData);
export const getCapTableSummary = () => api.get('/fundraising/captable'); // Or get all entries
export const getCapTableEntryById = (id) => api.get(`/fundraising/captable/${id}`);
export const updateCapTableEntry = (id, entryData) => api.put(`/fundraising/captable/${id}`, entryData);
export const deleteCapTableEntry = (id) => api.delete(`/fundraising/captable/${id}`);

// ESOP Grants (Advanced Features Routes, but related to fundraising/cap table)
export const createEsopGrant = (grantData) => api.post('/advanced/esop-grants', grantData);
export const getEsopGrants = (params) => api.get('/advanced/esop-grants', { params });
export const getEsopGrantById = (id) => api.get(`/advanced/esop-grants/${id}`);
export const updateEsopGrant = (id, grantData) => api.put(`/advanced/esop-grants/${id}`, grantData);
export const deleteEsopGrant = (id) => api.delete(`/advanced/esop-grants/${id}`);


export default api;
