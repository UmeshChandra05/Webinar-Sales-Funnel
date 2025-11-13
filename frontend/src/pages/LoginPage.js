import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import { NAVIGATION_DELAY } from '../services/constantsService';

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
          ? 'Logged in! You\'ll stay signed in for 30 days.' 
          : 'Login successful! Redirecting...', 
        'success'
      );
      
      setTimeout(() => {
        navigate('/');
      }, NAVIGATION_DELAY);
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen section">
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onDismiss={dismissToast}
          />
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