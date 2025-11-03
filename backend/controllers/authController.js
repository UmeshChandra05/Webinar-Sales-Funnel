const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require("../middleware/axios");

const API_BASE_URL = process.env.API_BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// ============================================================================
// 🚨 TEST CREDENTIALS - REMOVE IN PRODUCTION 🚨
// ============================================================================
// These credentials allow testing login without n8n validation
// Email: test@example.com
// Password: test123
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123', // Plain password for testing
  name: 'Test User',
  mobile: '1234567890',
  role: 'Student',
  id: 'test_user_001'
};
// ============================================================================

const authController = {
  // Register new user
  registerUser: async (req, res) => {
    try {
      const { name, email, password, mobile, role, rememberMe } = req.body;

      console.log("👤 User registration:", { email, name, role });

      // ============================================================================
      // 🚨 TEST USER CHECK - REMOVE IN PRODUCTION 🚨
      // ============================================================================
      // Prevent registration with test email
      if (email.toLowerCase().trim() === TEST_USER.email) {
        console.log("🧪 TEST EMAIL: Registration blocked - test email already exists");
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
          errorCode: "EMAIL_ALREADY_EXISTS"
        });
      }
      // ============================================================================

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

      // Send to n8n capture-lead webhook (stores in Google Sheets)
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          const response = await axios.post(`${API_BASE_URL}/capture-lead`, userData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("✅ User registration sent to n8n capture-lead successfully");
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
              reg_timestamp: userData.reg_timestamp,
              payment_status: null,
              couponCode: null
            }
          });
        } catch (apiError) {
          console.error("❌ n8n registration API Error:", apiError.message);
          console.error("❌ Error code:", apiError.code);
          console.error("❌ Has response:", !!apiError.response);
          console.error("❌ Response data:", apiError.response?.data);
          
          // Network or connection errors - no response at all
          if (!apiError.response || 
              apiError.code === 'ECONNREFUSED' || 
              apiError.code === 'ETIMEDOUT' ||
              apiError.code === 'ENOTFOUND' ||
              apiError.code === 'ECONNRESET' ||
              apiError.code === 'ERR_NETWORK' ||
              apiError.message?.includes('ECONNREFUSED') ||
              apiError.message?.includes('network')) {
            console.log("🔌 Network error detected - n8n service unavailable");
            return res.status(503).json({
              success: false,
              message: "Registration service temporarily unavailable. Please try again later.",
              errorCode: "SERVICE_UNAVAILABLE"
            });
          }
          
          // Check if n8n webhook is not registered/configured (404 from n8n itself)
          if (apiError.response?.status === 404) {
            const responseMessage = apiError.response?.data?.message || '';
            // If the 404 is from n8n saying webhook not registered, it's a service issue
            if (responseMessage.includes('webhook') || 
                responseMessage.includes('not registered') ||
                responseMessage.includes('Execute workflow')) {
              console.log("⚙️ n8n webhook not configured properly");
              return res.status(503).json({
                success: false,
                message: "Registration service is not configured properly. Please contact support.",
                errorCode: "SERVICE_NOT_CONFIGURED"
              });
            }
          }
          
          // Enhanced duplicate email handling (only when we have a response from n8n)
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
          reg_timestamp: userData.reg_timestamp,
          payment_status: null,
          couponCode: null
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

      // ============================================================================
      // 🚨 TEST CREDENTIALS CHECK - REMOVE IN PRODUCTION 🚨
      // ============================================================================
      // Check if test credentials are being used (for development only)
      if (email.toLowerCase().trim() === TEST_USER.email && password === TEST_USER.password) {
        console.log("🧪 TEST LOGIN: Using test credentials (development only)");
        
        // Generate JWT token for test user
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
          { 
            email: TEST_USER.email,
            name: TEST_USER.name,
            userId: TEST_USER.id,
            role: TEST_USER.role,
            rememberMe: rememberMe,
            isTestUser: true // Flag to identify test user
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
          message: "Login successful (TEST MODE)",
          token: token,
          user: {
            id: TEST_USER.id,
            name: TEST_USER.name,
            email: TEST_USER.email,
            mobile: TEST_USER.mobile,
            role: TEST_USER.role
          }
        });
      }
      // ============================================================================

      // Query user from n8n/Google Sheets
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          console.log("🔄 Attempting to connect to n8n for user login...");
          console.log("🌐 n8n URL:", API_BASE_URL);
          
          // Send login request to n8n - it should query Google Sheets and return user with hashed password
          const loginData = {
            email: email.toLowerCase().trim(),
            action: "user_login",
            timestamp: new Date().toISOString(),
            ip_address: req.ip,
            user_agent: req.get("User-Agent"),
          };

          const response = await axios.post(`${API_BASE_URL}/user-login`, loginData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("✅ n8n response received");
          console.log("📦 Response status:", response.status);
          console.log("📦 Response data:", JSON.stringify(response.data, null, 2));

          // Check if n8n returned an error response (200 OK but with error data)
          if (response.data?.success === false || response.data?.error) {
            console.error("❌ n8n returned error response:", response.data.message || response.data.error);
            // If it's a service unavailable error from n8n
            if (response.data.message?.includes('unavailable') || response.data.message?.includes('service')) {
              return res.status(503).json({
                success: false,
                message: "Authentication service temporarily unavailable. Please try again later.",
                errorCode: "SERVICE_UNAVAILABLE"
              });
            }
            // User not found from n8n
            return res.status(404).json({
              success: false,
              message: response.data.message || "No account found with this email address"
            });
          }

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
            console.error("❌ This usually means the user doesn't exist in the database");
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
              role: userData.role,
              payment_status: userData.payment_status || null,
              couponCode: userData.CouponCode || userData.couponcode_given || null
            }
          });

        } catch (apiError) {
          console.error("❌ n8n login API Error:", apiError.message);
          console.error("❌ Error code:", apiError.code);
          console.error("❌ Has response:", !!apiError.response);
          console.error("❌ Response data:", apiError.response?.data);
          
          // Network or connection errors - no response at all
          if (!apiError.response || 
              apiError.code === 'ECONNREFUSED' || 
              apiError.code === 'ETIMEDOUT' ||
              apiError.code === 'ENOTFOUND' ||
              apiError.code === 'ECONNRESET' ||
              apiError.code === 'ERR_NETWORK' ||
              apiError.message?.includes('ECONNREFUSED') ||
              apiError.message?.includes('network')) {
            console.log("🔌 Network error detected - n8n service unavailable");
            return res.status(503).json({
              success: false,
              message: "Authentication service temporarily unavailable. Please try again later.",
              errorCode: "SERVICE_UNAVAILABLE"
            });
          }
          
          // Check if n8n webhook is not registered/configured (404 from n8n itself)
          if (apiError.response?.status === 404) {
            const responseMessage = apiError.response?.data?.message || '';
            // If the 404 is from n8n saying webhook not registered, it's a service issue
            if (responseMessage.includes('webhook') || 
                responseMessage.includes('not registered') ||
                responseMessage.includes('Execute workflow')) {
              console.log("⚙️ n8n webhook not configured properly");
              return res.status(503).json({
                success: false,
                message: "Authentication service is not configured properly. Please contact support.",
                errorCode: "SERVICE_NOT_CONFIGURED"
              });
            }
            // Otherwise it's a genuine user not found
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
      // Token is already verified by middleware
      // Smart fetching: Only fetch fresh data from n8n if payment is not completed
      
      const email = req.user.email;
      const skipFreshData = req.query.skipFreshData === 'true'; // Frontend can signal to skip
      
      // If API_BASE_URL configured AND we need fresh data
      if (API_BASE_URL && API_BASE_URL !== "API_URL" && !skipFreshData) {
        try {
          console.log(`🔄 Fetching fresh user data for verification: ${email}`);
          
          const loginData = {
            email: email.toLowerCase().trim(),
            action: "verify_session",
            timestamp: new Date().toISOString(),
          };
          
          const response = await axios.post(`${API_BASE_URL}/user-login`, loginData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Handle different response formats from n8n (same as login)
          let userData = null;
          
          if (response.data?.user) {
            userData = response.data.user;
          } else if (response.data?.email) {
            userData = response.data;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            userData = response.data[0];
          }

          if (userData && userData.email) {
            console.log("✅ Fresh user data retrieved from n8n:", {
              email: userData.email,
              payment_status: userData.payment_status,
              couponCode: userData.CouponCode || userData.couponcode_given
            });
            
            return res.status(200).json({
              success: true,
              message: "Token is valid",
              user: {
                id: userData.id || userData.userId || req.user.userId,
                name: userData.name || req.user.name,
                email: userData.email || email,
                mobile: userData.mobile || "NA",
                role: userData.role || req.user.role,
                payment_status: userData.payment_status || null,
                couponCode: userData.CouponCode || userData.couponcode_given || null
              }
            });
          }
        } catch (apiError) {
          console.error("⚠️ n8n user data fetch error:", apiError.message);
          // Fall through to use token data
        }
      } else if (skipFreshData) {
        console.log("⏭️ Skipping fresh data fetch (payment completed)");
      }
      
      // Fallback: Return token data (may not have latest payment_status)
      console.log("⚠️ Using token data (may be stale)");
      res.status(200).json({
        success: true,
        message: "Token is valid",
        user: {
          id: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          payment_status: null, // Token doesn't store payment_status
          couponCode: null
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