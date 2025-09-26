import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  const loginTime = localStorage.getItem('adminLoginTime');
  
  // Check if admin is authenticated
  if (!adminToken || !adminUser || !loginTime) {
    return <Navigate to="/admin" replace />;
  }

  // Check if session is expired (24 hours)
  const sessionAge = Date.now() - parseInt(loginTime);
  const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours
  
  if (sessionAge > sessionLimit) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    return <Navigate to="/admin" replace />;
  }

  // Validate JWT token format (basic check)
  try {
    const tokenParts = adminToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Decode the payload to check expiration (without verification)
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminLoginTime');
      return <Navigate to="/admin" replace />;
    }
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;