const express = require("express")
const { body, validationResult } = require("express-validator")
const router = express.Router()

// Import controllers
const leadController = require("../controllers/leadController")
const paymentController = require("../controllers/paymentController")
const webinarController = require("../controllers/webinarController")
const adminController = require("../controllers/adminController")

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

// Lead capture validation
const leadValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("mobile").optional().isMobilePhone().withMessage("Valid mobile number is required"),
  body("role").trim().isLength({ min: 1, max: 50 }).withMessage("Role is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("source").optional().isString().trim(),
]

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
router.post("/capture-lead", leadValidation, handleValidationErrors, leadController.captureLeadAsync)
router.post("/simulate-payment", paymentValidation, handleValidationErrors, paymentController.simulatePaymentAsync)
router.post("/validate-coupon", couponValidation, handleValidationErrors, paymentController.validateCouponAsync)

// Additional utility routes
router.get("/webinar-info", webinarController.getWebinarInfo)
router.post(
  "/contact",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("message")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
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

// AI Chat route
router.post("/ai-chat", [
  body("query").trim().isLength({ min: 1, max: 1000 }).withMessage("Query is required and must be under 1000 characters"),
  body("sessionId").optional().isString().trim(),
  body("userId").optional().isString().trim(),
], handleValidationErrors, leadController.handleAIChat)

module.exports = router
