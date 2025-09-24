const express = require("express")
const { body, validationResult } = require("express-validator")
const router = express.Router()

// Import controllers
const leadController = require("../controllers/leadController")
const paymentController = require("../controllers/paymentController")
const webinarController = require("../controllers/webinarController")

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
  body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
  body("source").optional().isString().trim(),
]

// Payment validation
const paymentValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("status").isIn(["success", "failed"]).withMessage("Status must be success or failed"),
  body("transaction_id").optional().isString().trim(),
]

// Routes
router.post("/capture-lead", leadValidation, handleValidationErrors, leadController.captureLeadAsync)
router.post("/simulate-payment", paymentValidation, handleValidationErrors, paymentController.simulatePaymentAsync)

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

module.exports = router
