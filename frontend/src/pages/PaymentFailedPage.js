"use client"
import { useNavigate } from "react-router-dom"

const PaymentFailedPage = () => {
  const navigate = useNavigate()

  const handleRetryPayment = () => {
    navigate("/payment")
  }

  const handleContactSupport = () => {
    navigate("/contact")
  }

  return (
    <div className="min-h-screen section">
      <div className="container max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="text-6xl mb-6">❌</div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Payment <span className="text-red-400">Failed</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            Don't worry! You can try again to secure your spot in the webinar.
          </p>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-red-400 mb-4">Common Issues & Solutions</h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-red-400 mr-2 mt-1">•</span>
                <span>Check if your card has sufficient funds</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 mt-1">•</span>
                <span>Verify your billing information is correct</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 mt-1">•</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 mt-1">•</span>
                <span>Contact your bank if the issue persists</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button onClick={handleRetryPayment} className="btn btn-primary">
              🔄 Try Again
            </button>

            <button onClick={handleContactSupport} className="btn btn-secondary">
              📞 Contact Support
            </button>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <h3 className="font-semibold text-purple-400 mb-2">Ready to Secure Your Seat?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Complete your payment to confirm your spot in the Python Full Stack Development webinar.
            </p>
            <p className="text-xs text-gray-500">
              Limited seats available. Don't miss this exclusive learning opportunity!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailedPage
