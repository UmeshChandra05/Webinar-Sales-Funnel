const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const paymentController = {
  simulatePaymentAsync: async (req, res) => {
    try {
      const { email, status, transaction_id } = req.body

      const paymentData = {
        email,
        status,
        transaction_id: transaction_id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        amount: status === "success" ? 97 : 0, // Simulated amount
        currency: "USD",
      }

      console.log(`💳 Payment simulation: ${status} for ${email}`)

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/simulate-payment`, paymentData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("✅ Payment data sent to n8n successfully")

          return res.status(200).json({
            success: true,
            message: `Payment ${status} processed successfully`,
            data: {
              transaction_id: paymentData.transaction_id,
              status: paymentData.status,
              timestamp: paymentData.timestamp,
              whatsapp_link: status === "success" ? "https://chat.whatsapp.com/sample-group-link" : null,
            },
          })
        } catch (apiError) {
          console.error("❌ Payment n8n API Error:", apiError.message)
          // Continue with local success response even if external API fails
        }
      }

      // Return success response (local fallback)
      res.status(200).json({
        success: true,
        message: `Payment ${status} processed successfully`,
        data: {
          transaction_id: paymentData.transaction_id,
          status: paymentData.status,
          timestamp: paymentData.timestamp,
          whatsapp_link: status === "success" ? "https://chat.whatsapp.com/sample-group-link" : null,
        },
      })
    } catch (error) {
      console.error("❌ Payment simulation error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to process payment simulation",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },
}

module.exports = paymentController
