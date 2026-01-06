import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

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
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginName, password) => {
    try {
      setError(null);
      const data = await authAPI.login(loginName, password);
      localStorage.setItem('token', data.access_token);
      // Include is_admin from response
      setUser({
        ...data.user,
        is_admin: data.user.is_admin || false
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Ошибка входа';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (loginName, password, passwordHint) => {
    try {
      setError(null);
      const data = await authAPI.register(loginName, password, passwordHint);
      localStorage.setItem('token', data.access_token);
      // Include is_admin from response (always false for new users)
      setUser({
        ...data.user,
        is_admin: data.user.is_admin || false
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Ошибка регистрации';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getPasswordHint = async (loginName) => {
    try {
      const data = await authAPI.getPasswordHint(loginName);
      return { success: true, hint: data.hint };
    } catch (err) {
      const message = err.response?.data?.detail || 'Пользователь не найден';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (loginName, newPassword) => {
    try {
      await authAPI.resetPassword(loginName, newPassword);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Ошибка сброса пароля';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getPasswordHint,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
