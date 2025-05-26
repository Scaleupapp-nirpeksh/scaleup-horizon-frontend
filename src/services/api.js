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
export const createRound = (roundData) => api.post('/fundraising/rounds', roundData);
export const getRounds = () => api.get('/fundraising/rounds');
export const getRoundById = (id) => api.get(`/fundraising/rounds/${id}`);
export const updateRound = (id, roundData) => api.put(`/fundraising/rounds/${id}`, roundData);
export const deleteRound = (id) => api.delete(`/fundraising/rounds/${id}`);
export const addInvestor = (investorData) => api.post('/fundraising/investors', investorData);
export const getInvestors = (params) => api.get('/fundraising/investors', { params });
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
export const createEsopGrant = (grantData) => api.post('/advanced/esop-grants', grantData);
export const getEsopGrants = (params) => api.get('/advanced/esop-grants', { params });
export const getEsopGrantById = (id) => api.get(`/advanced/esop-grants/${id}`);
export const updateEsopGrant = (id, grantData) => api.put(`/advanced/esop-grants/${id}`, grantData);
export const deleteEsopGrant = (id) => api.delete(`/advanced/esop-grants/${id}`);

// --- Custom KPIs (Enhanced Routes) ---
export const createCustomKpi = (kpiData) => api.post('/enhanced/kpis/custom', kpiData);
export const getCustomKpis = (params) => api.get('/enhanced/kpis/custom', { params });
export const getCustomKpiById = (id) => api.get(`/enhanced/kpis/custom/${id}`); // Assuming backend has this
export const updateCustomKpi = (id, kpiData) => api.put(`/enhanced/kpis/custom/${id}`, kpiData); // Assuming backend has this
export const deleteCustomKpi = (id) => api.delete(`/enhanced/kpis/custom/${id}`); // Assuming backend has this
export const calculateCustomKpiValue = (id, date) => api.post(`/enhanced/kpis/custom/${id}/calculate`, { date });
export const getKpiDashboardData = () => api.get('/enhanced/kpis/dashboard');


// --- Predictive Analytics (Analytics Routes) ---
export const createRunwayScenario = (data) => api.post('/analytics/runway-scenarios', data);
export const getRunwayScenarios = () => api.get('/analytics/runway-scenarios');
export const compareRunwayScenarios = () => api.get('/analytics/runway-scenarios/compare');
// Add delete and update for runway scenarios if backend supports it

export const createFundraisingPrediction = (data) => api.post('/analytics/fundraising-predictions', data);
// Add get, update, delete for fundraising predictions

export const createCashFlowForecast = (data) => api.post('/analytics/cash-flow-forecasts', data);
// Add get, update, delete for cash flow forecasts

export const createRevenueCohort = (data) => api.post('/analytics/revenue-cohorts', data);
export const generateCohortProjections = (cohortId, data) => api.post(`/analytics/revenue-cohorts/${cohortId}/projections`, data);
export const getCohortsComparison = () => api.get('/analytics/revenue-cohorts/compare');
// Add get, update, delete for revenue cohorts

// --- Document Management (Advanced Features Routes) ---
export const uploadDocumentFile = (formData) => api.post('/advanced/documents/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data', // Important for file uploads
  },
});
export const getDocuments = (params) => api.get('/advanced/documents', { params });
export const getDocumentById = (id) => api.get(`/advanced/documents/${id}`);
export const downloadDocumentLink = (id) => api.get(`/advanced/documents/${id}/download`); // Gets a signed URL
export const deleteDocument = (id) => api.delete(`/advanced/documents/${id}`);

// --- Investor Meetings ---
export const getInvestorMeetings = (params) => api.get('/investor-meetings', { params });
export const getInvestorMeetingById = (id) => api.get(`/investor-meetings/${id}`);

// Helper function to transform frontend meeting data to backend expected structure
// This function is crucial for matching frontend form data to backend schema.
const transformMeetingDataForBackend = (formData) => {
  const investorsPayload = formData.investors ? formData.investors.map(inv => ({
    name: inv.name, // This should be the Investor Firm Name
    company: inv.company || inv.name, // Backend has 'company', can default to name
    email: inv.contactEmail, // Frontend's contactEmail maps to backend's email
    role: inv.role || 'Contact', // Provide a default or ensure form collects it
    // Fields from frontend form that might not be in backend's default investor sub-schema
    // but could be added or are for this specific meeting instance.
    contactName: inv.contactName,
    investorType: inv.investorType,
    investmentStage: inv.investmentStage,
    attended: typeof inv.attended === 'boolean' ? inv.attended : true,
    // investorId: inv.investorId // If you are linking to an existing Investor record
  })) : [];

  const internalParticipantsPayload = formData.internalParticipants ? formData.internalParticipants.map(par => ({
    name: par.name,
    role: par.role,
    // userId: par.userId // If you are linking to an existing User record
  })) : [];

  // Ensure meetingType aligns with backend enum values
  const validMeetingTypes = ['Regular Update', 'Board Meeting', 'Fundraising', 'Due Diligence', 'Strategic Discussion', 'Other'];
  const meetingType = validMeetingTypes.includes(formData.meetingType) ? formData.meetingType : 'Other';


  return {
    title: formData.title,
    meetingDate: formData.meetingDate, // Ensure this is in a format backend accepts (ISO string usually)
    duration: parseInt(formData.duration, 10) || 60,
    meetingType: meetingType,
    location: formData.location,
    meetingLink: formData.meetingLink,
    agenda: formData.agenda,
    investors: investorsPayload,
    internalParticipants: internalParticipantsPayload,
    // Include other fields from formData that map directly to the backend model
    // e.g., status, preparation details if the form handles them.
    // For create, status is usually set by backend. For update, it might be sent.
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

export const deleteInvestorMeeting = (id) => api.delete(`/investor-meetings/${id}`);

// Talking points for meetings
// GET for talking points is not needed as they come with the full meeting object from getInvestorMeetingById.
export const createInvestorMeetingTalkingPoint = (meetingId, talkingPointData) => {
  // talkingPointData should match backend's talkingPointSchema:
  // { title, category, content, priority, relatedMetrics, notes, wasDiscussed }
  return api.post(`/investor-meetings/${meetingId}/talking-points`, talkingPointData);
};
// UPDATE and DELETE for individual talking points are not directly supported by distinct backend routes.
// To implement, you would typically fetch the meeting, modify the talkingPoints array in frontend,
// and then PUT the whole meeting object using updateInvestorMeeting.

// Follow-ups (Action Items) for meetings
// GET for follow-ups is not needed as actionItems come with the full meeting object.
export const createInvestorMeetingFollowUp = (meetingId, followUpData) => {
  // followUpData should match backend's actionItemSchema:
  // { action, assignee (userId), dueDate, status ('Not Started' default), notes }
  return api.post(`/investor-meetings/${meetingId}/action-items`, followUpData);
};

export const updateInvestorMeetingFollowUp = (meetingId, followUpId, followUpData) => {
  // followUpData can include { status, notes, completedDate } as per backend's updateActionItem
  return api.patch(`/investor-meetings/${meetingId}/action-items/${followUpId}`, followUpData);
};
// DELETE for individual follow-ups/action items is not directly supported by a distinct backend route.
// Similar workaround as talking points: modify array and PUT whole meeting.

// Meeting analytics
// Backend route is '/investor-meetings/statistics'
export const getInvestorMeetingMetrics = () => api.get('/investor-meetings/statistics');
export const getAvailableInvestors = (params) => api.get('/fundraising/investors', { params });
export const getAvailableTeamMembers= (params) => api.get('/headcount', { params });

export const createHeadcount = (headcountData) => api.post('/headcount', headcountData);
export const getHeadcounts = (params) => api.get('/headcount', { params });
export const getHeadcountSummary = () => api.get('/headcount/summary');
export const getOrgChart = () => api.get('/headcount/org-chart');
export const getHeadcountById = (id) => api.get(`/headcount/${id}`);
export const updateHeadcount = (id, headcountData) => api.put(`/headcount/${id}`, headcountData);
export const deleteHeadcount = (id) => api.delete(`/headcount/${id}`);
export const updateHiringStatus = (id, statusData) => api.patch(`/headcount/${id}/hiring-status`, statusData);
export const convertToEmployee = (id, employeeData) => api.post(`/headcount/${id}/convert-to-employee`, employeeData);
export const linkExpenses = (id, expenseData) => api.post(`/headcount/${id}/link-expenses`, expenseData);

export default api;
