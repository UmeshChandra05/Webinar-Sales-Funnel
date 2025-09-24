"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

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
    setMessage({ type: "", text: "" })

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

        setMessage({
          type: "success",
          text: "Thank you for your interest! Redirecting to secure your spot...",
        })

        setTimeout(() => {
          navigate("/payment")
        }, 2000)
      } else {
        setMessage({
          type: "error",
          text: result.error || "Registration failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen section">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Show Your Interest in <span className="gradient-text">Python Full Stack</span>
          </h1>
          <p className="text-xl text-gray-400">Express interest in "Python Full Stack in 5 Days" Webinar</p>
        </div>

        <div className="card">
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

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
  )
}

export default RegisterPage
