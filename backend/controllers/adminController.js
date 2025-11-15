const jwt = require('jsonwebtoken');
const axiosInstance = require('../middleware/axios');
require('dotenv').config();

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET in production
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_SECRET must be set in production environment');
}
if (!JWT_SECRET) {
  console.warn('⚠️  WARNING: Using fallback JWT secret - NOT SECURE for production');
}

/**
 * Validate admin credentials with N8n webhook
 */
const validateAdminCredentials = async (username, password) => {
  try {
    const payload = {
      username: username,
      password: password,
      timestamp: new Date().toISOString(),
      source: 'admin-login',
      action: 'validate_credentials'
    };

    console.log('🔐 Validating admin credentials with N8n...');
    
    const response = await axiosInstance.post(process.env.API_BASE_URL + '/admin-auth', payload);
    
    console.log('✅ N8n credential validation response received');
    
    // n8n returns: { valid: boolean, message: string }
    if (response.data && response.data.valid === true) {
      return {
        valid: true,
        userInfo: { username: username, role: 'admin' }
      };
    } else {
      return {
        valid: false,
        message: response.data?.message || 'Invalid credentials'
      };
    }

  } catch (error) {
    console.error('❌ N8n credential validation error:', error.message);
    
    // Return false for any network or N8n errors
    return {
      valid: false,
      message: 'Authentication service unavailable'
    };
  }
};

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

    // Validate credentials through N8n
    console.log(`🔐 Admin login attempt for username: ${username}`);
    
    const validationResult = await validateAdminCredentials(username, password);

    if (!validationResult.valid) {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('❌ Admin login failed: Invalid credentials');
      
      return res.status(401).json({
        success: false,
        message: validationResult.message || 'Invalid username or password'
      });
    }

    console.log('✅ Admin login successful');

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin',
        userInfo: validationResult.userInfo,
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
        role: 'admin',
        ...validationResult.userInfo
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
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