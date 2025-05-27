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

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Using localStorage for token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API request unauthorized (401). Forcing logout.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser'); // Assuming user info is also stored
      // Redirect to login, consider using React Router's navigation context if available
      // For simplicity here, direct navigation, but a more robust solution is preferred in a full app.
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
         // window.location.href = '/login'; // Commented out to prevent actual redirection in test environments
         console.log("Redirect to /login would happen here.");
      }
    }
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
// export const getMe = () => api.get('/auth/me'); // If you add a /me route on backend

// --- Financials (from /financials routes) ---
export const addExpense = (expenseData) => api.post('/financials/expenses', expenseData);
export const getExpenses = (params) => api.get('/financials/expenses', { params });
export const getExpenseById = (id) => api.get(`/financials/expenses/${id}`);
export const updateExpense = (id, data) => api.put(`/financials/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/financials/expenses/${id}`);

export const addRevenue = (revenueData) => api.post('/financials/revenue', revenueData);
export const getRevenueEntries = (params) => api.get('/financials/revenue', { params }); // Original
export const getRevenueEntryById = (id) => api.get(`/financials/revenue/${id}`); // Original
export const updateRevenueEntry = (id, data) => api.put(`/financials/revenue/${id}`, data); // Original
export const deleteRevenueEntry = (id) => api.delete(`/financials/revenue/${id}`); // Original

// Aliases for frontend compatibility
export const getRevenue = (params) => getRevenueEntries(params);
export const getRevenueById = (id) => getRevenueEntryById(id);
export const updateRevenue = (id, data) => updateRevenueEntry(id, data);
export const deleteRevenue = (id) => deleteRevenueEntry(id);


export const addBankAccount = (accountData) => api.post('/financials/bank-accounts', accountData);
export const getBankAccounts = () => api.get('/financials/bank-accounts');
export const getBankAccountById = (id) => api.get(`/financials/bank-accounts/${id}`);
export const updateBankAccount = (id, accountData) => api.put(`/financials/bank-accounts/${id}`, accountData);
export const deleteBankAccount = (id) => api.delete(`/financials/bank-accounts/${id}`);

export const getFinancialOverview = () => api.get('/financials/overview');
export const getFundUtilizationReport = (params) => api.get('/financials/fund-utilization', { params });

// --- Transaction Categorization (from /financials and /enhanced routes) ---
export const autoCategorizeTransaction = (data) => api.post('/financials/expenses/auto-categorize', data); // Original for single
export const bulkCategorizeTransactions = (data) => api.post('/financials/expenses/bulk-categorize', data); // Original for bulk
export const correctTransactionCategory = (expenseId, data) => api.post(`/financials/expenses/${expenseId}/correct-category`, data); // Original for correction
export const getCategorizationInsights = () => api.get('/enhanced/transactions/categorization-insights');

// Alias for frontend compatibility
export const categorizeTransaction = (data) => autoCategorizeTransaction(data);


// --- Bank Sync (Enhanced Routes) ---
export const importBankStatement = (formData) => api.post('/enhanced/bank/import', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getBankTransactions = (params) => api.get('/enhanced/bank/transactions', { params });
export const reconcileBankTransaction = (id, data) => api.post(`/enhanced/bank/transactions/${id}/reconcile`, data);
export const getReconciliationSummary = (params) => api.get('/enhanced/bank/reconciliation-summary', { params });


// --- Manual KPI Snapshots & Derived KPIs (from /kpis routes) ---
export const createManualKpiSnapshot = (snapshotData) => api.post('/kpis/snapshots', snapshotData);
export const getManualKpiSnapshots = (params) => api.get('/kpis/snapshots', { params });
export const getManualKpiSnapshotByDate = (date) => api.get(`/kpis/snapshots/${date}`);
export const updateManualKpiSnapshot = (id, snapshotData) => api.put(`/kpis/snapshots/${id}`, snapshotData);
export const deleteManualKpiSnapshot = (id) => api.delete(`/kpis/snapshots/${id}`);

export const getUserGrowthMetrics = () => api.get('/kpis/user-growth');
export const getDauMauHistory = (params) => api.get('/kpis/dau-mau-history', { params });
export const getFeatureUsageStats = () => api.get('/kpis/feature-usage');
export const getRetentionMetrics = () => api.get('/kpis/retention');
export const getActiveUserDefinition = () => api.get('/kpis/active-user-definition');

// --- Recurring Transactions (Enhanced Routes) ---
export const addRecurringTransaction = (data) => api.post('/enhanced/recurring-transactions', data);
export const getRecurringTransactions = (params) => api.get('/enhanced/recurring-transactions', { params });
export const getRecurringTransactionById = (id) => api.get(`/enhanced/recurring-transactions/${id}`);
export const updateRecurringTransaction = (id, data) => api.put(`/enhanced/recurring-transactions/${id}`, data);
export const deleteRecurringTransaction = (id) => api.delete(`/enhanced/recurring-transactions/${id}`);
export const getUpcomingRecurringTransactions = (params) => api.get('/enhanced/recurring-transactions/upcoming', { params });
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

// --- Fundraising Module (from /fundraising routes) ---
export const createRound = (roundData) => api.post('/fundraising/rounds', roundData);
export const getRounds = () => api.get('/fundraising/rounds');
export const getRoundById = (id) => api.get(`/fundraising/rounds/${id}`);
export const updateRound = (id, roundData) => api.put(`/fundraising/rounds/${id}`, roundData);
export const deleteRound = (id) => api.delete(`/fundraising/rounds/${id}`);

export const addInvestor = (investorData) => api.post('/fundraising/investors', investorData);
export const getInvestors = (params) => api.get('/fundraising/investors', { params }); // Used by getAvailableInvestors
export const getInvestorById = (id) => api.get(`/fundraising/investors/${id}`);
export const updateInvestor = (id, investorData) => api.put(`/fundraising/investors/${id}`, investorData);
export const deleteInvestor = (id) => api.delete(`/fundraising/investors/${id}`);

export const addTranche = (investorId, trancheData) => api.post(`/fundraising/investors/${investorId}/tranches`, trancheData);
export const updateTranche = (investorId, trancheId, trancheData) => api.put(`/fundraising/investors/${investorId}/tranches/${trancheId}`, trancheData);
export const deleteTranche = (investorId, trancheId) => api.delete(`/fundraising/investors/${investorId}/tranches/${trancheId}`);

export const addCapTableEntry = (entryData) => api.post('/fundraising/captable', entryData);
export const getCapTableSummary = () => api.get('/fundraising/captable');
export const getCapTableEntryById = (id) => api.get(`/fundraising/captable/${id}`);
export const updateCapTableEntry = (id, entryData) => api.put(`/fundraising/captable/${id}`, entryData);
export const deleteCapTableEntry = (id) => api.delete(`/fundraising/captable/${id}`);

// --- ESOP Grants (Advanced Features Routes) ---
export const createEsopGrant = (grantData) => api.post('/advanced/esop-grants', grantData);
export const getEsopGrants = (params) => api.get('/advanced/esop-grants', { params });
export const getEsopGrantById = (id) => api.get(`/advanced/esop-grants/${id}`);
export const updateEsopGrant = (id, grantData) => api.put(`/advanced/esop-grants/${id}`, grantData);
export const deleteEsopGrant = (id) => api.delete(`/advanced/esop-grants/${id}`);

// --- Custom KPIs (Enhanced Routes) ---
export const createCustomKpi = (kpiData) => api.post('/enhanced/kpis/custom', kpiData);
export const getCustomKpis = (params) => api.get('/enhanced/kpis/custom', { params });
export const getCustomKpiById = (id) => api.get(`/enhanced/kpis/custom/${id}`);
export const updateCustomKpi = (id, kpiData) => api.put(`/enhanced/kpis/custom/${id}`, kpiData);
export const deleteCustomKpi = (id) => api.delete(`/enhanced/kpis/custom/${id}`);
export const calculateCustomKpiValue = (id, date) => api.post(`/enhanced/kpis/custom/${id}/calculate`, { date });
export const getKpiDashboardData = () => api.get('/enhanced/kpis/dashboard');
export const initializeBuiltInKpis = () => api.post('/enhanced/kpis/initialize-builtin');

// --- Predictive Analytics (Analytics Routes) ---
export const createRunwayScenario = (data) => api.post('/analytics/runway-scenarios', data);
export const getRunwayScenarios = () => api.get('/analytics/runway-scenarios');
export const compareRunwayScenarios = () => api.get('/analytics/runway-scenarios/compare');
// Add getById, delete, and update for runway scenarios if backend supports it

export const createFundraisingPrediction = (data) => api.post('/analytics/fundraising-predictions', data);
export const getFundraisingReadiness = () => api.get('/analytics/fundraising-readiness');
export const getMarketComparables = (params) => api.get('/analytics/market-comparables', { params });
// Add get, update, delete for fundraising predictions

export const createCashFlowForecast = (data) => api.post('/analytics/cash-flow-forecasts', data);
export const getHistoricalCashFlowData = () => api.get('/analytics/cash-flow-data/historical');
export const getCurrentCashPosition = () => api.get('/analytics/cash-position/current');
// Add get, update, delete for cash flow forecasts

export const createRevenueCohort = (data) => api.post('/analytics/revenue-cohorts', data);
export const generateCohortProjections = (cohortId, data) => api.post(`/analytics/revenue-cohorts/${cohortId}/projections`, data);
export const getCohortsComparison = () => api.get('/analytics/revenue-cohorts/compare');
// Add get, update, delete for revenue cohorts

// --- Document Management (Advanced Features Routes) ---
export const uploadDocumentFile = (formData) => api.post('/advanced/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getDocuments = (params) => api.get('/advanced/documents', { params });
export const getDocumentById = (id) => api.get(`/advanced/documents/${id}`);
export const downloadDocumentLink = (id) => api.get(`/advanced/documents/${id}/download`);
export const deleteDocument = (id) => api.delete(`/advanced/documents/${id}`);

// --- Investor Meetings (from /investor-meetings routes) ---
export const getInvestorMeetings = (params) => api.get('/investor-meetings', { params });
export const getInvestorMeetingById = (id) => api.get(`/investor-meetings/${id}`);
export const deleteInvestorMeeting = (id) => api.delete(`/investor-meetings/${id}`);
export const prepareInvestorMeeting = (id, data) => api.post(`/investor-meetings/${id}/prepare`, data);
export const addMeetingTalkingPoint = (meetingId, talkingPointData) => api.post(`/investor-meetings/${meetingId}/talking-points`, talkingPointData);
export const updateMeetingNotes = (meetingId, notesData) => api.patch(`/investor-meetings/${meetingId}/notes`, notesData);
export const addMeetingFeedback = (meetingId, feedbackData) => api.post(`/investor-meetings/${meetingId}/feedback`, feedbackData);
export const addMeetingActionItem = (meetingId, actionItemData) => api.post(`/investor-meetings/${meetingId}/action-items`, actionItemData);
export const updateMeetingActionItem = (meetingId, actionItemId, actionItemData) => api.patch(`/investor-meetings/${meetingId}/action-items/${actionItemId}`, actionItemData);
export const completeInvestorMeeting = (meetingId, completionData) => api.post(`/investor-meetings/${meetingId}/complete`, completionData);
export const getInvestorMeetingStatistics = (params) => api.get('/investor-meetings/statistics', { params });

// Aliases for frontend compatibility
export const getInvestorMeetingMetrics = (params) => getInvestorMeetingStatistics(params);
export const createInvestorMeetingTalkingPoint = (meetingId, talkingPointData) => addMeetingTalkingPoint(meetingId, talkingPointData);
export const createInvestorMeetingFollowUp = (meetingId, followUpData) => addMeetingActionItem(meetingId, followUpData);
export const updateInvestorMeetingFollowUp = (meetingId, followUpId, followUpData) => updateMeetingActionItem(meetingId, followUpId, followUpData);


// Helper function to transform frontend meeting data to backend expected structure
const transformMeetingDataForBackend = (formData) => {
  const investorsPayload = formData.investors ? formData.investors.map(inv => ({
    investorId: inv.investorId || undefined,
    name: inv.name,
    company: inv.company || inv.name,
    email: inv.contactEmail || inv.email,
    role: inv.role || 'Contact',
    attended: typeof inv.attended === 'boolean' ? inv.attended : true,
    contactName: inv.contactName,
    investorType: inv.investorType,
    investmentStage: inv.investmentStage,
  })) : [];

  const internalParticipantsPayload = formData.internalParticipants ? formData.internalParticipants.map(par => ({
    userId: par.userId || undefined,
    name: par.name,
    role: par.role,
  })) : [];

  const validMeetingTypes = ['Regular Update', 'Board Meeting', 'Fundraising', 'Due Diligence', 'Strategic Discussion', 'Other'];
  const meetingType = validMeetingTypes.includes(formData.meetingType) ? formData.meetingType : 'Other';

  return {
    title: formData.title,
    meetingDate: formData.meetingDate,
    duration: parseInt(formData.duration, 10) || 60,
    meetingType: meetingType,
    location: formData.location,
    meetingLink: formData.meetingLink,
    agenda: formData.agenda,
    investors: investorsPayload,
    internalParticipants: internalParticipantsPayload,
    meetingSections: formData.meetingSections,
    ...(formData.status && { status: formData.status }),
    ...(formData.preparation && { preparation: formData.preparation }),
    ...(formData.notes && { notes: formData.notes }),
    ...(formData.summary && { summary: formData.summary }),
    ...(formData.recordingUrl && { recordingUrl: formData.recordingUrl }),
    ...(formData.relatedDocuments && { relatedDocuments: formData.relatedDocuments }),
    ...(formData.tags && { tags: formData.tags }),
  };
};

export const createInvestorMeeting = (meetingData) => {
  const payload = transformMeetingDataForBackend(meetingData);
  return api.post('/investor-meetings', payload);
};

export const updateInvestorMeeting = (id, meetingData) => {
  const payload = transformMeetingDataForBackend(meetingData);
  return api.put(`/investor-meetings/${id}`, payload);
};

// --- Headcount (from /headcount routes) ---
export const createHeadcount = (headcountData) => api.post('/headcount', headcountData);
export const getHeadcounts = (params) => api.get('/headcount', { params });
export const getHeadcountSummary = () => api.get('/headcount/summary');
export const getOrgChart = () => api.get('/headcount/org-chart');
export const getHeadcountById = (id) => api.get(`/headcount/${id}`);
export const updateHeadcount = (id, headcountData) => api.put(`/headcount/${id}`, headcountData);
export const deleteHeadcount = (id) => api.delete(`/headcount/${id}`);
export const updateHiringStatus = (id, statusData) => api.patch(`/headcount/${id}/hiring-status`, statusData);
export const convertToEmployee = (id, employeeData) => api.post(`/headcount/${id}/convert-to-employee`, employeeData);
export const linkExpensesToHeadcount = (id, expenseData) => api.post(`/headcount/${id}/link-expenses`, expenseData);

// --- Product Milestones (from /product-milestones routes) ---
export const createProductMilestone = (data) => api.post('/product-milestones', data);
export const getProductMilestones = (params) => api.get('/product-milestones', { params });
export const getProductMilestoneById = (id) => api.get(`/product-milestones/${id}`);
export const updateProductMilestone = (id, data) => api.put(`/product-milestones/${id}`, data);
export const deleteProductMilestone = (id) => api.delete(`/product-milestones/${id}`);
export const getInvestorRoadmap = () => api.get('/product-milestones/investor-roadmap');
export const getProductMilestoneStatistics = () => api.get('/product-milestones/statistics');
export const addProductMilestoneTask = (milestoneId, taskData) => api.post(`/product-milestones/${milestoneId}/tasks`, taskData);
export const updateProductMilestoneTask = (milestoneId, taskId, taskData) => api.put(`/product-milestones/${milestoneId}/tasks/${taskId}`, taskData);
export const deleteProductMilestoneTask = (milestoneId, taskId) => api.delete(`/product-milestones/${milestoneId}/tasks/${taskId}`);

// --- Investor Reports (Live Dashboard & Narratives) ---
export const getLiveDashboardData = () => api.get('/investor-reports/live-dashboard-data');
export const createInvestorReportNarrative = (data) => api.post('/investor-reports', data);
export const getInvestorReportNarratives = (params) => api.get('/investor-reports', { params });
export const getInvestorReportNarrativeById = (id) => api.get(`/investor-reports/${id}`);
export const updateInvestorReportNarrative = (id, data) => api.put(`/investor-reports/${id}`, data);
export const deleteInvestorReportNarrative = (id) => api.delete(`/investor-reports/${id}`);


// --- ML & Advanced Analytics (Enhanced Routes) ---
export const predictExpensesML = (params) => api.get('/enhanced/ml/predict-expenses', { params });
export const detectAnomaliesML = (data) => api.post('/enhanced/ml/detect-anomalies', data);
export const optimizeCashflowML = (data) => api.post('/enhanced/ml/optimize-cashflow', data);
export const identifySpendingPatternsML = () => api.get('/enhanced/ml/spending-patterns');
export const trainMlModel = (modelName) => api.post('/enhanced/ml/train', { model: modelName });


// --- Utility functions for frontend ---
export const getAvailableInvestors = (params) => getInvestors(params); // Re-uses getInvestors
export const getAvailableTeamMembers = (params) => getHeadcounts(params); // Re-uses getHeadcounts

export default api;
