import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication token and user info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
        }}></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-16 px-8" style={{ paddingLeft: '1.5rem' }}>
          <div className="max-w-md w-full" style={{ marginLeft: '1px' }}>
            <div className="card backdrop-blur-sm border-purple-500/20 bg-gray-900/50">
          {/* Header Section with Icon, Title, and Subtitle grouped together */}
          <div className="w-20 h-20 gradient-bg rounded flex flex-col items-center justify-center mx-auto mb-8 shadow-lg pt-6 pb-4 px-6" style={{ width: 'auto', height: 'auto', minWidth: '280px' }}>
            <svg className="w-10 h-10 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Portal</h1>
            <p className="text-white text-center">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="alert-error">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                    Sign In to Dashboard&nbsp;
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 8l4 4m0 0l-4 4m4-4H3m5-4V7a3 3 0 013-3h7a3 3 0 013 3v10a3 3 0 01-3 3h-7a3 3 0 01-3-3v-1" />
                    </svg>

                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-purple-500/20 text-center">
            <button
              onClick={() => navigate('/')}
              className="btn btn-light text-sm flex items-center justify-center mx-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Website
            </button>
          </div>
        </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white">
                🔒 Secure admin access • Session expires in 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - PyStack Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center py-16 px-8">
          <div className="text-center max-w-lg">
            {/* PyStack Logo */}
            <div className="w-32 h-32 gradient-bg rounded flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">Py</div>
                <div className="text-xl font-semibold text-white">Stack</div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="gradient-text">PyStack</span>
              <span className="block text-2xl font-medium">Analytics Dashboard</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Comprehensive analytics platform for Python developers. Track webinar performance, monitor sales funnels, and gain insights into your educational content delivery.
            </p>
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="text-purple-400 text-2xl font-bold mb-1">�</div>
                <h3 className="text-white font-semibold mb-1">Python Analytics</h3>
                <p className="text-gray-400 text-sm">Code performance metrics</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="text-green-400 text-2xl font-bold mb-1">�</div>
                <h3 className="text-white font-semibold mb-1">Data Insights</h3>
                <p className="text-gray-400 text-sm">Real-time dashboards</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="text-blue-400 text-2xl font-bold mb-1">⚡</div>
                <h3 className="text-white font-semibold mb-1">Performance</h3>
                <p className="text-gray-400 text-sm">Stack optimization</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="text-orange-400 text-2xl font-bold mb-1">�</div>
                <h3 className="text-white font-semibold mb-1">Tools</h3>
                <p className="text-gray-400 text-sm">Developer utilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;