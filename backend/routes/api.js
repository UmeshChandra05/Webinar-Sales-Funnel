const express = require("express")
const { body, validationResult } = require("express-validator")
const router = express.Router()

// Import controllers
const leadController = require("../controllers/leadController")
const paymentController = require("../controllers/paymentController")
const webinarController = require("../controllers/webinarController")
const adminController = require("../controllers/adminController")
const authController = require("../controllers/authController")
const settingsController = require("../controllers/settingsController")
const configController = require("../controllers/configController")

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

// Payment validation
const paymentValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("payment_status").isIn(["Success", "Need Time", "Failure"]).withMessage("Payment status must be Success, Need Time, or Failure"),
  body("txn_id").optional().isString().trim(),
  // Only validate coupon fields if they exist in the request
  body("couponcode_applied").optional().isString().trim().isLength({ min: 1 }).withMessage("Coupon code must be a non-empty string"),
  body("discount_percentage").optional().isNumeric().isFloat({ min: 0, max: 100 }).withMessage("Discount percentage must be a number between 0-100"),
]

// Coupon validation
const couponValidation = [
  body("couponcode_applied").trim().isLength({ min: 1, max: 20 }).withMessage("Coupon code is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
]

// Routes
router.post("/simulate-payment", paymentValidation, handleValidationErrors, paymentController.simulatePaymentAsync)
router.post("/validate-coupon", couponValidation, handleValidationErrors, paymentController.validateCouponAsync)

// User Authentication routes (primary method for registration and login)
router.post(
  "/auth/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("mobile").optional().isMobilePhone().withMessage("Valid mobile number is required"),
    body("role").optional().trim(),
  ],
  handleValidationErrors,
  authController.registerUser
)

router.post(
  "/auth/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  handleValidationErrors,
  authController.loginUser
)

router.get("/auth/verify", authController.verifyUserToken, authController.verifyUser)
router.post("/auth/refresh", authController.verifyUserToken, authController.refreshUserToken)
router.post("/auth/logout", authController.logoutUser)

// Additional utility routes
router.get("/webinar-info", webinarController.getWebinarInfo)
router.post(
  "/contact",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("query")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Query must be between 10 and 1000 characters"),
  ],
  handleValidationErrors,
  leadController.handleContactForm,
)

// Admin routes
router.post(
  "/admin/login",
  [
    body("username").trim().isLength({ min: 1 }).withMessage("Username is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  handleValidationErrors,
  adminController.loginAdmin
)

// Protected admin routes
router.get("/admin/dashboard", adminController.verifyAdminToken, adminController.getDashboardData)
router.post("/admin/refresh-token", adminController.verifyAdminToken, adminController.refreshToken)

// Settings routes
router.get("/settings", settingsController.getSettings) // Public route - fetch settings
router.put(
  "/admin/settings",
  adminController.verifyAdminToken,
  [
    body("adminUsername").trim().isLength({ min: 1, max: 50 }).withMessage("Admin username must be 1-50 characters"),
    body("adminPassword").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters if provided"),
    body("registrationFee").isNumeric().withMessage("Registration fee must be a number"),
    body("registrationDeadline").isString().trim().isLength({ min: 1 }).withMessage("Registration deadline is required"),
    body("webinarTime").isString().trim().isLength({ min: 1 }).withMessage("Webinar time is required"),
    body("contactEmail").isEmail().normalizeEmail().withMessage("Valid contact email is required"),
    body("whatsappLink").optional().isString().trim().isLength({ max: 500 }).withMessage("WhatsApp link too long"),
    body("discordLink").optional().isString().trim().isLength({ max: 500 }).withMessage("Discord link too long"),
  ],
  handleValidationErrors,
  settingsController.updateSettings
) // Protected - update settings

// Configuration routes
router.get("/config/google-sheets", adminController.verifyAdminToken, configController.getGoogleSheetsConfig) // Protected - Get Google Sheets URLs and config (admin only)
router.get("/config/constants", configController.getAppConstants) // Public - Get app-wide constants

// AI Chat route
router.post("/ai-chat", [
  body("query").trim().isLength({ min: 1, max: 1000 }).withMessage("Query is required and must be under 1000 characters"),
  body("sessionId").optional().isString().trim(),
  body("userId").optional().isString().trim(),
], handleValidationErrors, leadController.handleAIChat)

module.exports = router
