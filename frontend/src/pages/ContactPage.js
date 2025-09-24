"use client"

import { useState } from "react"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Thank you for your message. We will get back to you soon!",
        })
        setFormData({ name: "", email: "", message: "" })
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to send message. Please try again.",
        })
      }
    } catch (error) {
      console.error("Contact form error:", error)
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
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-400">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

            {message.text && (
              <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  required
                  placeholder="Tell us how we can help you..."
                  rows="5"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="card mb-8">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-2xl mr-4">📧</div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-400">support@pythonfullstack.com</p>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-2xl mr-4">💬</div>
                  <div>
                    <h3 className="font-semibold mb-1">Live Chat</h3>
                    <p className="text-gray-400">Available during webinars</p>
                    <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-2xl mr-4">🌐</div>
                  <div>
                    <h3 className="font-semibold mb-1">Community</h3>
                    <p className="text-gray-400">Join our Discord server</p>
                    <p className="text-sm text-gray-500">Connect with fellow learners</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">When is the next webinar?</h4>
                  <p className="text-sm text-gray-400">
                    We host webinars every week. Check our homepage for the countdown to the next session.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Is the webinar really free?</h4>
                  <p className="text-sm text-gray-400">
                    Yes! The core webinar is completely free. You can purchase the full course for additional resources and lifetime access.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">What if I miss the live session?</h4>
                  <p className="text-sm text-gray-400">
                    All registered participants receive a recording link within 24 hours of the webinar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
