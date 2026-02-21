// src/App.jsx
// Main application component: Sets up routing and authentication context.
import React, { Suspense, useState, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import CompleteSetupPage from './components/auth/CompleteSetupPage';
import ProtectedRoute from './utils/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import './styles/KanbanBoard.css';

// Lazy-loaded pages for code splitting
const OnboardingExperience = lazy(() => import('./pages/OnboardingExperience'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FinancialsPage = lazy(() => import('./pages/FinancialsPage'));
const FundraisingPage = lazy(() => import('./pages/FundraisingPage'));
const KpisPage = lazy(() => import('./pages/KpisPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const OrganizationManagementPage = lazy(() => import('./pages/OrganizationManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const InvestorMeetingsPage = lazy(() => import('./pages/InvestorMeetingsPage'));
const HeadcountPage = lazy(() => import('./pages/HeadcountPage'));
const LiveInvestorDashboardPage = lazy(() => import('./pages/LiveInvestorDashboardPage'));
const ProductMilestonesPage = lazy(() => import('./pages/ProductMilestonesPage'));
const InvestorPresentationPage = lazy(() => import('./pages/InvestorPresentationPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
// Onboarding Wrapper Component
function OnboardingWrapper() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('scaleup_onboarding_completed');
    //const skipOnboarding = localStorage.getItem('scaleup_skip_onboarding'); // For development
    
    if (!hasCompletedOnboarding ) {
      setShowOnboarding(true);
    }
   //setShowOnboarding(true); 
    setOnboardingChecked(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('scaleup_onboarding_completed', 'true');
    setShowOnboarding(false);
    navigate('/login');
  };

  if (!onboardingChecked) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
        <OnboardingExperience onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
    <Routes>
      {/* Public Auth Routes - No AppLayout needed */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-owner" element={<RegisterPage />} /> 
      <Route path="/complete-setup/:setupToken" element={<CompleteSetupPage />} />

      {/* Investor Presentation Route - Outside of AppLayout for full screen */}
      <Route element={<ProtectedRoute />}>
        <Route path="/investor-presentation/:meetingId" element={<InvestorPresentationPage />} />
      </Route>
      
      {/* Routes with AppLayout (sidebar and header) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="financials" element={<FinancialsPage />} />
          <Route path="fundraising" element={<FundraisingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="kpis" element={<KpisPage />} />
          <Route path="investor-meetings" element={<InvestorMeetingsPage />} /> 
          <Route path="headcount" element={<HeadcountPage />} /> 
          <Route path="reports" element={<ReportsPage />} />
          <Route path="budgets" element={<BudgetPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          
          {/* Settings Routes */}
          <Route path="settings" element={<SettingsPage />} /> 
          <Route path="settings/organization" element={<OrganizationManagementPage />} />
          
          <Route path="product-milestones" element={<ProductMilestonesPage />} />
          <Route path="investor-dashboard" element={<LiveInvestorDashboardPage />} /> 
          
          <Route path="*" element={<NotFoundPage />} /> 
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthLoadingGate>
          <OnboardingWrapper />
        </AuthLoadingGate>
      </AuthProvider>
    </Router>
  );
}

const AuthLoadingGate = ({ children }) => {
  const { isLoading } = useAuth(); 
  
  if (isLoading) { 
    return <LoadingSpinner fullScreen message="Loading..." />;
  }
  return children;
};

export default App;