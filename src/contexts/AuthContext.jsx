// src/contexts/AuthContext.jsx
// Manages authentication state (token, user info) and provides login/logout functions.
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const verifyTokenAndSetUser = useCallback(async (currentToken) => {
    if (currentToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      // Optional: Add a /me endpoint in your backend to verify token and get user details
      // For now, we'll rely on the login response or stored user info
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    verifyTokenAndSetUser(currentToken);
  }, [verifyTokenAndSetUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, userName, userRole } = response.data;
      localStorage.setItem('authToken', newToken);
      const userData = { name: userName, role: userRole, email };
      localStorage.setItem('authUser', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.msg || error.message);
      return { success: false, message: error.response?.data?.msg || 'Login failed. Please check your credentials.' };
    }
  };

  const register = async (name, email, password, role = 'founder') => {
    try {
      await api.post('/auth/register', { name, email, password, role });
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.msg || error.message);
      return { success: false, message: error.response?.data?.msg || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);