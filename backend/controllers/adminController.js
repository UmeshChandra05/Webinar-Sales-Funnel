const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin credentials (in production, these should be in environment variables)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin.password'
};

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Admin login endpoint
 */
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Verify credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin',
        iat: Date.now()
      },
      JWT_SECRET,
      { 
        expiresIn: '24h' // Token expires in 24 hours
      }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        username: username,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify admin token middleware
 */
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get admin dashboard data
 */
const getDashboardData = async (req, res) => {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const dashboardData = {
      stats: {
        totalRegistrations: Math.floor(Math.random() * 500) + 100,
        totalPayments: Math.floor(Math.random() * 200) + 50,
        totalContacts: Math.floor(Math.random() * 300) + 75,
        conversionRate: Math.floor(Math.random() * 30) + 15
      },
      recentActivity: [
        {
          type: 'registration',
          user: 'John Doe',
          role: 'Student',
          time: '2 hours ago',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'payment',
          user: 'Jane Smith',
          amount: '$99',
          time: '3 hours ago',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'contact',
          user: 'Mike Johnson',
          subject: 'Technical Issue',
          time: '5 hours ago',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'registration',
          user: 'Sarah Wilson',
          role: 'Faculty',
          time: '1 day ago',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

/**
 * Refresh admin token
 */
const refreshToken = async (req, res) => {
  try {
    // The user is already verified by the middleware
    const { username, role } = req.user;

    // Generate new token
    const newToken = jwt.sign(
      { 
        username: username,
        role: role,
        iat: Date.now()
      },
      JWT_SECRET,
      { 
        expiresIn: '24h'
      }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

module.exports = {
  loginAdmin,
  verifyAdminToken,
  getDashboardData,
  refreshToken
};