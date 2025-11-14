

import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
                    try {
            const userData = await authService.getCurrentUser();
                        if (userData.data && userData.data.emailVerified) {
              setUser(userData.data);
            } else {
                            authService.logout();
              setUser(null);
            }
          } catch (error) {
                        authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
            authService.logout();
      setUser(null);
      
      const response = await authService.register(userData);
                        setUser(null);
      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      const userData = response.data.user;
      
            if (!userData.emailVerified) {
        setError('Please verify your email before logging in.');
        throw new Error('Email not verified');
      }
      
      setUser(userData);
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
