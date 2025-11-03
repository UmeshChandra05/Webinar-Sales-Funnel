import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../utils/api"

const AdminSettingsPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [settings, setSettings] = useState({
    adminUsername: 'admin',
    coursePrice: 4999,
    registrationDeadline: '2025-11-07',
    webinarTime: '2025-11-08T19:00',
    contactEmail: 'webinar@pystack.com',
    whatsappLink: 'https://wa.me/',
    discordLink: 'https://discord.gg/',
  })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    
    fetchSettings()
  }, [navigate])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSettings()
      
      if (response.success && response.settings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.settings
        }))
        showToast('Settings loaded successfully', 'success')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      showToast('Failed to load settings. Using defaults.', 'warning')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      showToast('Admin authentication required', 'error')
      navigate('/admin/login')
      return
    }

    setIsSaving(true)

    try {
      const response = await apiClient.updateSettings(settings, adminToken)
      
      if (response.success) {
        showToast('Settings updated successfully!', 'success')
        
        // Force refresh the settings cache
        await fetchSettings()
      } else {
        showToast(response.message || 'Failed to update settings', 'error')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error')
        localStorage.removeItem('adminToken')
        setTimeout(() => navigate('/admin/login'), 2000)
      } else {
        showToast(error.message || 'Failed to update settings', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const dismissToast = () => {
    setToastMessage(null)
  }

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard')
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
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

          .settings-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem 1rem;
          }

          .settings-card {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .settings-title {
            font-size: 1.75rem;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
          }

          .back-button {
            padding: 0.5rem 1rem;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .back-button:hover {
            background: #4f46e5;
            transform: translateY(-1px);
          }

          .form-section {
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          @media (min-width: 640px) {
            .form-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          .form-field-full {
            grid-column: 1 / -1;
          }

          .submit-button {
            width: 100%;
            padding: 0.875rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }

          .submit-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>

      <div className="settings-container">
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
              
              <div style={{
                flex: 1,
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {toastMessage.message}
              </div>
              
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

        <div className="settings-card">
          <div className="settings-header">
            <h1 className="settings-title">⚙️ Admin Settings</h1>
            <button 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              ← Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Admin Credentials Section */}
            <div className="form-section">
              <h2 className="section-title">
                🔐 Admin Credentials
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="adminUsername" className="form-label">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    id="adminUsername"
                    name="adminUsername"
                    value={settings.adminUsername}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Note: Password updates must be done through Google Sheets directly for security.
              </p>
            </div>

            {/* Webinar Details Section */}
            <div className="form-section">
              <h2 className="section-title">
                📅 Webinar Details
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="coursePrice" className="form-label">
                    Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="coursePrice"
                    name="coursePrice"
                    value={settings.coursePrice}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registrationDeadline" className="form-label">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={settings.registrationDeadline}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group form-field-full">
                  <label htmlFor="webinarTime" className="form-label">
                    Webinar Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="webinarTime"
                    name="webinarTime"
                    value={settings.webinarTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section">
              <h2 className="section-title">
                📧 Contact Information
              </h2>
              <div className="form-grid">
                <div className="form-group form-field-full">
                  <label htmlFor="contactEmail" className="form-label">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsappLink" className="form-label">
                    WhatsApp Invite Link
                  </label>
                  <input
                    type="url"
                    id="whatsappLink"
                    name="whatsappLink"
                    value={settings.whatsappLink}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://wa.me/..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discordLink" className="form-label">
                    Discord Community Link
                  </label>
                  <input
                    type="url"
                    id="discordLink"
                    name="discordLink"
                    value={settings.discordLink}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://discord.gg/..."
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="spinner"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  💾 Save Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AdminSettingsPage
