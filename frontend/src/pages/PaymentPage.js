import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Toast from "../components/Toast"
import { getErrorMessage, logError } from "../utils/errorHandler"
import { COURSE_PRICE, CURRENCY_SYMBOL, NAVIGATION_DELAY, COURSE_FEATURES } from "../utils/constants"
import { logPaymentStatus } from "../utils/paymentUtils"

const PaymentPage = () => {
  const navigate = useNavigate()
  const { user, hasCompletedPayment, updateUserPaymentStatus } = useAuth()
  const [userEmail, setUserEmail] = useState("")
  const [loadingButton, setLoadingButton] = useState(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type })
  }

  const dismissToast = () => {
    setToastMessage(null)
  }

  // Redirect if payment already successful
  useEffect(() => {
    if (hasCompletedPayment()) {
      console.log("✅ Payment already completed, redirecting to success page...")
      logPaymentStatus(user, 'PaymentPage - Auto Redirect')
      navigate("/payment-success", { replace: true })
    }
  }, [hasCompletedPayment, navigate, user])

  useEffect(() => {
    // Get email from authenticated user or localStorage
    // ProtectedRoute already handles authentication, so we just need to get the email
    const email = user?.email || localStorage.getItem("userEmail")
    if (email) {
      setUserEmail(email)
    }
    
    // Pre-fill coupon code if user has one
    if (user?.couponCode) {
      setCouponCode(user.couponCode)
    }
  }, [user])

  // Test backend connectivity
  useEffect(() => {
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
  }, [])

  const validateCouponCode = async () => {
    const trimmedCode = couponCode.trim()
    
    if (!trimmedCode) {
      showToast("Please enter a coupon code", "warning")
      return
    }

    setCouponLoading(true)

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponcode_applied: trimmedCode,
          email: userEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCouponApplied(true)
        setCouponDiscount(result.discount_percentage || 0)
        showToast(`Coupon applied! ${result.discount_percentage}% discount`, "success")
        logError(null, `Coupon ${trimmedCode} applied: ${result.discount_percentage}% discount`)
      } else {
        setCouponApplied(false)
        setCouponDiscount(0)
        showToast("Invalid coupon code", "error")
        logError(result, `Coupon ${trimmedCode} invalid`)
      }
    } catch (error) {
      logError(error, 'Coupon validation')
      setCouponApplied(false)
      setCouponDiscount(0)
      showToast(getErrorMessage(error, 'coupon'), "error")
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode("")
    setCouponApplied(false)
    setCouponDiscount(0)
    showToast("Coupon removed", "info")
  }

  const calculateFinalPrice = () => {
    if (couponApplied && couponDiscount > 0) {
      return COURSE_PRICE() - (COURSE_PRICE() * couponDiscount / 100)
    }
    return COURSE_PRICE()
  }

  const handlePaymentSimulation = async (payment_status) => {
    setLoadingButton(payment_status)

    try {
      logError(null, `Processing ${payment_status} request for ${userEmail}`)
      
      const requestBody = {
        email: userEmail,
        payment_status: payment_status === "success" ? "Success" : payment_status === "need_time" ? "Need Time" : "Failure",
        txn_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      if (couponApplied && couponCode.trim()) {
        requestBody.couponcode_applied = couponCode.trim()
        requestBody.discount_percentage = couponDiscount
      }

      const response = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      logError(null, `Payment response received`)

      if (result.success) {
        // Payment was processed successfully
        // Update local state immediately for instant UI response
        
        if (payment_status === "success") {
          // CRITICAL: Update local state immediately
          updateUserPaymentStatus("Success")
          
          if (result.data.whatsapp_link) {
            localStorage.setItem("whatsappLink", result.data.whatsapp_link)
          }
          showToast("Payment Successful!", "success")
          setTimeout(() => navigate("/payment-success"), NAVIGATION_DELAY)
        } else if (payment_status === "need_time") {
          // Update local state immediately
          updateUserPaymentStatus("Need Time")
          
          showToast("We'll wait for you. Please complete payment soon.", "success")
          setTimeout(() => navigate("/thank-you", { state: { fromPayment: true, payment_status: "need_time" } }), NAVIGATION_DELAY)
        } else {
          // Update local state immediately
          updateUserPaymentStatus("Failure")
          
          showToast("Payment Failed. Please try again.", "error")
          setTimeout(() => navigate("/payment-failed"), NAVIGATION_DELAY)
        }
      } else {
        showToast(getErrorMessage(new Error('Payment processing failed'), 'payment'), "error")
      }
    } catch (error) {
      logError(error, 'Payment simulation')
      showToast(getErrorMessage(error, 'payment'), "error")
    } finally {
      setLoadingButton(null)
    }
  }

  return (
    <>
      <div className="min-h-screen section">
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onDismiss={dismissToast}
          />
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
            {couponApplied && couponDiscount > 0 ? (
              <>
                <div className="text-xl text-gray-500 mb-1">
                  <span style={{
                    textDecoration: 'line-through',
                    textDecorationColor: '#ef4444',
                    textDecorationThickness: '2px'
                  }}>
                    {CURRENCY_SYMBOL}{COURSE_PRICE().toLocaleString()}
                  </span>
                </div>
                <div className="text-4xl font-bold gradient-text mb-2">
                  {CURRENCY_SYMBOL}{calculateFinalPrice().toLocaleString()}
                </div>
                <p className="text-green-400 text-sm mb-1">
                  🎉 You save {CURRENCY_SYMBOL}{(COURSE_PRICE() - calculateFinalPrice()).toLocaleString()} ({couponDiscount}% off)
                </p>
              </>
            ) : (
              <div className="text-4xl font-bold gradient-text mb-2">
                {CURRENCY_SYMBOL}{calculateFinalPrice().toLocaleString()}
              </div>
            )}
            <p className="text-gray-400">One-time payment (INR)</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Your course includes:</h3>
            <ul className="space-y-2 text-gray-300">
              {COURSE_FEATURES().map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Coupon Code Section */}
          <div className="border border-purple-500/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-purple-400">Have a Coupon Code?</h3>
            <p className="text-sm text-gray-400 mb-4">Enter your coupon code to apply available discounts</p>
            
            <style>{`
              .coupon-input-container {
                display: flex;
                gap: 0.75rem;
              }
              @media (max-width: 400px) {
                .coupon-input-container {
                  flex-direction: column;
                  gap: 0.75rem;
                }
                .coupon-input-container button {
                  width: 100%;
                }
              }
            `}</style>

            {!couponApplied ? (
              <div className="coupon-input-container">
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
                  className="btn btn-danger text-sm px-3 py-1"
                  style={{ minWidth: 'auto', fontSize: '12px' }}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-4">For demonstration purposes, choose your payment outcome:</p>
          </div>

          <style>{`
            .payment-buttons-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 1rem;
              max-width: 64rem;
              margin: 0 auto;
            }
            @media (min-width: 768px) {
              .payment-buttons-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
              }
            }
          `}</style>

          <div className="payment-buttons-grid">
            <button
              onClick={() => handlePaymentSimulation("success")}
              className="btn btn-success"
              style={{ minWidth: '140px' }}
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
              onClick={() => handlePaymentSimulation("need_time")}
              className="btn btn-warning"
              style={{ minWidth: '140px' }}
              disabled={loadingButton !== null}
            >
              {loadingButton === "need_time" ? (
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
              className="btn btn-danger"
              style={{ minWidth: '140px' }}
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
