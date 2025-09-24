"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PaymentPage = () => {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("userEmail")
    if (!email) {
      // Redirect to registration if no email found
      navigate("/register")
      return
    }
    setUserEmail(email)
  }, [navigate])

  const handlePaymentSimulation = async (status) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          status: status,
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        if (status === "success") {
          // Store WhatsApp link if provided
          if (result.data.whatsapp_link) {
            localStorage.setItem("whatsappLink", result.data.whatsapp_link)
          }
          navigate("/payment-success")
        } else {
          navigate("/payment-failed")
        }
      } else {
        alert("Payment processing failed. Please try again.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen section">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Upgrade to <span className="gradient-text">Premium Access</span>
          </h1>
          <p className="text-xl text-gray-400">Get exclusive bonuses and lifetime access to all materials</p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold gradient-text mb-2">$97</div>
            <p className="text-gray-400">One-time payment</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Premium includes:</h3>
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

          <div className="flex gap-4">
            <button
              onClick={() => handlePaymentSimulation("success")}
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                "Simulate Success"
              )}
            </button>

            <button
              onClick={() => handlePaymentSimulation("failed")}
              className="btn btn-secondary flex-1"
              disabled={isLoading}
            >
              Simulate Failure
            </button>
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
