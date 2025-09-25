"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "registration_page",
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(formData))
        localStorage.setItem("userEmail", formData.email)

        showToast("Registration successful!", "success")

        setTimeout(() => {
          navigate("/payment")
        }, 2000)
      } else {
        showToast(result.error || "Registration failed. Please try again.", "error")
      }
    } catch (error) {
      console.error("Registration error:", error)
      showToast("Network error. Please check your connection and try again.", "error")
    } finally {
      setIsLoading(false)
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
              padding: '12px 20px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backgroundColor: toastMessage.type === 'success' ? '#10b981' : 
                               toastMessage.type === 'error' ? '#ef4444' :
                               toastMessage.type === 'warning' ? '#f59e0b' : '#6b7280',
              animation: 'slideIn 0.3s ease-out',
              maxWidth: '350px'
            }}
          >
            {toastMessage.message}
          </div>
        )}
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Show Your Interest in <span className="gradient-text">Python Full Stack</span>
          </h1>
          <p className="text-xl text-gray-400">Express interest in "Python Full Stack in 5 Days" Webinar</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your phone number (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Industry Professional">Industry Professional</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting Interest...
                </>
              ) : (
                "💡 Submit Interest"
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  )
}

export default RegisterPage
