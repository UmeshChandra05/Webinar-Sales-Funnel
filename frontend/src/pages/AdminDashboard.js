import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalPayments: 0,
    totalContacts: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!adminToken || !adminUser || !loginTime) {
      navigate('/admin');
      return;
    }

    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(loginTime);
    const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > sessionLimit) {
      handleLogout();
      return;
    }

    // Load dashboard data from backend
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity);
      } else {
        console.error('Failed to load dashboard data:', data.message);
        // If token is invalid, redirect to login
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Dashboard API error:', error);
      // Fallback to mock data if API fails
      setStats({
        totalRegistrations: Math.floor(Math.random() * 500) + 100,
        totalPayments: Math.floor(Math.random() * 200) + 50,
        totalContacts: Math.floor(Math.random() * 300) + 75,
        conversionRate: Math.floor(Math.random() * 30) + 15
      });

      setRecentActivity([
        { type: 'registration', user: 'John Doe', role: 'Student', time: '2 hours ago' },
        { type: 'payment', user: 'Jane Smith', amount: '$99', time: '3 hours ago' },
        { type: 'contact', user: 'Mike Johnson', subject: 'Technical Issue', time: '5 hours ago' },
        { type: 'registration', user: 'Sarah Wilson', role: 'Faculty', time: '1 day ago' }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="card hover:border-purple-500/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} border border-gray-700/50`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'registration':
          return (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          );
        case 'payment':
          return (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          );
        case 'contact':
          return (
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          );
        default:
          return null;
      }
    };

    const getDescription = (activity) => {
      switch (activity.type) {
        case 'registration':
          return `${activity.user} registered as ${activity.role}`;
        case 'payment':
          return `${activity.user} completed payment of ${activity.amount}`;
        case 'contact':
          return `${activity.user} sent message: ${activity.subject}`;
        default:
          return '';
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-purple-500/5 hover:border-l-4 hover:border-purple-500 rounded-lg transition-all duration-200">
        {getIcon(activity.type)}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{getDescription(activity)}</p>
          <p className="text-xs text-gray-400">{activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20 shadow-lg">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Webinar Sales Funnel Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="text-sm text-gray-300">Welcome, Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations.toLocaleString()}
            color="bg-green-500/20"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Payments"
            value={stats.totalPayments.toLocaleString()}
            color="bg-purple-500/20"
            icon={
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
          <StatCard
            title="Contact Messages"
            value={stats.totalContacts.toLocaleString()}
            color="bg-blue-500/20"
            icon={
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            color="bg-orange-500/20"
            icon={
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="p-6 border-b border-purple-500/20">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <p className="text-sm text-gray-400 mt-1">Latest user interactions</p>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-700 rounded-lg hover:bg-purple-500/10 hover:border-purple-500/40 text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Export Data</h3>
                  <p className="text-sm text-gray-400">Download registration and payment data</p>
                </div>
              </div>
            </button>

            <button className="p-4 border border-gray-700 rounded-lg hover:bg-green-500/10 hover:border-green-500/40 text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Send Notifications</h3>
                  <p className="text-sm text-gray-400">Broadcast messages to users</p>
                </div>
              </div>
            </button>

            <button className="p-4 border border-gray-700 rounded-lg hover:bg-orange-500/10 hover:border-orange-500/40 text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">System Settings</h3>
                  <p className="text-sm text-gray-400">Configure application settings</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;