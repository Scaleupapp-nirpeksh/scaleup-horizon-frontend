// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api'; // Use the updated api.js
import LoadingSpinner from '../components/common/LoadingSpinner'; // Assuming you have this

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const clearAuthData = useCallback(() => {
    setUser(null);
    setActiveOrganization(null);
    setMemberships([]);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('activeOrganization');
    localStorage.removeItem('memberships');
  }, []);

  const handleAuthSuccess = useCallback((data) => {
    const { token, user: userData, activeOrganization: orgData, memberships: userMemberships } = data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('activeOrganization', JSON.stringify(orgData));
    localStorage.setItem('memberships', JSON.stringify(userMemberships || []));

    setUser(userData);
    setActiveOrganization(orgData);
    setMemberships(userMemberships || []);
    setIsAuthenticated(true);
  }, []);

  // Effect for initializing auth state from localStorage and validating session
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Validate token by fetching user data
          const { data } = await api.getMe();
          handleAuthSuccess({ token, ...data }); // getMe response includes user, activeOrganization, memberships
        } catch (error) {
          console.error('Session validation failed:', error);
          clearAuthData();
          // Optional: navigate to login if not on a public route
          // if (window.location.pathname !== '/login' && window.location.pathname !== '/register-owner' && !window.location.pathname.startsWith('/complete-setup')) {
          //   navigate('/login');
          // }
        }
      } else {
        // No token, ensure everything is cleared
        clearAuthData();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [clearAuthData, handleAuthSuccess, navigate]);


  // Effect for handling forced logout event from api.js interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      console.log('AuthContext: Detected forced logout event.');
      clearAuthData();
      // Navigate to login, but ensure it's not already on a public auth page
       if (window.location.pathname !== '/login' && window.location.pathname !== '/register-owner' && !window.location.pathname.startsWith('/complete-setup')) {
        navigate('/login');
      }
    };

    window.addEventListener('auth-logout', handleForcedLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForcedLogout);
    };
  }, [clearAuthData, navigate]);


  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.loginUser({ email, password });
      handleAuthSuccess(data);
      setIsLoading(false);
      return { success: true, activeOrganization: data.activeOrganization };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.msg || error.message);
      clearAuthData();
      setIsLoading(false);
      return { success: false, message: error.response?.data?.msg || 'Login failed. Please check your credentials.' };
    }
  };

  const registerOrganizationOwner = async (name, email, password, organizationName) => {
    setIsLoading(true);
    try {
      const { data } = await api.registerOrganizationOwner({ name, email, password, organizationName });
      handleAuthSuccess(data);
      setIsLoading(false);
      return { success: true, message: data.msg || 'Registration successful!' };
    } catch (error) {
      console.error('Owner registration failed:', error.response?.data?.msg || error.message);
      clearAuthData();
      setIsLoading(false);
      return { success: false, message: error.response?.data?.msg || 'Registration failed. Please try again.' };
    }
  };

  const completeAccountSetup = async (setupToken, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.completeAccountSetup(setupToken, { password });
      handleAuthSuccess(data);
      setIsLoading(false);
      return { success: true, message: data.msg || 'Account setup successful!' };
    } catch (error) {
      console.error('Account setup failed:', error.response?.data?.msg || error.message);
      clearAuthData(); // Keep user logged out if setup fails
      setIsLoading(false);
      return { success: false, message: error.response?.data?.msg || 'Account setup failed. Please try again.' };
    }
  };
  
  const logout = useCallback(async () => {
    setIsLoading(true);
    // Optionally, call a backend logout endpoint if you have one
    // await api.logoutUser(); 
    clearAuthData();
    setIsLoading(false);
    navigate('/login');
  }, [clearAuthData, navigate]);

  const switchOrganization = async (organizationId) => {
    setIsLoading(true);
    try {
      const { data } = await api.setActiveOrganization({ organizationId });
      // setActiveOrganization response includes the new token and activeOrganization details
      const { token, activeOrganization: newActiveOrg } = data;

      localStorage.setItem('authToken', token); // Update token
      localStorage.setItem('activeOrganization', JSON.stringify(newActiveOrg));
      
      // It's also good practice to refresh all memberships and user details
      // as roles or other aspects might change contextually with the new org.
      // For simplicity, we'll use the direct response here, but getMe() could be an alternative.
      const meResponse = await api.getMe();
      handleAuthSuccess({ token, ...meResponse.data });

      // setActiveOrganization(newActiveOrg); // This is handled by handleAuthSuccess via getMe
      
      setIsLoading(false);
      return { success: true, activeOrganization: newActiveOrg };
    } catch (error) {
      console.error('Switching organization failed:', error.response?.data?.msg || error.message);
      // Potentially revert to old active org or handle error state
      setIsLoading(false);
      return { success: false, message: error.response?.data?.msg || 'Failed to switch organization.' };
    }
  };

  // Function to refresh user data, including active org and memberships
  const refreshAuthData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token && isAuthenticated) { // Only refresh if authenticated
      setIsLoading(true);
      try {
        const { data } = await api.getMe();
        handleAuthSuccess({ token, ...data });
      } catch (error) {
        console.error('Failed to refresh auth data:', error);
        // If getMe fails, it might mean the session is invalid, so logout
        logout();
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, handleAuthSuccess, logout]);


  if (isLoading && !children) { // If initial loading and no children (e.g. app not rendered yet)
    return <LoadingSpinner fullScreen message="Initializing session..." />;
  }
  
  const contextValue = {
    user,
    activeOrganization,
    memberships,
    isAuthenticated,
    isLoading,
    login,
    logout,
    registerOrganizationOwner,
    completeAccountSetup,
    switchOrganization,
    refreshAuthData, // Expose refresh function
    // For internal use by components if needed, or for debugging
    _handleAuthSuccess: handleAuthSuccess, 
    _clearAuthData: clearAuthData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
