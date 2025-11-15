import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [adminVerified, setAdminVerified] = useState(null);
  const [verifying, setVerifying] = useState(requireAdmin);

  // Verify admin token with backend if required
  useEffect(() => {
    const verifyAdminToken = async () => {
      if (!requireAdmin) {
        setVerifying(false);
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        setAdminVerified(false);
        setVerifying(false);
        return;
      }

      try {
        await apiClient.getAdminDashboard(adminToken);
        setAdminVerified(true);
      } catch (error) {
        console.error('Admin token verification failed:', error);
        // Remove invalid token
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminLoginTime');
        setAdminVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyAdminToken();
  }, [requireAdmin]);

  // Show loading state while checking authentication
  if (isLoading || verifying) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#8b5cf6'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderTop: '3px solid #8b5cf6',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>{requireAdmin ? 'Verifying admin access...' : 'Loading...'}</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Admin route protection
  if (requireAdmin) {
    if (adminVerified === false) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  }

  // User route protection
  if (!isAuthenticated) {
    // Redirect to register page for unauthenticated users
    return <Navigate to="/register" replace />;
  }

  // User is authenticated, allow access
  return children;
};

export default ProtectedRoute;
