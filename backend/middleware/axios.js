const axios = require("axios")

// Create axios instance with default configuration
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Webinar-Sales-Funnel/1.0.0",
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.response.config.url}`)
      console.error("Error data:", error.response.data)
    } else if (error.request) {
      console.error("❌ Network Error:", error.message)
    } else {
      console.error("❌ Request Setup Error:", error.message)
    }
    return Promise.reject(error)
  },
)

module.exports = axiosInstance
