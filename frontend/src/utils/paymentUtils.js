/**
 * Centralized Payment Status Utilities
 * 
 * This file contains all payment status related logic
 * Use these functions throughout the app instead of direct comparisons
 */

/**
 * Payment status constants from backend
 */
export const PAYMENT_STATUS = {
  SUCCESS: "Success",
  NEED_TIME: "Need Time",
  FAILURE: "Failure",
  NULL: null
}

/**
 * Check if user has completed payment successfully
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if payment is successful
 */
export const hasCompletedPayment = (user) => {
  if (!user) return false
  
  const status = user.payment_status
  
  // Handle different case variations (backend should use "Success")
  return status === "Success" || 
         status === "success" || 
         status === "SUCCESS"
}

/**
 * Check if user needs time to complete payment
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if status is "Need Time"
 */
export const needsTimeToPayment = (user) => {
  if (!user) return false
  
  const status = user.payment_status
  return status === "Need Time" || 
         status === "need_time" || 
         status === "NEED_TIME"
}

/**
 * Check if payment has failed
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if payment failed
 */
export const hasFailedPayment = (user) => {
  if (!user) return false
  
  const status = user.payment_status
  return status === "Failure" || 
         status === "failure" || 
         status === "FAILURE" ||
         status === "failed" ||
         status === "Failed"
}

/**
 * Check if user has no payment status (null or undefined)
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if no payment attempted
 */
export const hasNoPaymentStatus = (user) => {
  if (!user) return true
  
  return !user.payment_status || 
         user.payment_status === null || 
         user.payment_status === undefined
}

/**
 * Get user's payment status in standardized format
 * @param {Object} user - User object from AuthContext
 * @returns {string} - Standardized payment status
 */
export const getPaymentStatus = (user) => {
  if (!user || !user.payment_status) {
    return PAYMENT_STATUS.NULL
  }
  
  const status = user.payment_status
  
  // Normalize to standard format
  if (status === "Success" || status === "success" || status === "SUCCESS") {
    return PAYMENT_STATUS.SUCCESS
  }
  
  if (status === "Need Time" || status === "need_time" || status === "NEED_TIME") {
    return PAYMENT_STATUS.NEED_TIME
  }
  
  if (status === "Failure" || status === "failure" || status === "FAILURE" || status === "failed") {
    return PAYMENT_STATUS.FAILURE
  }
  
  return status
}

/**
 * Check if user should see payment CTA buttons
 * @param {Object} user - User object from AuthContext
 * @param {boolean} isAuthenticated - Authentication status
 * @returns {boolean} - True if should show payment buttons
 */
export const shouldShowPaymentButton = (user, isAuthenticated) => {
  // Not authenticated = should show "Register/Interest" button
  if (!isAuthenticated || !user) {
    return false
  }
  
  // Already paid = don't show payment button
  if (hasCompletedPayment(user)) {
    return false
  }
  
  // Need time or failed or no status = show payment button
  return true
}

/**
 * Get appropriate redirect path based on payment status
 * @param {Object} user - User object from AuthContext
 * @returns {string} - Path to redirect to
 */
export const getPaymentRedirectPath = (user) => {
  if (hasCompletedPayment(user)) {
    return "/payment-success"
  }
  
  if (needsTimeToPayment(user)) {
    return "/thank-you"
  }
  
  if (hasFailedPayment(user)) {
    return "/payment-failed"
  }
  
  return "/payment"
}

/**
 * Get appropriate button text based on payment status
 * @param {Object} user - User object from AuthContext
 * @param {boolean} isAuthenticated - Authentication status
 * @returns {string} - Button text to display
 */
export const getPaymentButtonText = (user, isAuthenticated) => {
  if (!isAuthenticated || !user) {
    return "💡 I'm Interested"
  }
  
  if (hasCompletedPayment(user)) {
    return "✅ View Payment Details"
  }
  
  return "💳 Complete Payment"
}

/**
 * Log payment status for debugging (only in development)
 * @param {Object} user - User object from AuthContext
 * @param {string} component - Component name for logging
 */
export const logPaymentStatus = (user, component = "Unknown") => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [${component}] Payment Status:`, {
      raw_status: user?.payment_status,
      type: typeof user?.payment_status,
      hasCompletedPayment: hasCompletedPayment(user),
      needsTime: needsTimeToPayment(user),
      hasFailed: hasFailedPayment(user),
      hasNoStatus: hasNoPaymentStatus(user)
    })
  }
}
