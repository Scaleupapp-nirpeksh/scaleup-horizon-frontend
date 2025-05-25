// src/App.jsx
// Main application component: Sets up routing and authentication context.
// AppLayout now unconditionally frames all content.
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
//import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import BudgetPage from './pages/BudgetPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './utils/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* The AuthLoadingGate handles the initial loading state from AuthContext */}
        <AuthLoadingGate>
          {/* AppLayout now wraps ALL routes, including login/register and 404 */}
          <Routes>
            <Route element={<AppLayout />}> {/* AppLayout is the parent for all pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes are nested to inherit AppLayout and then apply protection */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} /> {/* Default route after login */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="financials" element={<FinancialsPage />} />
                <Route path="fundraising" element={<FundraisingPage />} />
                <Route path="kpis" element={<KpisPage />} />
                
                <Route path="reports" element={<ReportsPage />} />
                <Route path="budgets" element={<BudgetPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Catch-all for 404, also within AppLayout */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthLoadingGate>
      </Router>
    </AuthProvider>
  );
}

// This component ensures that the main routing logic doesn't try to render
// AppLayout or its children while authentication is still loading.
const AuthLoadingGate = ({ children }) => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Initializing App..." />;
  }
  return children;
};

export default App;
