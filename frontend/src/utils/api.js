// API utility functions for communicating with the backend

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api"

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      credentials: 'include', // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle empty responses
      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { message: text }
      }

      if (!response.ok) {
        // Create a custom error object with response details
        const error = new Error(data.error || data.message || `Request failed with status ${response.status}`)
        error.response = {
          status: response.status,
          data: data
        }
        error.status = response.status
        throw error
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      
      // If error already has response details (like 503 from backend), preserve it
      if (error.response) {
        throw error
      }
      
      // Only enhance error message for pure network failures (no response at all)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const networkError = new Error('Unable to connect to server. Please check your internet connection.')
        networkError.isNetworkError = true
        networkError.code = 'ERR_NETWORK'
        throw networkError
      }
      
      throw error
    }
  }

  // Payment simulation API
  async simulatePaymentAsync(paymentData) {
    return this.request("/simulate-payment", {
      method: "POST",
      body: JSON.stringify({
        email: paymentData.email,
        payment_status: paymentData.payment_status,
        txn_id: paymentData.txn_id,
        couponcode_applied: paymentData.couponcode_applied,
        discount_percentage: paymentData.discount_percentage,
      }),
    })
  }

  // Contact form submission
  async submitContactForm(formData) {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile || "NA",
        query: formData.query, // Matches Google Sheets "query" field
      }),
    })
  }

  // User Authentication APIs
  async registerUser(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async loginUser(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async verifyToken(token) {
    return this.request("/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async verifyTokenFromCookie() {
    return this.request("/auth/verify", {
      method: "GET",
    })
  }

  async refreshToken(token) {
    return this.request("/auth/refresh", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async logoutUser() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // Get webinar information
  async getWebinarInfo() {
    return this.request("/webinar-info")
  }

  // Health check
  async healthCheck() {
    return this.request("/health")
  }

  // Admin Authentication APIs
  async adminLogin(credentials) {
    return this.request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getAdminDashboard(token) {
    return this.request("/admin/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async refreshAdminToken(token) {
    return this.request("/admin/refresh-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Coupon validation API
  async validateCoupon(couponData) {
    return this.request("/validate-coupon", {
      method: "POST",
      body: JSON.stringify(couponData),
    })
  }

  // AI Chat API
  async sendChatMessage(messageData) {
    return this.request("/ai-chat", {
      method: "POST",
      body: JSON.stringify(messageData),
    })
  }

  // Settings Management APIs
  async getSettings() {
    return this.request("/settings", {
      method: "GET",
    })
  }

  async updateSettings(settingsData, adminToken) {
    return this.request("/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(settingsData),
    })
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient()
export default apiClient

// Helper function to store user data in localStorage
export const userStorage = {
  setUserData: (userData, rememberMe = false) => {
    localStorage.setItem("userData", JSON.stringify(userData))
    localStorage.setItem("rememberMe", rememberMe.toString())
    if (userData.email) {
      localStorage.setItem("userEmail", userData.email)
    }
  },

  getUserData: () => {
    const data = localStorage.getItem("userData")
    return data ? JSON.parse(data) : null
  },

  getUserEmail: () => {
    return localStorage.getItem("userEmail") || ""
  },

  getRememberMe: () => {
    return localStorage.getItem("rememberMe") === "true"
  },

  clearUserData: () => {
    localStorage.removeItem("userData")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("whatsappLink")
    localStorage.removeItem("authUser")
    localStorage.removeItem("authToken")
    localStorage.removeItem("rememberMe")
  },

  setWhatsAppLink: (link) => {
    localStorage.setItem("whatsappLink", link)
  },

  getWhatsAppLink: () => {
    return localStorage.getItem("whatsappLink") || ""
  },
}

// Error handling utility
export const handleApiError = (error) => {
  if (error.message.includes("Failed to fetch")) {
    return "Network error. Please check your connection and try again."
  }

  if (error.message.includes("500")) {
    return "Server error. Please try again later."
  }

  return error.message || "An unexpected error occurred."
}
