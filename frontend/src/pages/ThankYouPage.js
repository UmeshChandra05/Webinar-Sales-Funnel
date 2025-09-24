"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const ThankYouPage = () => {
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    setUserEmail(email || "")
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
