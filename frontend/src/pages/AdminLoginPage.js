import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { NAVIGATION_DELAY } from '../utils/constants';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);

    // ============================================
    // ⚠️ REMOVE IN PRODUCTION - START
    // Development bypass for admin login
    // ============================================
    if (formData.username === 'admin' && formData.password === 'admin') {
      localStorage.setItem('adminToken', 'dev-token-' + Date.now());
      localStorage.setItem('adminUser', JSON.stringify({ 
        username: 'admin', 
        role: 'admin',
        id: 'dev-admin-1'
      }));
      localStorage.setItem('adminLoginTime', Date.now().toString());
      
      showToast('Login successful! Redirecting to dashboard...', 'success');
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, NAVIGATION_DELAY);
      
      setIsLoading(false);
      return;
    }
    // ============================================
    // ⚠️ REMOVE IN PRODUCTION - END
    // ============================================

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        showToast('Login successful! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, NAVIGATION_DELAY);
      } else {
        showToast(data.message || 'Invalid username or password', 'error');
      }
    } catch (error) {
      logError(error, 'Admin login');
      showToast(getErrorMessage(error, 'login'), 'error');
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


        <div className="mx-auto px-4" style={{ maxWidth: '450px' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to <span className="gradient-text">Admin Portal</span>
            </h1>
            <p className="text-xl text-gray-400">Sign in to access the analytics dashboard</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter your username"
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

              <div className="flex justify-center">
                <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '240px' }} disabled={isLoading}>
                  {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "🔐 Sign In to Dashboard"
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Not an admin?{' '}
                  <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">
                    Back to website
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure admin access • Session expires in 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
