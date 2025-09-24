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
        amount: status === "success" ? 4999 : (status === "need_time_to_confirm" ? 0 : 0), // No charge for need_time_to_confirm
        currency: "INR",
      }

      console.log(`💳 Payment simulation: ${status} for ${email}`)

      // Special handling for need_time_to_confirm - always succeed locally
      if (status === "need_time_to_confirm") {
        console.log("🕐 Processing need_time_to_confirm request")
        
        // Try to send to n8n but don't fail if it doesn't work
        if (API_BASE_URL && API_BASE_URL !== "API_URL") {
          try {
            await axios.post(`${API_BASE_URL}/simulate-payment`, paymentData, {
              timeout: 10000,
              headers: {
                "Content-Type": "application/json",
              },
            })
            console.log("✅ Need time to confirm data sent to n8n successfully")
          } catch (apiError) {
            console.warn("⚠️ n8n API unavailable for need_time_to_confirm, continuing locally:", apiError.message)
          }
        }

        // Always return success for need_time_to_confirm
        return res.status(200).json({
          success: true,
          message: "Time to confirm request recorded successfully",
          data: {
            transaction_id: paymentData.transaction_id,
            status: paymentData.status,
            timestamp: paymentData.timestamp,
            whatsapp_link: null,
            confirmation_pending: true,
          },
        })
      }

      // If API_BASE_URL is configured, send to n8n webhook for other statuses
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
              confirmation_pending: status === "need_time_to_confirm",
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
          confirmation_pending: status === "need_time_to_confirm",
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
