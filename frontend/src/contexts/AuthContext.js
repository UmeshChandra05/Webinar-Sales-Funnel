import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { 
  hasCompletedPayment, 
  shouldShowPaymentButton, 
  getPaymentRedirectPath,
  getPaymentButtonText,
  logPaymentStatus 
} from '../utils/paymentUtils';

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
        
        // Smart verification: Skip n8n call if payment already completed
        const skipFreshData = userData.payment_status === "Success";
        
        if (skipFreshData) {
          // Payment completed - trust localStorage, just verify token validity
          console.log('💰 Payment completed - using cached data');
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Payment not completed - verify with backend to get fresh status
        try {
          console.log('🔄 Payment pending - fetching fresh data from backend');
          const response = await apiClient.verifyToken(storedToken);
          if (response.success) {
            setUser(response.user);
            setIsAuthenticated(true);
            // Update localStorage with fresh data
            localStorage.setItem('authUser', JSON.stringify(response.user));
            console.log('✅ User authenticated with fresh data');
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
        
        // CRITICAL: Update userEmail for payment page compatibility
        localStorage.setItem('userEmail', response.user.email);
        
        console.log('✅ User logged in successfully');
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error code:', error.code);
      
      // Clean error handling for login - check service availability first
      if (error.response?.status === 503) {
        const message = error.response?.data?.message || 'Service temporarily unavailable. Please try again later.';
        console.log('🔌 503 Service unavailable error detected:', message);
        throw new Error(message);
      }
      
      if (error.response?.status === 404) {
        throw new Error(error.response?.data?.message || 'No account found with this email address');
      }
      
      if (error.response?.status === 401) {
        throw new Error(error.response?.data?.message || 'Invalid email or password');
      }
      
      // Handle network errors (when n8n is completely down and backend can't respond)
      if (error.code === 'ERR_NETWORK' || error.isNetworkError || !error.response) {
        console.log('🔌 Network error detected - complete connection failure');
        throw new Error('Service temporarily unavailable. Please check your connection and try again later.');
      }
      
      // If error has a message property, use it
      if (error.message && !error.message.includes('HTTP')) {
        throw error;
      }
      
      // Fallback
      throw new Error('Login failed. Please try again later.');
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
      localStorage.removeItem('userEmail'); // Clear payment email tracking
      localStorage.removeItem('userData'); // Clear legacy user data
      localStorage.removeItem('whatsappLink'); // Clear temporary payment data
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

  const refreshUserData = async (forceRefresh = false) => {
    try {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        console.warn('No token available to refresh user data');
        return null;
      }
      
      // Smart refresh: Skip if payment already completed (unless forced)
      if (!forceRefresh && user?.payment_status === "Success") {
        console.log('⏭️ Skipping refresh - payment already completed');
        return user;
      }
      
      console.log('🔄 Refreshing user data from backend...');
      
      // Use verify token to get latest user data (backend will fetch from n8n)
      const response = await apiClient.verifyToken(storedToken);
      if (response.success && response.user) {
        // Update state first
        setUser(response.user);
        
        // Then update localStorage with fresh data
        localStorage.setItem('authUser', JSON.stringify(response.user));
        
        console.log('✅ User data refreshed:', {
          payment_status: response.user.payment_status,
          timestamp: new Date().toISOString()
        });
        
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh user data error:', error);
      return null;
    }
  };

  /**
   * Update user payment status locally (for immediate UI update)
   * This should be called after successful payment simulation
   * Backend will be source of truth on next verification
   */
  const updateUserPaymentStatus = (paymentStatus) => {
    if (!user) {
      console.warn('Cannot update payment status: no user logged in');
      return;
    }

    console.log('🔄 Updating local payment status:', paymentStatus);
    
    const updatedUser = {
      ...user,
      payment_status: paymentStatus
    };
    
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    
    console.log('✅ Local payment status updated:', {
      old: user.payment_status,
      new: paymentStatus,
      timestamp: new Date().toISOString()
    });
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
    refreshUserData,
    updateUserPaymentStatus,
    initializeAuth,
    // Centralized payment utilities
    hasCompletedPayment: () => hasCompletedPayment(user),
    shouldShowPaymentButton: () => shouldShowPaymentButton(user, isAuthenticated),
    getPaymentRedirectPath: () => getPaymentRedirectPath(user),
    getPaymentButtonText: () => getPaymentButtonText(user, isAuthenticated)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;