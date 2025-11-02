import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 

// Email validation utility
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem('authUser');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        
        // Verify token with backend (this will also check cookies)
        try {
          const response = await apiClient.verifyToken(storedToken);
          if (response.success) {
            setUser(response.user);
            setIsAuthenticated(true);
            console.log('✅ User authenticated from stored session');
            return;
          }
        } catch (error) {
          console.log('🔄 Stored token invalid, checking cookies...');
          // Clear invalid stored data
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
        }
      }
      
      // Check for cookie-based authentication
      try {
        const response = await apiClient.verifyTokenFromCookie();
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
          // Store user data for quick access
          localStorage.setItem('authUser', JSON.stringify(response.user));
          console.log('✅ User authenticated from cookie');
          return;
        }
      } catch (error) {
        console.log('❌ No valid authentication found');
      }
      
      // No valid authentication found
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('Authentication initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      // Validate email format
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      const response = await apiClient.loginUser({ email: email.trim().toLowerCase(), password, rememberMe });
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Store authentication data
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        console.log('✅ User logged in successfully');
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling for login
      if (error.response?.status === 404) {
        const enhancedError = new Error('No account found with this email address');
        enhancedError.suggestion = 'Please register for our webinar first';
        enhancedError.actionType = 'SUGGEST_SIGNUP';
        throw enhancedError;
      }
      
      if (error.response?.status === 401) {
        const enhancedError = new Error('Invalid email or password');
        enhancedError.suggestion = 'Please check your credentials and try again';
        enhancedError.actionType = 'RETRY_LOGIN';
        throw enhancedError;
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await apiClient.logoutUser();
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('rememberMe');
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ User logged out');
    }
  };

  const refreshAuth = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        throw new Error('No token to refresh');
      }
      
      const response = await apiClient.refreshToken(storedToken);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        console.log('✅ Authentication refreshed');
        return response;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Refresh auth error:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  // Auto-refresh token periodically for remembered sessions
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) return;
    
    // Refresh token every 6 days for remembered sessions (before 7-day expiry)
    const refreshInterval = setInterval(() => {
      refreshAuth().catch(() => {
        // Refresh failed, user will be logged out
        console.log('Auto-refresh failed, user logged out');
      });
    }, 6 * 24 * 60 * 60 * 1000); // 6 days
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, user]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;