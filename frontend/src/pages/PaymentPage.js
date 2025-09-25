"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PaymentPage = () => {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [loadingButton, setLoadingButton] = useState(null) // Track which button is loading
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000) // Auto-hide after 4 seconds
  }

  const dismissToast = () => {
    setToastMessage(null)
  }

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

  const validateCouponCode = async () => {
    const trimmedCode = couponCode.trim()
    
    // Only validate if coupon code is entered
    if (!trimmedCode) {
      showToast("Please enter a coupon code", "warning")
      return
    }

    setCouponLoading(true)
    setCouponError("")

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: trimmedCode,
          email: userEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCouponApplied(true)
        setCouponDiscount(result.discount || 0)
        setCouponError("")
        showToast(`Coupon applied! ${result.discount}% discount`, "success")
        console.log(`✅ Coupon ${trimmedCode} applied: ${result.discount}% discount`)
      } else {
        setCouponApplied(false)
        setCouponDiscount(0)
        showToast("Invalid coupon code", "error")
        console.log(`❌ Coupon ${trimmedCode} invalid: ${result.message}`)
      }
    } catch (error) {
      console.error("Coupon validation error:", error)
      
      setCouponApplied(false)
      setCouponDiscount(0)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast("Connection failed. Please try again.", "error")
      } else if (error.message.includes('timeout')) {
        showToast("Request timed out. Please try again.", "error")
      } else {
        showToast("Unable to validate coupon. Please try again.", "error")
      }
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode("")
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponError("")
    showToast("Coupon removed", "info")
  }

  const calculateFinalPrice = () => {
    const originalPrice = 4999
    if (couponApplied && couponDiscount > 0) {
      return originalPrice - (originalPrice * couponDiscount / 100)
    }
    return originalPrice
  }

  const handlePaymentSimulation = async (status) => {
    setLoadingButton(status) // Set which button is loading

    try {
      console.log(`🔄 Processing ${status} request for ${userEmail}`) // Debug log
      
      const requestBody = {
        email: userEmail,
        status: status,
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      // Only add coupon data if a coupon is applied
      if (couponApplied && couponCode.trim()) {
        requestBody.couponCode = couponCode.trim()
        requestBody.discount = couponDiscount
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
          showToast("Payment Successful!", "success")
          setTimeout(() => navigate("/payment-success"), 1500)
        } else if (status === "need_time_to_confirm") {
          // Store pending confirmation status
          localStorage.setItem("paymentStatus", "need_time_to_confirm")
          console.log('✅ Need time to confirm processed, navigating to thank-you')
          showToast("We'll wait for you.", "success")
          setTimeout(() => navigate("/thank-you"), 1500)
        } else {
          showToast("Payment Failed", "error")
          setTimeout(() => navigate("/payment-failed"), 1500)
        }
      } else {
        // More specific error message for need_time_to_confirm
        if (status === "need_time_to_confirm") {
          console.error("Need time to confirm failed:", result)
          showToast("Unable to process request. Please try again.", "error")
        } else {
          showToast("Payment could not be processed. Please try again.", "error")
        }
      }
    } catch (error) {
      console.error("Payment error details:", error)
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast("Connection failed. Please check your internet.", "error")
      } else if (error.message.includes('HTTP 400')) {
        showToast("Please check your information and try again.", "error")
      } else if (error.message.includes('HTTP 404')) {
        showToast("Service unavailable. Please try again later.", "error")
      } else {
        showToast("Something went wrong. Please try again.", "error")
      }
    } finally {
      setLoadingButton(null) // Clear loading state
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}
      </style>
      
      <div className="min-h-screen section">
        {/* Toast Notification */}
        {toastMessage && (
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              animation: 'slideIn 0.3s ease-out',
              minWidth: '300px',
              maxWidth: '400px',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              gap: '12px'
            }}>
              {/* Icon */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: toastMessage.type === 'success' ? '#10b981' : 
                                 toastMessage.type === 'error' ? '#ef4444' :
                                 toastMessage.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }}>
                {toastMessage.type === 'success' ? '✓' : 
                 toastMessage.type === 'error' ? '✖' :
                 toastMessage.type === 'warning' ? '⚠' : 'i'}
              </div>
              
              {/* Message */}
              <div style={{
                flex: 1,
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {toastMessage.message}
              </div>
              
              {/* Close Button */}
              <button 
                onClick={dismissToast}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '4px',
              backgroundColor: '#f3f4f6',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '100%',
                backgroundColor: toastMessage.type === 'success' ? '#10b981' : 
                                 toastMessage.type === 'error' ? '#ef4444' :
                                 toastMessage.type === 'warning' ? '#f59e0b' : '#3b82f6',
                animation: 'progress 4s linear forwards'
              }} />
            </div>
          </div>
        )}
      
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Complete the Payment to <span className="gradient-text">Confirm Your Seat</span>
          </h1>
          <p className="text-xl text-gray-400">Secure your spot in the Python Full Stack course</p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold gradient-text mb-2">
              ₹{calculateFinalPrice().toLocaleString()}
              {couponApplied && couponDiscount > 0 && (
                <span className="text-lg text-gray-400 line-through ml-2">₹4,999</span>
              )}
            </div>
            <p className="text-gray-400">One-time payment (INR)</p>
            {couponApplied && couponDiscount > 0 && (
              <p className="text-green-400 text-sm mt-1">
                🎉 {couponDiscount}% discount applied!
              </p>
            )}
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

          {/* Coupon Code Section */}
          <div className="border border-purple-500/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-purple-400">Have a Coupon Code?</h3>
            <p className="text-sm text-gray-400 mb-4">Enter your coupon code to apply available discounts</p>
            
            {!couponApplied ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="form-input flex-1"
                  style={{
                    padding: '12px',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={validateCouponCode}
                  disabled={couponLoading || !couponCode.trim()}
                  className="btn btn-outline px-6"
                  style={{
                    minWidth: '100px',
                    opacity: couponLoading || !couponCode.trim() ? 0.6 : 1
                  }}
                >
                  {couponLoading ? (
                    <>
                      <div className="spinner mr-1" style={{ width: '16px', height: '16px' }}></div>
                      Applying...
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-green-400 font-medium">Coupon "{couponCode}" applied</span>
                  <span className="ml-2 text-sm text-gray-400">({couponDiscount}% off)</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
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
    </>
  )
}

export default PaymentPage
