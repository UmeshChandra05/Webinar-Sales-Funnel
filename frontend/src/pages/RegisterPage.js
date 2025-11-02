"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [passwordError, setPasswordError] = useState("")

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const dismissToast = () => {
    setToastMessage(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match")
      showToast("Passwords do not match. Please try again.", "error")
      return
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      showToast("Password must be at least 6 characters long.", "error")
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          password: formData.password,
          source: "registration_page",
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
        }))
        localStorage.setItem("userEmail", formData.email)

        showToast("Registration successful!", "success")

        setTimeout(() => {
          navigate("/payment")
        }, 2000)
      } else {
        // Display the exact message from n8n/backend
        const errorMessage = result.message || result.error || result.details?.[0]?.msg || "Registration failed. Please try again."
        showToast(errorMessage, "error")
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
              <label htmlFor="mobile" className="form-label">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your mobile number"
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

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${passwordError ? 'border-red-500' : ''}`}
                required
                minLength={6}
                placeholder="Enter password (minimum 6 characters)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${passwordError ? 'border-red-500' : ''}`}
                required
                minLength={6}
                placeholder="Re-enter your password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
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
