"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import apiClient from "../utils/api"

const RegisterPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    password: "",
    confirmPassword: "",
  })
  const [source, setSource] = useState("Direct") // Default source
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [passwordError, setPasswordError] = useState("")
  const [mobileError, setMobileError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "" })

  // Validate email format
  const validateEmail = (email) => {
    if (!email) {
      setEmailError("")
      return false
    }
    
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    
    // Additional checks
    if (email.length > 254) {
      setEmailError("Email address is too long")
      return false
    }
    
    setEmailError("")
    return true
  }

  // Capture source from URL parameters on component mount
  useEffect(() => {
    const urlSource = searchParams.get('source')
    if (urlSource) {
      setSource(urlSource)
      console.log('Source captured from URL:', urlSource)
    } else {
      console.log('No source in URL, using default: Direct')
    }
  }, [searchParams])

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const dismissToast = () => {
    setToastMessage(null)
  }

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    if (!phone) {
      setMobileError("")
      return true // Optional field
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '')
    
    // Check if it's a valid length (10-15 digits, supports international)
    if (digitsOnly.length < 10) {
      setMobileError("Phone number must be at least 10 digits")
      return false
    }
    if (digitsOnly.length > 15) {
      setMobileError("Phone number must be less than 15 digits")
      return false
    }
    
    // Check for valid formats (supports +, -, spaces, parentheses)
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}$/
    if (!phoneRegex.test(phone)) {
      setMobileError("Please enter a valid phone number")
      return false
    }
    
    setMobileError("")
    return true
  }

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, text: "", color: "" })
      return
    }

    let score = 0
    
    // Length check
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1 // lowercase
    if (/[A-Z]/.test(password)) score += 1 // uppercase
    if (/[0-9]/.test(password)) score += 1 // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1 // special characters
    
    // Determine strength level
    let text = ""
    let color = ""
    
    if (score <= 2) {
      text = "Weak"
      color = "#ef4444" // red
    } else if (score <= 4) {
      text = "Fair"
      color = "#f59e0b" // orange
    } else if (score <= 5) {
      text = "Good"
      color = "#3b82f6" // blue
    } else {
      text = "Strong"
      color = "#10b981" // green
    }
    
    setPasswordStrength({ score, text, color })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // For mobile field, only allow digits, +, -, (, ), and spaces
    let processedValue = value
    if (name === 'mobile') {
      // Only allow numbers, +, -, (, ), and spaces
      processedValue = value.replace(/[^0-9+\-() ]/g, '')
    }
    
    // Use processedValue for mobile, original value for other fields
    const finalValue = name === 'mobile' ? processedValue : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
    
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError("")
    }
    
    // Validate phone number as user types
    if (name === 'mobile') {
      validatePhoneNumber(processedValue)
    }
    
    // Validate email as user types
    if (name === 'email') {
      validateEmail(value)
    }
    
    // Calculate password strength as user types
    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email format
    if (!validateEmail(formData.email)) {
      showToast(emailError || "Please enter a valid email address.", "error")
      return
    }
    
    // Validate phone number (if provided)
    if (formData.mobile && !validatePhoneNumber(formData.mobile)) {
      showToast(mobileError || "Please enter a valid phone number.", "error")
      return
    }
    
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
    
    // Warn if password is weak
    if (passwordStrength.score <= 2 && formData.password.length >= 6) {
      const proceed = window.confirm("Your password is weak. It's recommended to use a stronger password with uppercase, lowercase, numbers, and special characters. Continue anyway?")
      if (!proceed) return
    }
    
    setIsLoading(true)

    try {
      // Use auth registration - creates user account, sends to n8n, and logs them in
      const result = await apiClient.registerUser({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        password: formData.password,
        source: source, // Use captured source (either from URL or "Direct")
        rememberMe: false // Don't remember by default on registration
      })
      
      console.log('Registration submitted with source:', source)

      if (result.success) {
        // Store authentication data
        localStorage.setItem("authUser", JSON.stringify(result.user))
        localStorage.setItem("authToken", result.token)
        localStorage.setItem("userEmail", formData.email)
        
        // Also store legacy userData for backward compatibility with payment page
        localStorage.setItem("userData", JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
        }))

        showToast("Registration successful! You're now logged in.", "success")

        setTimeout(() => {
          navigate("/payment")
        }, 2000)
      } else {
        const errorMessage = result.message || "Registration failed. Please try again."
        showToast(errorMessage, "error")
      }
    } catch (error) {
      console.error("Registration error:", error)
      
      // Handle specific error cases - check service availability first
      if (error.response?.status === 503) {
        showToast(error.response.data.message || "Service temporarily unavailable. Please try again later.", "error")
      } else if (error.response?.status === 409) {
        showToast(error.response.data.message || "An account with this email already exists", "error")
      } else if (error.isNetworkError || error.code === 'ERR_NETWORK' || !error.response) {
        showToast("Service temporarily unavailable. Please try again later.", "error")
      } else {
        showToast(error.message || "Registration failed. Please try again.", "error")
      }
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
                className={`form-input ${emailError ? 'border-red-500' : ''}`}
                required
                placeholder="your.email@example.com"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
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
                className={`form-input ${mobileError ? 'border-red-500' : ''}`}
                placeholder="+1234567890 or (123) 456-7890"
                pattern="[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}"
              />
              {mobileError && (
                <p className="text-red-500 text-sm mt-1">{mobileError}</p>
              )}
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
                placeholder="Min 8 chars, use uppercase, numbers & symbols"
              />
              {formData.password && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[1, 2, 3, 4, 5].map((segment) => {
                      let segmentColor = '#374151' // gray (unfilled)
                      
                      if (passwordStrength.score >= segment) {
                        // Calculate color based on overall strength
                        if (passwordStrength.score <= 3) {
                          segmentColor = '#ef4444' // red
                        } else if (passwordStrength.score <= 5) {
                          segmentColor = '#f59e0b' // orange
                        } else {
                          segmentColor = '#10b981' // green
                        }
                      }
                      
                      return (
                        <div
                          key={segment}
                          style={{ 
                            height: '4px',
                            flex: 1,
                            borderRadius: '9999px',
                            backgroundColor: segmentColor,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      )
                    })}
                  </div>
                  <span 
                    style={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: passwordStrength.color 
                    }}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
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
