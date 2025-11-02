"use client"

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      
      showToast(
        formData.rememberMe 
          ? 'Login successful! You will stay logged in on this device.' 
          : 'Login successful! Redirecting...', 
        'success'
      );
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {toastMessage.message}
                </div>
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
              Welcome Back to <span className="gradient-text">Python Full Stack</span>
            </h1>
            <p className="text-xl text-gray-400">Sign in to access your webinar content</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
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
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-group">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                    Remember me on this device (30 days)
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading || authLoading}>
                {(isLoading || authLoading) ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "🔐 Sign In"
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;