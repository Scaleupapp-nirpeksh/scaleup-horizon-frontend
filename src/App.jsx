// src/App.jsx
// Main application component: Sets up routing and authentication context.
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FinancialsPage from './pages/FinancialsPage';
import FundraisingPage from './pages/FundraisingPage';
import KpisPage from './pages/KpisPage';
//import AnalyticsPage from './pages/AnalyticsPage'; // Assuming this might be added later
import ReportsPage from './pages/ReportsPage';
import BudgetPage from './pages/BudgetPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './utils/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import InvestorMeetingsPage from './pages/InvestorMeetingsPage';
import HeadcountPage from './pages/HeadcountPage';
import LiveInvestorDashboardPage from './pages/LiveInvestorDashboardPage'; // NEW: Import the new page

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthLoadingGate>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/dashboard" replace />} /> {/* Default to dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="financials" element={<FinancialsPage />} />
                <Route path="fundraising" element={<FundraisingPage />} />
                <Route path="kpis" element={<KpisPage />} />
                <Route path="investor-meetings" element={<InvestorMeetingsPage />} /> 
                <Route path="headcount" element={<HeadcountPage />} /> 
                <Route path="reports" element={<ReportsPage />} />
                <Route path="budgets" element={<BudgetPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* NEW: Route for the Live Investor Dashboard */}
                <Route path="investor-dashboard" element={<LiveInvestorDashboardPage />} /> 
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthLoadingGate>
      </Router>
    </AuthProvider>
  );
}

const AuthLoadingGate = ({ children }) => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Initializing App..." />;
  }
  return children;
};

export default App;
