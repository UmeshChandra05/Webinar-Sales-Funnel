"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { logPaymentStatus } from "../utils/paymentUtils"

const PaymentSuccessPage = () => {
  const { user, refreshUserData } = useAuth()
  const [whatsappLink, setWhatsappLink] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Refresh user data to get latest payment status from backend
    const fetchUserData = async () => {
      console.log("🔄 PaymentSuccessPage: Refreshing user data...")
      await refreshUserData()
    }
    
    fetchUserData()
    
    // Get stored WhatsApp link (temporary, from payment response)
    const link = localStorage.getItem("whatsappLink")
    setWhatsappLink(link || "https://chat.whatsapp.com/sample-group-link")
    
    // Get email from authenticated user
    setUserEmail(user?.email || "")
    
    // Log payment status after component mounts
    if (user) {
      logPaymentStatus(user, 'PaymentSuccessPage')
    }
  }, []) // Only run once on mount - user dependency removed to prevent loops

  return (
    <div className="min-h-screen section">
      <div className="container max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="text-6xl mb-6">🎉</div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Payment <span className="gradient-text">Successful!</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8">Your seat is confirmed! Welcome to the Python Full Stack course!</p>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-4">You will receive via email:</h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">📧</span>
                <span><strong>Webinar Link</strong> - 24 hours before the session</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">📚</span>
                <span><strong>Course Resources</strong> - After the webinar completion</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">💬</span>
                <span><strong>WhatsApp Community Link</strong> - Join below now</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">🎓</span>
                <span><strong>Certificate & Mentorship</strong> - Post-webinar</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              📱 Join WhatsApp Community
            </a>

            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Important:</strong> Check your email for confirmation. Webinar link will be sent 24 hours before the session.
              All resources will be delivered after webinar completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
