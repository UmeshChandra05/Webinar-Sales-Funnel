"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const ThankYouPage = () => {
  const [userEmail, setUserEmail] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    const status = localStorage.getItem("paymentStatus")
    
    setUserEmail(email || "")
    setPaymentStatus(status || "")
  }, [])

  const handleAttendanceRecord = async (attended) => {
    if (!userEmail) return

    try {
      await fetch("/api/webinar-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          attended: attended,
        }),
      })
    } catch (error) {
      console.error("Attendance recording error:", error)
    }
  }

  // Show different content for "need_time_to_confirm" status
  if (paymentStatus === "need_time_to_confirm") {
    return (
      <div className="min-h-screen section">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              We <span className="gradient-text">Understand!</span>
            </h1>
            <p className="text-xl text-gray-400">Take your time to decide - we'll keep your spot available</p>
          </div>

          <div className="card text-center">
            <div className="text-6xl mb-6">⏰</div>
            <h2 className="text-2xl font-semibold mb-4">Need Time to Confirm</h2>
            <p className="text-gray-400 mb-6">
              We understand this is an important decision. Your interest has been recorded for the Python Full Stack course.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4 text-blue-200">Remember to complete your payment before registration ends to:</h3>
              <div className="text-left space-y-2">
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">📚</span>
                  <span>Secure your spot in the course</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">💬</span>
                  <span>Get access to the exclusive WhatsApp community</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">🎥</span>
                  <span>Receive all course materials and recordings</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">🏆</span>
                  <span>Get your certificate and mentorship session</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200">
                <strong>⚠️ Registration closes soon!</strong> Complete payment before the deadline to confirm your access.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link to="/payment" className="btn btn-primary">
                Complete Payment Now
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen section">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Thank You for <span className="gradient-text">Attending!</span>
          </h1>
          <p className="text-xl text-gray-400">We hope you enjoyed the Python Full Stack webinar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Feedback Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">How was the webinar?</h2>
            <p className="text-gray-400 mb-6">Your feedback helps us improve future sessions</p>

            <div className="flex gap-4 mb-6">
              <button onClick={() => handleAttendanceRecord(true)} className="btn btn-primary flex-1">
                👍 Attended & Loved It!
              </button>
              <button onClick={() => handleAttendanceRecord(false)} className="btn btn-secondary flex-1">
                😔 Couldn't Attend
              </button>
            </div>

            <div className="text-center">
              <Link to="/contact" className="text-purple-400 hover:text-purple-300">
                Share detailed feedback →
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <h3 className="font-semibold">Course Materials</h3>
                  <p className="text-sm text-gray-400">Download slides and code samples</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-2xl mr-3">🎥</span>
                <div>
                  <h3 className="font-semibold">Recording Access</h3>
                  <p className="text-sm text-gray-400">Watch the session again anytime</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <h3 className="font-semibold">Community</h3>
                  <p className="text-sm text-gray-400">Join our developer community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold mb-2">Start Building</h3>
              <p className="text-sm text-gray-400">Apply what you learned by building your first full-stack project</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-semibold mb-2">Keep Learning</h3>
              <p className="text-sm text-gray-400">Explore advanced topics and frameworks to expand your skills</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Stay Connected</h3>
              <p className="text-sm text-gray-400">Follow us for more webinars and learning opportunities</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ThankYouPage
