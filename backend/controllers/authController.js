const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require("../middleware/axios");

const API_BASE_URL = process.env.API_BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

const authController = {
  // Register new user
  registerUser: async (req, res) => {
    try {
      const { name, email, password, mobile, role, rememberMe } = req.body;

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const userData = {
        name,
        email,
        password: hashedPassword,
        mobile: mobile || "NA",
        role: role || "",
        type: "user_registration",
        reg_timestamp: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      };

      console.log("👤 User registration:", { email, name, role });

      // If API_BASE_URL is configured, send to n8n webhook for verification
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("✅ User registration sent to n8n successfully");
          console.log("📦 n8n Registration Response:", JSON.stringify(response.data, null, 2));

          // Check if n8n explicitly indicates failure (duplicate email, etc.)
          if (response.data?.success === false) {
            console.log("⚠️ n8n rejected registration:", response.data.message);
            return res.status(409).json({
              success: false,
              message: response.data.message || "Registration failed - email may already exist"
            });
          }

          // If n8n indicates success or doesn't have a success field, proceed with registration
          console.log("✅ Registration approved by n8n");

          // Generate JWT token for the user
          const tokenExpiry = rememberMe ? '30d' : '7d';
          const token = jwt.sign(
            { 
              email: email,
              name: name,
              userId: response.data?.userId || `user_${Date.now()}`,
              role: role,
              rememberMe: rememberMe 
            },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
          );

          // Set secure HTTP-only cookie for persistent login
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
          };
          res.cookie('authToken', token, cookieOptions);

          return res.status(201).json({
            success: true,
            message: "Registration successful",
            token: token,
            user: {
              id: response.data?.userId || `user_${Date.now()}`,
              name: name,
              email: email,
              mobile: mobile,
              role: role,
              reg_timestamp: userData.reg_timestamp
            }
          });
        } catch (apiError) {
          console.error("❌ n8n registration API Error:", apiError.message);
          
          // Enhanced duplicate email handling
          if (apiError.response?.status === 409 || 
              apiError.response?.status === 400 ||
              apiError.response?.data?.message?.toLowerCase().includes('already exists') ||
              apiError.response?.data?.message?.toLowerCase().includes('duplicate') ||
              apiError.response?.data?.message?.toLowerCase().includes('email') && apiError.response?.data?.message?.toLowerCase().includes('used')) {
            return res.status(409).json({
              success: false,
              message: "An account with this email already exists",
              errorCode: "EMAIL_ALREADY_EXISTS",
              suggestion: "Try logging in instead, or use a different email address"
            });
          }
          
          // Check for other validation errors
          if (apiError.response?.status === 400) {
            return res.status(400).json({
              success: false,
              message: apiError.response?.data?.message || "Invalid registration data",
              errorCode: "VALIDATION_ERROR"
            });
          }
          
          // Network or server errors
          if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
            return res.status(503).json({
              success: false,
              message: "Registration service temporarily unavailable. Please try again later.",
              errorCode: "SERVICE_UNAVAILABLE"
            });
          }
          
          // Return generic error for other cases
          return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again later.",
            errorCode: "REGISTRATION_ERROR"
          });
        }
      }

      // Local fallback response (when n8n is not configured)
      const tokenExpiry = rememberMe ? '30d' : '7d';
      const token = jwt.sign(
        { 
          email: email,
          name: name,
          userId: `user_${Date.now()}`,
          role: role,
          rememberMe: rememberMe 
        },
        JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      // Set secure HTTP-only cookie for persistent login
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
      };
      res.cookie('authToken', token, cookieOptions);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token: token,
        user: {
          id: `user_${Date.now()}`,
          name: name,
          email: email,
          mobile: mobile,
          role: role,
          reg_timestamp: userData.reg_timestamp
        }
      });

    } catch (error) {
      console.error("❌ User registration error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to register user",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      console.log("🔐 User login attempt:", { email });

      // If API_BASE_URL is configured, send login request to n8n
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          // Send login request to your existing n8n webhook
          const loginData = {
            email,
            password, // Send plain password to n8n
            type: "user_login",
            reg_timestamp: new Date().toISOString(),
            ip_address: req.ip,
            user_agent: req.get("User-Agent"),
          };

          const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("✅ n8n response received");
          console.log("📦 Response data:", JSON.stringify(response.data, null, 2));

          // n8n should return the user data with the HASHED password
          // Handle different response formats
          let userData = null;
          
          if (response.data?.user) {
            // Format 1: { user: { ...userData } }
            userData = response.data.user;
          } else if (response.data?.email) {
            // Format 2: Direct user data { email, name, password, ... }
            userData = response.data;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            // Format 3: Array with user data [{ email, name, password, ... }]
            userData = response.data[0];
          }

          if (!userData || !userData.email) {
            console.error("❌ No user data found in n8n response");
            return res.status(404).json({
              success: false,
              message: "No account found with this email address"
            });
          }

          console.log("👤 User data retrieved:", { email: userData.email, name: userData.name, hasPassword: !!userData.password });

          // Compare the plain password with the hashed password HERE in backend
          if (!userData.password) {
            console.error("❌ No password hash returned from n8n");
            return res.status(500).json({
              success: false,
              message: "Account data is incomplete. Please contact support."
            });
          }

          const isPasswordValid = await bcrypt.compare(password, userData.password);

          if (!isPasswordValid) {
            console.log("❌ Incorrect password for user:", email);
            return res.status(401).json({
              success: false,
              message: "Password is incorrect"
            });
          }

          console.log("✅ Password verified successfully");

          // Generate JWT token
          const tokenExpiry = rememberMe ? '30d' : '7d';
          const token = jwt.sign(
            { 
              email: userData.email || email,
              name: userData.name,
              userId: userData.id || userData.userId || `user_${Date.now()}`,
              role: userData.role,
              rememberMe: rememberMe 
            },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
          );

          // Set secure HTTP-only cookie
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
          };
          res.cookie('authToken', token, cookieOptions);

          return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
              id: userData.id || userData.userId,
              name: userData.name,
              email: userData.email || email,
              mobile: userData.mobile || "NA",
              role: userData.role
            }
          });

        } catch (apiError) {
          console.error("❌ n8n login API Error:", apiError.message);
          
          // Check if user not found
          if (apiError.response?.status === 404) {
            return res.status(404).json({
              success: false,
              message: "No account found with this email address"
            });
          }
          
          // Check if it's an authentication error
          if (apiError.response?.status === 401) {
            return res.status(401).json({
              success: false,
              message: "Invalid email or password"
            });
          }
          
          // Network or server errors
          if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
            return res.status(503).json({
              success: false,
              message: "Authentication service temporarily unavailable. Please try again later.",
              errorCode: "SERVICE_UNAVAILABLE"
            });
          }
          
          // Return generic error for other cases
          return res.status(500).json({
            success: false,
            message: "Login failed. Please try again later.",
            errorCode: "LOGIN_ERROR"
          });
        }
      }

      // Local fallback (when n8n is not configured)
      res.status(503).json({
        success: false,
        message: "Authentication service is not configured. Please contact support.",
        errorCode: "SERVICE_NOT_CONFIGURED"
      });

    } catch (error) {
      console.error("❌ User login error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to login user",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      });
    }
  },

  // Verify user token middleware
  verifyUserToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      let token = null;
      
      // Check Authorization header first
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
      // Fallback to cookie if no Authorization header
      else if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
      }
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token is required"
        });
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
      
    } catch (error) {
      console.error("❌ Token verification error:", error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid access token"
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Access token has expired"
        });
      }

      res.status(500).json({
        success: false,
        message: "Token verification failed"
      });
    }
  },

  // Verify user endpoint
  verifyUser: async (req, res) => {
    try {
      // Token is already verified by middleware, just return user data
      res.status(200).json({
        success: true,
        message: "Token is valid",
        user: {
          id: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error("❌ User verification error:", error);
      res.status(500).json({
        success: false,
        message: "User verification failed"
      });
    }
  },

  // Refresh user token
  refreshUserToken: async (req, res) => {
    try {
      // Generate new token with extended expiry
      const tokenExpiry = req.user.rememberMe ? '30d' : '7d';
      const newToken = jwt.sign(
        { 
          email: req.user.email,
          name: req.user.name,
          userId: req.user.userId,
          role: req.user.role,
          rememberMe: req.user.rememberMe 
        },
        JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      // Update cookie with new token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: req.user.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
      };
      res.cookie('authToken', newToken, cookieOptions);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        token: newToken,
        user: {
          id: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      res.status(500).json({
        success: false,
        message: "Token refresh failed"
      });
    }
  },

  // Logout user
  logoutUser: async (req, res) => {
    try {
      // Clear the authentication cookie
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      console.error("❌ Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }
  }
};

module.exports = authController;