"use client"

import { useState } from "react"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 5000)
  }

  const dismissToast = () => {
    setToast({ show: false, message: "", type: "" })
  }

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqData = [
    {
      question: "What is the cost of the webinar?",
      answer: "The webinar is priced at ₹4,999 INR. This is a one-time payment for complete access to the entire Python Full Stack Development session."
    },
    {
      question: "Is this a one-time webinar or recurring?",
      answer: "This is a special one-time webinar event. We don't host regular recurring sessions, making this an exclusive opportunity to learn Python Full Stack Development."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including UPI, Net Banking, Credit/Debit Cards, and digital wallets for seamless transactions."
    },
    {
      question: "Will I get a certificate after completion?",
      answer: "Yes! All participants who attend the complete webinar will receive a digital certificate of completion from Python Full Stack Academy."
    },
    {
      question: "What if I can't attend the live session?",
      answer: "All registered participants receive lifetime access to the webinar recording, session materials, and code samples within 24 hours."
    },
    {
      question: "Do I need prior programming experience?",
      answer: "No prior experience required! The webinar is designed for complete beginners to advanced levels, covering Python basics to full-stack development."
    },
    {
      question: "What topics will be covered in the webinar?",
      answer: "Python fundamentals, Django framework, database integration, frontend technologies, API development, deployment strategies, and real-world project building."
    },
    {
      question: "Is there a refund policy?",
      answer: "We offer a 7-day money-back guarantee if you're not satisfied with the webinar content. Contact support within 7 days for a full refund."
    },
    {
      question: "Will I get ongoing support after the webinar?",
      answer: "Yes! Participants get access to our exclusive Discord community and 30 days of email support for any questions related to the webinar content."
    },
    {
      question: "How long is the webinar session?",
      answer: "The comprehensive webinar is approximately 3-4 hours long with interactive coding sessions, Q&A segments, and practical project demonstrations."
    }
  ]

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        showToast(
          result.message || "Thank you for your message. We will get back to you soon!", 
          "success"
        )
        setFormData({ name: "", email: "", message: "" })
      } else {
        showToast(
          result.error || "Failed to send message. Please try again.", 
          "error"
        )
      }
    } catch (error) {
      console.error("Contact form error:", error)
      showToast(
        "Network error. Please check your connection and try again.", 
        "error"
      )
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

      {/* Toast Notification */}
      {toast.show && (
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
              backgroundColor: toast.type === 'success' ? '#10b981' : 
                               toast.type === 'error' ? '#ef4444' :
                               toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }}>
              {toast.type === 'success' ? '✓' : 
               toast.type === 'error' ? '✖' :
               toast.type === 'warning' ? '⚠' : 'i'}
            </div>
            
            {/* Message */}
            <div style={{
              flex: 1,
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {toast.type === 'success' ? 'Success' : 
               toast.type === 'error' ? 'Error' :
               toast.type === 'warning' ? 'Warning' : 'Info'} toast notification
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
              backgroundColor: toast.type === 'success' ? '#10b981' : 
                               toast.type === 'error' ? '#ef4444' :
                               toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              animation: 'progress 5s linear forwards'
            }} />
          </div>
        </div>
      )}

      <div className="min-h-screen section" style={{ paddingBottom: '4rem' }}>
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-400">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12" style={{ marginBottom: '4rem' }}>
          {/* Contact Form */}
          <div className="card" style={{ marginBottom: '3rem' }}>
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>



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
                  <div>
                    <h3 className="font-semibold mb-1">Email 📧</h3>
                    <p className="text-gray-400">support@pythonfullstack.com</p>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold mb-1">Live Chat 💬</h3>
                    <p className="text-gray-400">Available during webinars</p>
                    <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold mb-1">Community 🌐</h3>
                    <p className="text-gray-400">Join our Discord server</p>
                    <p className="text-sm text-gray-500">Connect with fellow learners</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqData.map((faq, index) => (
                  <div 
                    key={index} 
                    style={{
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      backgroundColor: '#1a1a1a',
                      overflow: 'hidden',
                      marginBottom: '0.5px'
                    }}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span>{faq.question}</span>
                      <span 
                        style={{
                          fontSize: '18px',
                          color: '#8b5cf6',
                          transform: openFAQ === index ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        +
                      </span>
                    </button>
                    
                    <div
                      style={{
                        maxHeight: openFAQ === index ? '200px' : '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                        borderTop: openFAQ === index ? '1px solid #374151' : 'none'
                      }}
                    >
                      <div
                        style={{
                          padding: '16px 20px',
                          backgroundColor: '#0f0f0f',
                          color: '#9ca3af',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default ContactPage
