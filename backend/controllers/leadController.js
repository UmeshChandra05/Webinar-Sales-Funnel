const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const leadController = {
  handleContactForm: async (req, res) => {
    try {
      const { name, email, mobile, query } = req.body

      const contactData = {
        query,
        name,
        email,
        mobile: mobile || "NA",
        type: "contact_form",
        query_timestamp: new Date().toISOString(),
        ip_address: req.ip,
      }

      console.log("📧 Contact form submission:", { email, name })

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/contact-form`, contactData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })
          
          console.log("✅ Contact form sent to n8n successfully")
          
          // Return response from n8n if available
          return res.status(200).json({
            success: true,
            message: response.data?.message || "Thank you for your message. We will get back to you soon!",
            data: {
              ticket_id: response.data?.ticket_id || `ticket_${Date.now()}`,
              query_timestamp: contactData.query_timestamp,
            },
          })
        } catch (apiError) {
          console.error("❌ Contact form n8n API Error:", apiError.message)
          
          // Return error if n8n fails
          return res.status(503).json({
            success: false,
            error: "Failed to send message",
            message: "Contact form service temporarily unavailable. Please try again later.",
          })
        }
      }

      // Local fallback response (when n8n is not configured)
      res.status(200).json({
        success: true,
        message: "Thank you for your message. We will get back to you soon!",
        data: {
          ticket_id: `ticket_${Date.now()}`,
          query_timestamp: contactData.query_timestamp,
        },
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
      const { query, sessionId, userId } = req.body

      const chatData = {
        query,
        sessionId: sessionId || `chat_${Date.now()}`,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
        type: "ai_chat"
      }

      console.log("🤖 AI Chat request:", { userId, sessionId, messageLength: query.length })

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
          
          // Return error response when n8n fails
          return res.status(503).json({
            success: false,
            error: "AI service temporarily unavailable",
            message: "I'm currently down for maintenance. You can directly contact us from our Contact page or search in our FAQs for quick answers.",
            sessionId: chatData.sessionId,
            timestamp: chatData.timestamp,
            source: "error"
          })
        }
      }

      // Local fallback response when n8n is not configured
      console.log("⚠️ Using fallback response - n8n not configured")
      
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

  sendQueryResponse: async (req, res) => {
    try {
      const { 
        ticket_id, 
        name, 
        email, 
        mobile, 
        query, 
        query_reply, 
        query_category, 
        query_status, 
        query_resolved_by, 
        query_timestamp, 
        query_resolved_timestamp 
      } = req.body

      const responseData = {
        ticket_id,
        name: name || "N/A",
        email,
        mobile: mobile || "N/A",
        query: query || "",
        query_reply,
        query_category: query_category || "General",
        query_status: query_status || "Pending Approval",
        query_resolved_by: query_resolved_by || "Admin",
        query_timestamp: query_timestamp || new Date().toISOString(),
        query_resolved_timestamp: query_resolved_timestamp || new Date().toISOString(),
        type: "query_response",
        ip_address: req.ip,
      }

      console.log("📤 Sending query response:", { ticket_id, email })

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/send-response`, responseData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })
          
          console.log("✅ Query response sent to n8n successfully")
          
          // Return response from n8n if available
          return res.status(200).json({
            success: true,
            message: response.data?.message || "Response sent successfully!",
            data: {
              ticket_id: responseData.ticket_id,
              query_resolved_timestamp: responseData.query_resolved_timestamp,
            },
          })
        } catch (apiError) {
          console.error("❌ Send response n8n API Error:", apiError.message)
          
          // Return error if n8n fails
          return res.status(503).json({
            success: false,
            error: "Failed to send response",
            message: "Response service temporarily unavailable. Please try again later.",
          })
        }
      }

      // Local fallback response (when n8n is not configured)
      res.status(200).json({
        success: true,
        message: "Response sent successfully!",
        data: {
          ticket_id: responseData.ticket_id,
          query_resolved_timestamp: responseData.query_resolved_timestamp,
        },
      })
    } catch (error) {
      console.error("❌ Send response error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to send response",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },
}

module.exports = leadController
