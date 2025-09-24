// API utility functions for communicating with the backend

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api"

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Lead capture API
  async captureLeadAsync(leadData) {
    return this.request("/capture-lead", {
      method: "POST",
      body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || "",
        source: leadData.source || "website",
      }),
    })
  }

  // Payment simulation API
  async simulatePaymentAsync(paymentData) {
    return this.request("/simulate-payment", {
      method: "POST",
      body: JSON.stringify({
        email: paymentData.email,
        status: paymentData.status,
        transaction_id: paymentData.transaction_id,
      }),
    })
  }

  // Contact form API
  async submitContactForm(contactData) {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify({
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
      }),
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
}

// Create and export a singleton instance
const apiClient = new ApiClient()
export default apiClient

// Helper function to store user data in localStorage
export const userStorage = {
  setUserData: (userData) => {
    localStorage.setItem("userData", JSON.stringify(userData))
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

  clearUserData: () => {
    localStorage.removeItem("userData")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("whatsappLink")
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
