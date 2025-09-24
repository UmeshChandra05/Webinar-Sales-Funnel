const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const leadController = {
  captureLeadAsync: async (req, res) => {
    try {
      const { name, email, phone, source } = req.body

      const leadData = {
        name,
        email,
        phone: phone || "",
        source: source || "website",
        timestamp: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      }

      console.log("📝 Capturing lead:", { email, name, source })

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/capture-lead`, leadData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("✅ Lead sent to n8n successfully")

          return res.status(200).json({
            success: true,
            message: "Lead captured successfully",
            data: {
              id: response.data?.id || `lead_${Date.now()}`,
              timestamp: leadData.timestamp,
            },
          })
        } catch (apiError) {
          console.error("❌ n8n API Error:", apiError.message)
          // Continue with local success response even if external API fails
        }
      }

      // Return success response (local fallback)
      res.status(200).json({
        success: true,
        message: "Lead captured successfully",
        data: {
          id: `lead_${Date.now()}`,
          timestamp: leadData.timestamp,
        },
      })
    } catch (error) {
      console.error("❌ Lead capture error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to capture lead",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },

  handleContactForm: async (req, res) => {
    try {
      const { name, email, message } = req.body

      const contactData = {
        name,
        email,
        message,
        type: "contact_form",
        timestamp: new Date().toISOString(),
        ip_address: req.ip,
      }

      console.log("📧 Contact form submission:", { email, name })

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          await axios.post(`${API_BASE_URL}/contact-form`, contactData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })
          console.log("✅ Contact form sent to n8n successfully")
        } catch (apiError) {
          console.error("❌ Contact form n8n API Error:", apiError.message)
        }
      }

      res.status(200).json({
        success: true,
        message: "Thank you for your message. We will get back to you soon!",
      })
    } catch (error) {
      console.error("❌ Contact form error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to send message",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },
}

module.exports = leadController
