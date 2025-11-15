const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const paymentController = {
  simulatePaymentAsync: async (req, res) => {
    try {
      const { email, payment_status, txn_id, couponcode_applied, discount_percentage } = req.body

      // Calculate final amount based on coupon discount
      const reg_fee = 4999
      const discount_amt = couponcode_applied && discount_percentage > 0 ? 
        Math.round(reg_fee * discount_percentage / 100) : 
        0
      const payable_amt = reg_fee - discount_amt
      const paid_amt = payment_status === "Success" ? payable_amt : (payment_status === "Need Time" ? 0 : 0)

      const paymentData = {
        email,
        payment_status,
        txn_id: txn_id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        txn_timestamp: new Date().toISOString(),
        paid_amt,
        reg_fee,
        couponcode_applied: couponcode_applied || null,
        discount_percentage: discount_percentage || 0,
        discount_amt,
        payable_amt,
        currency: "INR",
      }

      console.log(`💳 Payment simulation: ${payment_status} for ${email}`)

      // Special handling for need_time
      if (payment_status === "need_time") {
        console.log("🕐 Processing need_time request")
        
        // Send to n8n and wait for response
        if (API_BASE_URL && API_BASE_URL !== "API_URL") {
          try {
            const response = await axios.post(`${API_BASE_URL}/simulate-payment`, paymentData, {
              timeout: 10000,
              headers: {
                "Content-Type": "application/json",
              },
            })
            console.log("✅ Need time to confirm data sent to n8n successfully")
            
            // Return success with n8n response (n8n returns { payment_status: "string" })
            return res.status(200).json({
              success: true,
              message: "Time to confirm request recorded successfully",
              data: {
                txn_id: paymentData.txn_id,
                payment_status: response.data?.payment_status || paymentData.payment_status,
                txn_timestamp: paymentData.txn_timestamp,
                whatsapp_link: null,
                confirmation_pending: true,
              },
            })
          } catch (apiError) {
            console.error("❌ n8n API Error for need_time:", apiError.message)
            console.log("⚠️ Using local fallback for need_time")
            
            // Fallback to local response if n8n fails
            return res.status(200).json({
              success: true,
              message: "Time to confirm request recorded successfully (local)",
              data: {
                txn_id: paymentData.txn_id,
                payment_status: paymentData.payment_status,
                txn_timestamp: paymentData.txn_timestamp,
                whatsapp_link: null,
                confirmation_pending: true,
              },
            })
          }
        }

        // Local fallback when n8n is not configured
        return res.status(200).json({
          success: true,
          message: "Time to confirm request recorded successfully",
          data: {
            txn_id: paymentData.txn_id,
            payment_status: paymentData.payment_status,
            txn_timestamp: paymentData.txn_timestamp,
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
            message: `Payment ${payment_status} processed successfully`,
            data: {
              txn_id: paymentData.txn_id,
              payment_status: response.data?.payment_status || paymentData.payment_status,
              txn_timestamp: paymentData.txn_timestamp,
              paid_amt: paymentData.paid_amt,
              reg_fee: paymentData.reg_fee,
              payable_amt: paymentData.payable_amt,
              discount_amt: paymentData.discount_amt,
              whatsapp_link: payment_status === "Success" ? "https://chat.whatsapp.com/sample-group-link" : null,
              confirmation_pending: payment_status === "Need Time",
            },
          })
        } catch (apiError) {
          console.error("❌ Payment n8n API Error:", apiError.message)
          console.log("⚠️ Using local fallback for payment status:", payment_status)
          
          // Fallback to local response if n8n fails (allows frontend to redirect properly)
          return res.status(200).json({
            success: true,
            message: `Payment ${payment_status} processed successfully (local)`,
            data: {
              txn_id: paymentData.txn_id,
              payment_status: paymentData.payment_status,
              txn_timestamp: paymentData.txn_timestamp,
              paid_amt: paymentData.paid_amt,
              reg_fee: paymentData.reg_fee,
              payable_amt: paymentData.payable_amt,
              discount_amt: paymentData.discount_amt,
              whatsapp_link: payment_status === "Success" ? "https://chat.whatsapp.com/sample-group-link" : null,
              confirmation_pending: payment_status === "Need Time",
            },
          })
        }
      }

      // Local fallback response (when n8n is not configured)
      res.status(200).json({
        success: true,
        message: `Payment ${payment_status} processed successfully`,
        data: {
          txn_id: paymentData.txn_id,
          payment_status: paymentData.payment_status,
          txn_timestamp: paymentData.txn_timestamp,
          paid_amt: paymentData.paid_amt,
          reg_fee: paymentData.reg_fee,
          payable_amt: paymentData.payable_amt,
          discount_amt: paymentData.discount_amt,
          whatsapp_link: payment_status === "Success" ? "https://chat.whatsapp.com/sample-group-link" : null,
          confirmation_pending: payment_status === "Need Time",
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

  validateCouponAsync: async (req, res) => {
    try {
      const { couponcode_applied, email } = req.body

      console.log(`🎟️ Validating coupon: ${couponcode_applied} for ${email}`)

      const couponData = {
        couponcode_applied: couponcode_applied.trim().toUpperCase(),
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
        action: "validate_coupon"
      }

      // If API_BASE_URL is configured, send to n8n for validation
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          console.log(`🔄 Sending coupon validation request to n8n: ${couponcode_applied}`)
          
          const response = await axios.post(`${API_BASE_URL}/validate-coupon`, couponData, {
            timeout: 15000,
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("✅ n8n coupon validation response:", response.data)

          // n8n returns: { success: boolean, discount: number, message: string }
          if (response.data && response.data.success) {
            return res.status(200).json({
              success: true,
              message: response.data.message || "Coupon applied successfully",
              discount_percentage: response.data.discount || 0,
              couponcode_applied: couponcode_applied.toUpperCase(),
            })
          } else {
            return res.status(200).json({
              success: false,
              message: response.data?.message || "Invalid coupon code",
            })
          }

        } catch (apiError) {
          console.error("❌ n8n coupon validation error:", apiError.message)
          
          // If n8n is unavailable, return error
          return res.status(200).json({
            success: false,
            message: "Coupon validation service is temporarily unavailable. Please try again later.",
          })
        }
      } else {
        console.warn("⚠️ API_BASE_URL not configured, coupon validation unavailable")
        return res.status(200).json({
          success: false,
          message: "Coupon validation service is not configured",
        })
      }

    } catch (error) {
      console.error("❌ Coupon validation error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to validate coupon",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },
}

module.exports = paymentController
