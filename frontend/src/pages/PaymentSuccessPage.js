"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const PaymentSuccessPage = () => {
  const [whatsappLink, setWhatsappLink] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get stored data
    const email = localStorage.getItem("userEmail")
    const link = localStorage.getItem("whatsappLink")

    setUserEmail(email || "")
    setWhatsappLink(link || "https://chat.whatsapp.com/sample-group-link")
  }, [])

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
            <h3 className="font-semibold text-green-400 mb-4">What's Next?</h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Check your email for course access details
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Join our exclusive WhatsApp community
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Download your bonus materials
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Schedule your 1-on-1 mentorship session
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              📱 Join WhatsApp Community
            </a>

            <Link to="/thank-you" className="btn btn-secondary">
              Continue to Resources
            </Link>
          </div>

          <div className="mt-8 p-4 bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Important:</strong> Save this page! You'll receive all access details via email within 5 minutes.
              If you don't see it, check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
