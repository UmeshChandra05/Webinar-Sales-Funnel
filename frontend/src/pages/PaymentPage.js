"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PaymentPage = () => {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [loadingButton, setLoadingButton] = useState(null) // Track which button is loading

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("userEmail")
    if (!email) {
      // Redirect to registration if no email found
      navigate("/register")
      return
    }
    setUserEmail(email)
    
    // Test backend connectivity
    const testBackendConnection = async () => {
      try {
        const response = await fetch("/health")
        if (response.ok) {
          console.log("✅ Backend connection successful")
        } else {
          console.warn("⚠️ Backend responded with error:", response.status)
        }
      } catch (error) {
        console.error("❌ Backend connection failed:", error.message)
        console.log("🔧 Make sure to run 'npm run dev' from the root directory to start both servers")
      }
    }
    
    testBackendConnection()
  }, [navigate])

  const handlePaymentSimulation = async (status) => {
    setLoadingButton(status) // Set which button is loading

    try {
      console.log(`🔄 Processing ${status} request for ${userEmail}`) // Debug log
      
      const requestBody = {
        email: userEmail,
        status: status,
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      
      console.log('Request body:', requestBody) // Debug log

      const response = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status) // Debug log

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('Payment response:', result) // Debug log

      if (result.success) {
        if (status === "success") {
          // Store WhatsApp link if provided
          if (result.data.whatsapp_link) {
            localStorage.setItem("whatsappLink", result.data.whatsapp_link)
          }
          navigate("/payment-success")
        } else if (status === "need_time_to_confirm") {
          // Store pending confirmation status
          localStorage.setItem("paymentStatus", "need_time_to_confirm")
          console.log('✅ Need time to confirm processed, navigating to thank-you')
          navigate("/thank-you")
        } else {
          navigate("/payment-failed")
        }
      } else {
        // More specific error message for need_time_to_confirm
        if (status === "need_time_to_confirm") {
          console.error("Need time to confirm failed:", result)
          alert("Unable to record your request. Please try again or contact support.")
        } else {
          alert("Payment processing failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Payment error details:", error)
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Cannot connect to server. Please make sure the backend is running.")
      } else if (error.message.includes('HTTP 400')) {
        alert("Invalid request. Please check your information and try again.")
      } else if (error.message.includes('HTTP 404')) {
        alert("API endpoint not found. Please contact support.")
      } else {
        alert(`Network error: ${error.message}`)
      }
    } finally {
      setLoadingButton(null) // Clear loading state
    }
  }

  return (
    <div className="min-h-screen section">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Complete the Payment to <span className="gradient-text">Confirm Your Seat</span>
          </h1>
          <p className="text-xl text-gray-400">Secure your spot in the Python Full Stack course</p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold gradient-text mb-2">₹4,999</div>
            <p className="text-gray-400">One-time payment (INR)</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Your course includes:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Complete 5-day Python Full Stack course
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Lifetime access to all recordings
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Downloadable code templates and projects
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Private WhatsApp community access
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                1-on-1 mentorship session (30 minutes)
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Certificate of completion
              </li>
            </ul>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-4">For demonstration purposes, choose your payment outcome:</p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => handlePaymentSimulation("success")}
              className="btn btn-success min-w-[140px]"
              disabled={loadingButton !== null}
            >
              {loadingButton === "success" ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                "Simulate Success"
              )}
            </button>

            <button
              onClick={() => handlePaymentSimulation("need_time_to_confirm")}
              className="btn btn-warning min-w-[140px]"
              disabled={loadingButton !== null}
            >
              {loadingButton === "need_time_to_confirm" ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                "⏰ Need Time to Confirm"
              )}
            </button>
            
            <button
              onClick={() => handlePaymentSimulation("failed")}
              className="btn btn-danger min-w-[140px]"
              disabled={loadingButton !== null}
            >
              {loadingButton === "failed" ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                "Simulate Failure"
              )}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">Pay before registration ends to confirm your seat</p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">This is a demo payment page. No actual charges will be made.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
