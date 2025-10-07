# n8n Webhook API Documentation
**PyStack Webinar Sales Funnel Integration**

---

## 📋 Overview

This document outlines all the n8n webhook endpoints that the PyStack Webinar Sales Funnel application calls, including expected request/response formats, authentication requirements, and implementation guidelines.

**Base URL**: `https://your-n8n-instance.app.n8n.cloud/webhook`

---

## 🔗 Webhook Endpoints Summary

| Endpoint | Purpose | Method | Authentication Required |
|----------|---------|---------|------------------------|
| `/capture-lead` | Webinar registration | POST | No |
| `/simulate-payment` | Payment processing | POST | No |
| `/validate-coupon` | Coupon validation | POST | No |
| `/contact-form` | Contact form submissions | POST | No |
| `/ai-chat` | AI chat support | POST | No |
| `/auth/register` | User account registration | POST | No |
| `/auth/login` | User login validation | POST | No |
| `/admin-auth` | Admin authentication | POST | No |

---

## 1️⃣ Webinar Registration - `/capture-lead`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/capture-lead
Content-Type: application/json
```

### Request Body
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "role": "Industry Professional",
  "source": "website",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Field Descriptions
- **name**: Full name of the user (required)
- **email**: Valid email address (required)
- **phone**: Phone number with country code (optional)
- **role**: User's professional role - options: "Student", "Faculty", "Industry Professional", "Entrepreneur", "Other"
- **source**: Traffic source (default: "website")
- **timestamp**: ISO 8601 timestamp of registration
- **ip_address**: Client IP for analytics
- **user_agent**: Browser user agent string

### Expected Response
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "leadId": "lead_12345",
  "followUpScheduled": true,
  "whatsappGroup": "https://chat.whatsapp.com/xyz123"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid email format",
  "message": "Please provide a valid email address"
}
```

---

## 2️⃣ Payment Processing - `/simulate-payment`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/simulate-payment
Content-Type: application/json
```

### Request Body
```json
{
  "email": "john.doe@example.com",
  "status": "success",
  "transaction_id": "txn_1729852200123",
  "amount": 3999,
  "originalAmount": 4999,
  "couponCode": "SAVE20",
  "discount": 20,
  "currency": "INR",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "paymentMethod": "UPI",
  "customerInfo": {
    "name": "John Doe",
    "phone": "+1-555-123-4567"
  }
}
```

### Field Descriptions
- **email**: Customer email (must match registration)
- **status**: Payment status - "success", "failed", or "need_time_to_confirm"
- **transaction_id**: Unique transaction identifier
- **amount**: Final amount paid (after discount)
- **originalAmount**: Original price before discount
- **couponCode**: Applied coupon code (if any)
- **discount**: Discount percentage applied
- **currency**: Payment currency (default: "INR")
- **paymentMethod**: Payment method used

### Expected Response - Success
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "transactionId": "txn_1729852200123",
  "receiptUrl": "https://example.com/receipt/txn_1729852200123",
  "webinarAccess": {
    "meetingLink": "https://zoom.us/j/123456789",
    "accessCode": "PYSTACK2025",
    "startTime": "2025-10-15T14:00:00.000Z"
  },
  "emailSent": true
}
```

### Expected Response - Failed
```json
{
  "success": false,
  "message": "Payment failed",
  "transactionId": "txn_1729852200123",
  "errorCode": "INSUFFICIENT_FUNDS",
  "retryAllowed": true
}
```

---

## 3️⃣ Coupon Validation - `/validate-coupon`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/validate-coupon
Content-Type: application/json
```

### Request Body
```json
{
  "couponCode": "SAVE20",
  "email": "john.doe@example.com",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "action": "validate_coupon",
  "originalAmount": 4999
}
```

### Expected Response - Valid Coupon
```json
{
  "valid": true,
  "couponCode": "SAVE20",
  "discount": 20,
  "discountType": "percentage",
  "newAmount": 3999,
  "message": "Coupon applied successfully!",
  "expiryDate": "2025-12-31T23:59:59.000Z",
  "usageLimit": 100,
  "usageCount": 45
}
```

### Expected Response - Invalid Coupon
```json
{
  "valid": false,
  "message": "Invalid or expired coupon code",
  "errorType": "EXPIRED",
  "suggestedCoupons": ["WELCOME10", "STUDENT15"]
}
```

---

## 4️⃣ Contact Form - `/contact-form`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/contact-form
Content-Type: application/json
```

### Request Body
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "message": "I have questions about the webinar content and prerequisites. Can you provide more details about the Python frameworks covered?",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "source": "contact_form",
  "page": "/contact",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Message received successfully",
  "ticketId": "TICKET_789123",
  "estimatedResponse": "24 hours",
  "autoReplysent": true
}
```

---

## 5️⃣ AI Chat Support - `/ai-chat`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/ai-chat
Content-Type: application/json
```

### Request Body
```json
{
  "message": "What topics will be covered in the Python webinar?",
  "sessionId": "chat_session_456789",
  "userId": "user_123456",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "type": "ai_chat_request",
  "context": {
    "page": "/",
    "userRegistered": true,
    "previousMessages": 3
  }
}
```

### Expected Response
```json
{
  "success": true,
  "response": "Our Python Full Stack webinar covers Django, FastAPI, React integration, database design, deployment strategies, and real-world project development. You'll learn to build complete web applications from backend APIs to frontend interfaces.",
  "sessionId": "chat_session_456789",
  "timestamp": "2025-10-06T10:30:15.000Z",
  "followUpQuestions": [
    "Would you like to know about the prerequisites?",
    "Are you interested in the hands-on projects?",
    "Do you want details about certification?"
  ]
}
```

---

## 6️⃣ User Registration - `/auth/register`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/auth/register
Content-Type: application/json
```

### Request Body
```json
{
  "name": "Alex Johnson",
  "email": "alex.johnson@example.com",
  "password": "$2b$10$hashedPasswordString...",
  "phone": "+1-555-987-6543",
  "role": "Student",
  "type": "user_registration",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Expected Response - Success
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_789123",
  "emailVerificationSent": true,
  "user": {
    "id": "user_789123",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "phone": "+1-555-987-6543",
    "role": "Student",
    "registrationDate": "2025-10-06T10:30:00.000Z"
  }
}
```

### Expected Response - Email Exists
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "existingUser": {
    "email": "alex.johnson@example.com",
    "registrationDate": "2025-09-15T08:20:00.000Z"
  }
}
```

---

## 7️⃣ User Login - `/auth/login`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/auth/login
Content-Type: application/json
```

### Request Body
```json
{
  "email": "alex.johnson@example.com",
  "password": "userPlainTextPassword",
  "type": "user_login",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Expected Response - Success
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_789123",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "phone": "+1-555-987-6543",
    "role": "Student",
    "lastLogin": "2025-10-06T10:30:00.000Z",
    "loginCount": 15
  }
}
```

### Expected Response - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS",
  "attemptsRemaining": 3
}
```

### Expected Response - Account Not Found
```json
{
  "success": false,
  "message": "No account found with this email address",
  "errorCode": "ACCOUNT_NOT_FOUND",
  "suggestRegistration": true
}
```

---

## 8️⃣ Admin Authentication - `/admin-auth`

### Request Format
```http
POST https://your-n8n-instance.app.n8n.cloud/webhook/admin-auth
Content-Type: application/json
```

### Request Body
```json
{
  "username": "admin_user",
  "password": "secure_admin_password",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "source": "admin-login",
  "action": "validate_credentials",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Expected Response - Success
```json
{
  "valid": true,
  "message": "Admin authentication successful",
  "userInfo": {
    "username": "admin_user",
    "role": "admin",
    "permissions": ["dashboard", "analytics", "user_management", "payment_tracking"],
    "lastLogin": "2025-10-05T15:20:00.000Z"
  }
}
```

### Expected Response - Invalid
```json
{
  "valid": false,
  "message": "Invalid admin credentials",
  "errorCode": "INVALID_ADMIN_CREDENTIALS",
  "lockoutWarning": false
}
```

---

## 🛡️ Security Requirements

### Rate Limiting
- Implement rate limiting: **100 requests per 15 minutes per IP**
- Special limits for authentication endpoints: **5 attempts per minute**

### Data Validation
- Always validate email format using regex
- Sanitize all input data to prevent injection attacks
- Implement proper error handling for malformed requests

### Response Headers
```http
Content-Type: application/json
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 🔧 Error Handling Standards

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "MACHINE_READABLE_ERROR_CODE",
  "timestamp": "2025-10-06T10:30:00.000Z",
  "requestId": "req_123456789"
}
```

### Common Error Codes
- `INVALID_EMAIL`: Email format is invalid
- `MISSING_REQUIRED_FIELD`: Required field is missing
- `EMAIL_ALREADY_EXISTS`: Email already registered
- `ACCOUNT_NOT_FOUND`: No account found for email
- `INVALID_CREDENTIALS`: Wrong password or email
- `COUPON_EXPIRED`: Coupon code has expired
- `COUPON_INVALID`: Coupon code doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## 📊 Analytics & Logging

### Required Logging
For each webhook call, log:
- Timestamp
- IP address
- User agent
- Request payload (sanitized)
- Response status
- Processing time
- Any errors encountered

### Recommended Analytics
- Track conversion rates by source
- Monitor popular coupon codes
- Analyze user registration patterns
- Payment success/failure rates
- AI chat interaction metrics

---

## 🚀 Implementation Checklist

### For Each Webhook:
- [ ] Set up proper error handling
- [ ] Implement request validation
- [ ] Add rate limiting
- [ ] Configure logging
- [ ] Set up monitoring/alerts
- [ ] Test with sample data
- [ ] Validate response formats
- [ ] Implement security headers

### Testing Endpoints:
Use tools like Postman or curl to test each endpoint with the provided sample data.

```bash
# Example curl command for testing
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/capture-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1-555-123-4567",
    "role": "Student",
    "source": "website",
    "timestamp": "2025-10-06T10:30:00.000Z"
  }'
```

---

## 📞 Support & Questions

For technical questions about implementing these webhooks:
- Review the application logs for actual request formats
- Test with sample data provided above
- Ensure proper CORS configuration for frontend integration
- Implement proper error handling for network timeouts

**Note**: All timestamps should be in ISO 8601 format (UTC). All monetary amounts are in the smallest currency unit (paise for INR).

---

*This documentation is for the PyStack Webinar Sales Funnel application v2.0 with authentication system.*