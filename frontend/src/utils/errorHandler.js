/**
 * Centralized error handler utility
 * Provides consistent error messages across the application
 */

/**
 * Get user-friendly error message from error object
 * @param {Error} error - The error object
 * @param {string} context - Context of the error (e.g., 'payment', 'coupon', 'login')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, context = 'general') => {
  // Network/Connection errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Connection failed. Please check your internet connection.';
  }

  // Timeout errors
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // HTTP Status errors
  if (error.message.includes('HTTP 400')) {
    return 'Please check your information and try again.';
  }

  if (error.message.includes('HTTP 401')) {
    return 'Authentication failed. Please log in again.';
  }

  if (error.message.includes('HTTP 403')) {
    return 'Access denied. You do not have permission.';
  }

  if (error.message.includes('HTTP 404')) {
    return 'Service unavailable. Please try again later.';
  }

  if (error.message.includes('HTTP 500')) {
    return 'Server error. Please try again later.';
  }

  // Context-specific error messages
  switch (context) {
    case 'payment':
      return 'Payment could not be processed. Please try again.';
    case 'coupon':
      return 'Unable to validate coupon. Please try again.';
    case 'login':
      return 'Login failed. Please check your credentials.';
    case 'registration':
      return 'Registration failed. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

/**
 * Log error to console in development mode
 * @param {Error} error - The error object
 * @param {string} context - Context of the error
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ Error${context ? ` [${context}]` : ''}:`, error);
  }
};

/**
 * Handle API error response
 * @param {Response} response - Fetch response object
 * @returns {Promise<never>} Throws an error with details
 */
export const handleApiError = async (response) => {
  const errorText = await response.text();
  const error = new Error(`HTTP ${response.status}: ${errorText}`);
  error.status = response.status;
  error.response = errorText;
  throw error;
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return error.name === 'TypeError' && error.message.includes('fetch');
};

/**
 * Check if error is a timeout error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return error.message.includes('timeout');
};
