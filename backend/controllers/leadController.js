const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const leadController = {
  captureLeadAsync: async (req, res) => {
    try {
      const { name, email, phone, source, role } = req.body

      const leadData = {
        name,
        email,
        phone: phone || "",
        role: role || "",
        source: source || "website",
        timestamp: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      }

      console.log("📝 Capturing lead:", { email, name, role, source })

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

  handleAIChat: async (req, res) => {
    try {
      const { message, sessionId, userId } = req.body

      const chatData = {
        message,
        sessionId: sessionId || `chat_${Date.now()}`,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
        type: "ai_chat"
      }

      console.log("🤖 AI Chat request:", { userId, sessionId, messageLength: message.length })

      // If API_BASE_URL is configured, send to n8n webhook for AI processing
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          console.log("🔄 Sending to n8n:", `${API_BASE_URL}/ai-chat`)
          
          const response = await axios.post(`${API_BASE_URL}/ai-chat`, chatData, {
            timeout: 15000, // Longer timeout for AI processing
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("📊 n8n Response Status:", response.status)
          console.log("📋 n8n Response Data:", JSON.stringify(response.data, null, 2))

          // Extract the AI response from n8n
          let aiResponse = null;
          
          // Try different possible response formats from n8n
          if (response.data?.response) {
            aiResponse = response.data.response;
          } else if (response.data?.message) {
            aiResponse = response.data.message;
          } else if (response.data?.ai_response) {
            aiResponse = response.data.ai_response;
          } else if (response.data?.reply) {
            aiResponse = response.data.reply;
          } else if (typeof response.data === 'string') {
            aiResponse = response.data;
          } else {
            console.log("⚠️ Unknown n8n response format:", response.data);
            // Use a friendly fallback instead of exposing technical error
            aiResponse = "I'm currently down for maintenance. You can directly contact us from our Contact page or search in our FAQs for quick answers.";
          }

          console.log("✅ AI Chat processed successfully:", aiResponse)

          return res.status(200).json({
            success: true,
            response: aiResponse,
            sessionId: chatData.sessionId,
            timestamp: chatData.timestamp,
            source: "n8n"
          })
        } catch (apiError) {
          console.error("❌ AI Chat n8n API Error:", {
            message: apiError.message,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            data: apiError.response?.data
          })
          // Fall through to local response
        }
      }

      // Local fallback response when n8n is not available
      console.log("⚠️ Using fallback response - n8n not available or failed")
      
      const fallbackResponses = [
        "I'm currently down for maintenance. You can directly contact us from our Contact page or search in our FAQs for quick answers.",
        "Sorry, I'm temporarily unavailable. Please contact us directly from our Contact page or check our FAQs for immediate help.",
        "I'm currently down but you can get help right away! Contact us from our Contact page or search in our FAQs.",
        "Currently experiencing issues. You can directly contact us from our Contact page or find answers in our FAQs.",
        "I'm temporarily down for maintenance. Please contact us directly from our Contact page or browse our FAQs for quick solutions."
      ]

      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

      res.status(200).json({
        success: true,
        response: randomResponse,
        sessionId: chatData.sessionId,
        timestamp: chatData.timestamp,
        source: "fallback",
        note: "AI processing temporarily unavailable - using fallback response"
      })

    } catch (error) {
      console.error("❌ AI Chat error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to process AI chat",
        message: process.env.NODE_ENV === "production" ? "Sorry, I'm having trouble right now. Please try again later." : error.message,
      })
    }
  },
}

module.exports = leadController
