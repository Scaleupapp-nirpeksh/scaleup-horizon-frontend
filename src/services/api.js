// src/services/api.js
// Enhanced Axios instance for making API calls to the backend with comprehensive fundraising support
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
      // It's generally better to handle logout logic within AuthContext or a dedicated auth service
      // to ensure proper state cleanup and navigation.
      // For now, we'll just remove the token. The AuthContext should observe this.
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser'); // Assuming user info is also stored
      localStorage.removeItem('activeOrganization'); // Clear active organization on auth failure

      // Notify other parts of the app about logout, e.g., via a custom event or state management
      const logoutEvent = new Event('auth-logout');
      window.dispatchEvent(logoutEvent);
      
      // Avoid direct navigation here if possible, let the app's routing/auth state handle it.
      // if (window.location.pathname !== '/login' && window.location.pathname !== '/register-owner' && !window.location.pathname.startsWith('/complete-setup')) {
      //    console.log("Redirect to /login would happen here due to 401.");
      //    // window.location.href = '/login'; 
      // }
    }
    return Promise.reject(error);
  }
);

// --- New Authentication Endpoints ---

/**
 * Registers the first user (owner) and creates their organization.
 * @param {object} ownerData - Data for the new owner and organization.
 * @param {string} ownerData.name - User's full name.
 * @param {string} ownerData.email - User's email.
 * @param {string} ownerData.password - User's password.
 * @param {string} ownerData.organizationName - Name of the organization to create.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const registerOrganizationOwner = (ownerData) => api.post('/auth/register-owner', ownerData);

/**
 * Completes account setup for a user provisioned by an admin.
 * @param {string} setupToken - The account setup token from the URL/link.
 * @param {object} passwordData - Object containing the new password.
 * @param {string} passwordData.password - The new password.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const completeAccountSetup = (setupToken, passwordData) => api.post(`/auth/complete-setup/${setupToken}`, passwordData);

/**
 * Logs in a user.
 * The backend now returns activeOrganization and memberships.
 * @param {object} credentials - User's login credentials.
 * @param {string} credentials.email - User's email.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const loginUser = (credentials) => api.post('/auth/login', credentials);

/**
 * Sets the active organization for the logged-in user.
 * @param {object} data - Object containing the organizationId.
 * @param {string} data.organizationId - The ID of the organization to set as active.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const setActiveOrganization = (data) => api.post('/auth/set-active-organization', data);

/**
 * Gets the current logged-in user's profile, active organization, and memberships.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getMe = () => api.get('/auth/me');


// --- New Organization Management Endpoints ---

/**
 * Gets details of the user's currently active organization.
 * Relies on req.organization being populated by authMiddleware on the backend.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getActiveOrganizationDetails = () => api.get('/organizations/my');

/**
 * Updates details of the user's currently active organization.
 * Only 'owner' role can update.
 * @param {object} organizationData - Data to update for the organization.
 * @param {string} [organizationData.name] - New name for the organization.
 * @param {string} [organizationData.industry] - New industry.
 * @param {string} [organizationData.timezone] - New timezone.
 * @param {string} [organizationData.currency] - New currency.
 * @param {object} [organizationData.settings] - New settings object.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const updateActiveOrganizationDetails = (organizationData) => api.put('/organizations/my', organizationData);

/**
 * Provisions a new member for the active organization (invites a user).
 * Only 'owner' role can provision.
 * @param {object} memberData - Data for the new member.
 * @param {string} memberData.email - Email of the user to invite.
 * @param {string} memberData.name - Name of the user to invite.
 * @param {string} memberData.role - Role for the new member (e.g., 'member', 'owner').
 * @returns {Promise<AxiosResponse<any>>}
 */
export const provisionNewMember = (memberData) => api.post('/organizations/my/members/provision', memberData);

/**
 * Lists all members of the active organization.
 * Accessible by 'owner' or 'member' roles.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const listOrganizationMembers = () => api.get('/organizations/my/members');

/**
 * Updates a member's role in the active organization.
 * Only 'owner' role can update roles.
 * @param {string} memberUserId - The ID of the member whose role is to be updated.
 * @param {object} roleData - Object containing the new role.
 * @param {string} roleData.newRole - The new role to assign.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const updateMemberRole = (memberUserId, roleData) => api.put(`/organizations/my/members/${memberUserId}/role`, roleData);

/**
 * Removes a member from the active organization.
 * Only 'owner' role can remove members.
 * @param {string} memberUserId - The ID of the member to remove.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const removeMemberFromOrganization = (memberUserId) => api.delete(`/organizations/my/members/${memberUserId}`);


// --- Existing Financials (from /financials routes) ---
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

// =============================================================================
// ENHANCED FUNDRAISING MODULE - WITH CALCULATION SUPPORT
// =============================================================================

// --- ENHANCED FUNDRAISING DASHBOARD ---

/**
 * Get comprehensive fundraising dashboard with calculations
 * @returns {Promise<AxiosResponse>} Dashboard with round stats, investor metrics, cap table summary
 */
export const getFundraisingDashboard = () => api.get('/fundraising/dashboard');

// --- ENHANCED ROUND MANAGEMENT ---

/**
 * Create a new fundraising round with automatic valuation calculations
 * @param {object} roundData - Round data with calculation fields
 * @param {string} roundData.name - Round name
 * @param {number} roundData.targetAmount - Amount to raise
 * @param {number} roundData.equityPercentageOffered - Equity % to give away
 * @param {number} roundData.existingSharesPreRound - Current founder shares
 * @param {string} [roundData.currency] - Currency (defaults to org currency)
 * @param {string} [roundData.roundType] - Type of round
 * @returns {Promise<AxiosResponse>} Enhanced round with calculated valuations
 */
export const createRound = (roundData) => api.post('/fundraising/rounds', roundData);

/**
 * Get all fundraising rounds with enhanced progress data
 * @returns {Promise<AxiosResponse>} Array of rounds with formattedValuation, progressSummary
 */
export const getRounds = () => api.get('/fundraising/rounds');

/**
 * Get single round with comprehensive data and related investors
 * @param {string} id - Round ID
 * @returns {Promise<AxiosResponse>} Round with investors, cap table entries, validation
 */
export const getRoundById = (id) => api.get(`/fundraising/rounds/${id}`);

/**
 * Update round with potential recalculation of valuations
 * @param {string} id - Round ID
 * @param {object} roundData - Updated round data
 * @returns {Promise<AxiosResponse>} Updated round with recalculation status
 */
export const updateRound = (id, roundData) => api.put(`/fundraising/rounds/${id}`, roundData);

/**
 * Delete round with comprehensive cleanup
 * @param {string} id - Round ID
 * @returns {Promise<AxiosResponse>} Deletion confirmation
 */
export const deleteRound = (id) => api.delete(`/fundraising/rounds/${id}`);

// --- NEW ROUND CALCULATION & PREVIEW ENDPOINTS ---

/**
 * Preview investment impact before actual investment
 * @param {string} roundId - Round ID
 * @param {object} investmentData - Investment details
 * @param {number} investmentData.investmentAmount - Amount to invest
 * @returns {Promise<AxiosResponse>} Impact preview with shares, equity %, new totals
 */
export const previewInvestmentImpact = (roundId, investmentData) => 
  api.post(`/fundraising/rounds/${roundId}/preview-investment`, investmentData);

/**
 * Manually trigger round metrics recalculation
 * @param {string} roundId - Round ID
 * @returns {Promise<AxiosResponse>} Updated round metrics and calculation results
 */
export const recalculateRoundMetrics = (roundId) => 
  api.post(`/fundraising/rounds/${roundId}/recalculate`);

// --- ENHANCED INVESTOR MANAGEMENT ---

/**
 * Add investor with automatic equity allocation calculation
 * @param {object} investorData - Investor data
 * @param {string} investorData.name - Investor name
 * @param {number} investorData.totalCommittedAmount - Total commitment
 * @param {string} investorData.roundId - Associated round ID
 * @param {string} investorData.investmentVehicle - SAFE, Equity, etc.
 * @returns {Promise<AxiosResponse>} Investor with calculated equity allocation
 */
export const addInvestor = (investorData) => api.post('/fundraising/investors', investorData);

/**
 * Get all investors with enhanced investment summary data
 * @param {object} [params] - Query parameters
 * @param {string} [params.roundId] - Filter by round ID
 * @returns {Promise<AxiosResponse>} Array of investors with investmentSummary
 */
export const getInvestors = (params) => api.get('/fundraising/investors', { params }); // Used by getAvailableInvestors

/**
 * Get single investor with comprehensive investment data
 * @param {string} id - Investor ID
 * @returns {Promise<AxiosResponse>} Investor with investment summary, cap table entry
 */
export const getInvestorById = (id) => api.get(`/fundraising/investors/${id}`);

/**
 * Update investor with potential equity recalculation
 * @param {string} id - Investor ID
 * @param {object} investorData - Updated investor data
 * @returns {Promise<AxiosResponse>} Updated investor with recalculation status
 */
export const updateInvestor = (id, investorData) => api.put(`/fundraising/investors/${id}`, investorData);

/**
 * Delete investor with comprehensive cleanup of cap table and round data
 * @param {string} id - Investor ID
 * @returns {Promise<AxiosResponse>} Deletion confirmation
 */
export const deleteInvestor = (id) => api.delete(`/fundraising/investors/${id}`);

// --- ENHANCED TRANCHE MANAGEMENT ---

/**
 * Add tranche to investor with share allocation calculation
 * @param {string} investorId - Investor ID
 * @param {object} trancheData - Tranche data
 * @param {number} trancheData.trancheNumber - Tranche number
 * @param {number} trancheData.agreedAmount - Agreed amount
 * @param {number} [trancheData.receivedAmount] - Amount actually received
 * @param {string} [trancheData.paymentMethod] - Payment method
 * @returns {Promise<AxiosResponse>} Updated investor with new tranche
 */
export const addTranche = (investorId, trancheData) => api.post(`/fundraising/investors/${investorId}/tranches`, trancheData);

/**
 * Update tranche with payment processing and equity allocation
 * @param {string} investorId - Investor ID
 * @param {string} trancheId - Tranche ID
 * @param {object} trancheData - Updated tranche data
 * @param {number} [trancheData.receivedAmount] - Amount received
 * @param {string} [trancheData.paymentMethod] - Payment method
 * @param {string} [trancheData.transactionReference] - Transaction reference
 * @returns {Promise<AxiosResponse>} Updated investor with payment processing results
 */
export const updateTranche = (investorId, trancheId, trancheData) => api.put(`/fundraising/investors/${investorId}/tranches/${trancheId}`, trancheData);

/**
 * Delete tranche with payment and equity cleanup
 * @param {string} investorId - Investor ID
 * @param {string} trancheId - Tranche ID
 * @returns {Promise<AxiosResponse>} Updated investor after tranche removal
 */
export const deleteTranche = (investorId, trancheId) => api.delete(`/fundraising/investors/${investorId}/tranches/${trancheId}`);

// --- ENHANCED CAP TABLE MANAGEMENT ---

/**
 * Add cap table entry with automatic calculations
 * @param {object} entryData - Cap table entry data
 * @param {string} entryData.shareholderName - Shareholder name
 * @param {string} entryData.shareholderType - Founder, Investor, etc.
 * @param {number} entryData.numberOfShares - Number of shares
 * @param {string} entryData.securityType - Common Stock, Preferred, etc.
 * @returns {Promise<AxiosResponse>} Cap table entry with formattedInfo, ROI
 */
export const addCapTableEntry = (entryData) => api.post('/fundraising/captable', entryData);

/**
 * Get enhanced cap table summary with statistics and equity percentages
 * @returns {Promise<AxiosResponse>} Enhanced entries with summary stats, ROI calculations
 */
export const getCapTableSummary = () => api.get('/fundraising/captable');

/**
 * Get single cap table entry with enhanced data
 * @param {string} id - Cap table entry ID
 * @returns {Promise<AxiosResponse>} Entry with formattedInfo, ROI calculations
 */
export const getCapTableEntryById = (id) => api.get(`/fundraising/captable/${id}`);

/**
 * Update cap table entry with value recalculation
 * @param {string} id - Cap table entry ID
 * @param {object} entryData - Updated entry data
 * @returns {Promise<AxiosResponse>} Updated entry with recalculated values
 */
export const updateCapTableEntry = (id, entryData) => api.put(`/fundraising/captable/${id}`, entryData);

/**
 * Delete cap table entry with equity percentage adjustment
 * @param {string} id - Cap table entry ID
 * @returns {Promise<AxiosResponse>} Deletion confirmation
 */
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

// --- Predictive Analytics (Analytics Routes) - COMPLETE CRUD ---

// Runway Scenarios
export const createRunwayScenario = (data) => api.post('/analytics/runway-scenarios', data);
export const getRunwayScenarios = () => api.get('/analytics/runway-scenarios');
export const getRunwayScenarioById = (id) => api.get(`/analytics/runway-scenarios/${id}`);
export const updateRunwayScenario = (id, data) => api.put(`/analytics/runway-scenarios/${id}`, data);
export const deleteRunwayScenario = (id) => api.delete(`/analytics/runway-scenarios/${id}`);
export const compareRunwayScenarios = () => api.get('/analytics/runway-scenarios/compare');

// Fundraising Predictions
export const createFundraisingPrediction = (data) => api.post('/analytics/fundraising-predictions', data);
export const getFundraisingPredictions = () => api.get('/analytics/fundraising-predictions');
export const getFundraisingPredictionById = (id) => api.get(`/analytics/fundraising-predictions/${id}`);
export const updateFundraisingPrediction = (id, data) => api.put(`/analytics/fundraising-predictions/${id}`, data);
export const deleteFundraisingPrediction = (id) => api.delete(`/analytics/fundraising-predictions/${id}`);
export const getFundraisingReadiness = () => api.get('/analytics/fundraising-readiness');
export const getMarketComparables = (params) => api.get('/analytics/market-comparables', { params });

// Cash Flow Forecasts
export const createCashFlowForecast = (data) => api.post('/analytics/cash-flow-forecasts', data);
export const getCashFlowForecasts = () => api.get('/analytics/cash-flow-forecasts');
export const getCashFlowForecastById = (id) => api.get(`/analytics/cash-flow-forecasts/${id}`);
export const updateCashFlowForecast = (id, data) => api.put(`/analytics/cash-flow-forecasts/${id}`, data);
export const deleteCashFlowForecast = (id) => api.delete(`/analytics/cash-flow-forecasts/${id}`);
export const getHistoricalCashFlowData = () => api.get('/analytics/cash-flow-data/historical');
export const getCurrentCashPosition = () => api.get('/analytics/cash-position/current');

// Revenue Cohorts
export const createRevenueCohort = (data) => api.post('/analytics/revenue-cohorts', data);
export const getRevenueCohorts = () => api.get('/analytics/revenue-cohorts');
export const getRevenueCohortById = (id) => api.get(`/analytics/revenue-cohorts/${id}`);
export const updateRevenueCohort = (id, data) => api.put(`/analytics/revenue-cohorts/${id}`, data);
export const deleteRevenueCohort = (id) => api.delete(`/analytics/revenue-cohorts/${id}`);
export const generateCohortProjections = (cohortId, data) => api.post(`/analytics/revenue-cohorts/${cohortId}/projections`, data);
export const getCohortsComparison = () => api.get('/analytics/revenue-cohorts/compare');

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

// Aliases for frontend compatibility (shorter names)
export const addMilestoneTask = addProductMilestoneTask;
export const updateMilestoneTask = updateProductMilestoneTask;
export const deleteMilestoneTask = deleteProductMilestoneTask;

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

export const updateCohortMetrics = (cohortId, metricsData) => 
  api.patch(`/analytics/revenue-cohorts/${cohortId}/metrics`, { metrics: metricsData });

// --- Utility functions for frontend ---
export const getAvailableInvestors = (params) => getInvestors(params); // Re-uses getInvestors
export const getAvailableTeamMembers = (params) => getHeadcounts(params); // Re-uses getHeadcounts


// --- Task Management (from /tasks routes) ---

// Task CRUD Operations
export const createTask = (taskData) => api.post('/tasks', taskData);
export const getTasks = (params) => api.get('/tasks', { params });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const archiveTask = (id) => api.delete(`/tasks/${id}`);
export const getTaskSubcategories = (category) => api.get('/tasks/subcategories', { params: { category } });
// Task Assignment & Watchers
export const assignTask = (id, data) => api.post(`/tasks/${id}/assign`, data);
export const updateTaskWatchers = (id, data) => api.post(`/tasks/${id}/watchers`, data);

// Task Comments
export const getTaskComments = (taskId) => api.get(`/tasks/${taskId}/comments`);
export const addTaskComment = (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData);
export const updateTaskComment = (taskId, commentId, commentData) => api.put(`/tasks/${taskId}/comments/${commentId}`, commentData);
export const deleteTaskComment = (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`);

// Task Analytics
export const getTaskStats = (params) => api.get('/tasks/stats', { params });

// Helper function to format task filters
export const formatTaskFilters = (filters) => {
  const params = {};
  
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
  if (filters.assignee && filters.assignee !== 'all') params.assignee = filters.assignee;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.search) params.search = filters.search;
  if (filters.myTasks) params.myTasks = 'true';
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  
  return params;
};

export default api;