# API Documentation - Webinar Sales Funnel Application

**Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Base URL (Backend):** `http://localhost:5000/api` (Development) | `https://your-domain.com/api` (Production)  
**Base URL (n8n):** Configured via `API_BASE_URL` environment variable

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Frontend to Backend APIs](#frontend-to-backend-apis)
   - [User Authentication](#user-authentication)
   - [Payment Operations](#payment-operations)
   - [Contact & Support](#contact--support)
   - [Admin Operations](#admin-operations)
   - [Configuration](#configuration)
4. [Backend to n8n Webhooks](#backend-to-n8n-webhooks)
   - [User Management](#user-management)
   - [Payment Processing](#payment-processing)
   - [Communication](#communication)
   - [Admin Management](#admin-management)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security Considerations](#security-considerations)

---

## Overview

This API documentation covers two main integration layers:

1. **Frontend → Backend:** REST APIs for client applications
2. **Backend → n8n:** Webhook integrations for workflow automation and data storage

### Architecture Flow

```
Frontend Application
    ↓ (HTTP/HTTPS)
Backend API Server
    ↓ (Webhook)
n8n Automation Platform
    ↓
Google Sheets / External Services
```

---

## Authentication

### Token-Based Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Token Header Format:**
```
Authorization: Bearer <token>
```

**Cookie-Based (Alternative):**
```
Cookie: authToken=<token>
```

**Token Expiry:**
- Default: 7 days
- With "Remember Me": 30 days

---

# Frontend to Backend APIs

## User Authentication

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string",              // Required, 2-100 chars
  "email": "string",             // Required, valid email format
  "password": "string",          // Required, min 6 chars
  "mobile": "string",            // Optional, valid phone number
  "role": "string",              // Optional
  "rememberMe": "boolean",       // Optional, default: false
  "source": "string"             // Optional, default: "Direct"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student",
    "reg_timestamp": "2025-11-15T10:30:00.000Z",
    "payment_status": null,
    "couponCode": null
  }
}
```

**Response Headers:**
```
Set-Cookie: authToken=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

**409 Conflict - Email Already Exists:**
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "suggestion": "Try logging in instead, or use a different email address"
}
```

**503 Service Unavailable - n8n Down:**
```json
{
  "success": false,
  "message": "Registration service temporarily unavailable. Please try again later.",
  "errorCode": "SERVICE_UNAVAILABLE"
}
```

---

### 2. Login User

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "string",           // Required, valid email
  "password": "string",        // Required
  "rememberMe": "boolean"      // Optional, default: false
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student",
    "payment_status": "Success",
    "couponCode": "EARLY50"
  }
}
```

**Response Headers:**
```
Set-Cookie: authToken=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

**401 Unauthorized - Wrong Password:**
```json
{
  "success": false,
  "message": "Password is incorrect"
}
```

**404 Not Found - User Doesn't Exist:**
```json
{
  "success": false,
  "message": "No account found with this email address"
}
```

---

### 3. Verify User Token

Verify and refresh user session data.

**Endpoint:** `GET /api/auth/verify`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
skipFreshData=true     // Optional, skip n8n data fetch
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student",
    "payment_status": "Success",
    "couponCode": "EARLY50"
  }
}
```

---

### 4. Refresh Token

Renew JWT token before expiry.

**Endpoint:** `POST /api/auth/refresh`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

---

### 5. Logout User

End user session and clear cookies.

**Endpoint:** `POST /api/auth/logout`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Payment Operations

### 6. Validate Coupon

Validate a discount coupon code.

**Endpoint:** `POST /api/validate-coupon`

**Request Body:**
```json
{
  "couponcode_applied": "string",    // Required, 1-20 chars
  "email": "string"                  // Required, valid email
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon applied! 10% discount",
  "discount_percentage": 10,
  "couponcode_applied": "EARLY10"
}
```

**Invalid Coupon Response (200 OK):**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

---

### 7. Simulate Payment

Process payment transaction (simulation mode).

**Endpoint:** `POST /api/simulate-payment`

**Request Body:**
```json
{
  "email": "string",                    // Required, valid email
  "payment_status": "string",           // Required: "Success" | "Need Time" | "Failure"
  "txn_id": "string",                   // Optional, auto-generated if not provided
  "couponcode_applied": "string",       // Optional
  "discount_percentage": "number"       // Optional, 0-100
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment Success processed successfully",
  "data": {
    "txn_id": "txn_1731672000000_abc123",
    "payment_status": "Success",
    "txn_timestamp": "2025-11-15T10:30:00.000Z",
    "paid_amt": 4499,
    "reg_fee": 4999,
    "payable_amt": 4499,
    "discount_amt": 500,
    "whatsapp_link": "https://chat.whatsapp.com/sample-group-link",
    "confirmation_pending": false
  }
}
```

**Need Time Response (200 OK):**
```json
{
  "success": true,
  "message": "Time to confirm request recorded successfully",
  "data": {
    "txn_id": "txn_1731672000000_abc123",
    "payment_status": "Need Time",
    "txn_timestamp": "2025-11-15T10:30:00.000Z",
    "whatsapp_link": null,
    "confirmation_pending": true
  }
}
```

---

## Contact & Support

### 8. Submit Contact Form

Submit a contact/support query.

**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "name": "string",        // Required, 2-100 chars
  "email": "string",       // Required, valid email
  "mobile": "string",      // Optional
  "query": "string"        // Required, 10-1000 chars
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!",
  "data": {
    "query_timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

---

### 9. AI Chat Query

Send a query to AI chatbot.

**Endpoint:** `POST /api/ai-chat`

**Request Body:**
```json
{
  "query": "string",          // Required, 1-1000 chars
  "sessionId": "string",      // Optional
  "userId": "string"          // Optional
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "response": "The webinar will be held on November 22, 2025 at 7:00 PM IST...",
  "sessionId": "chat_1731672000000",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "source": "n8n"
}
```

**Fallback Response (503 Service Unavailable):**
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "message": "I'm currently down for maintenance. You can directly contact us from our Contact page...",
  "sessionId": "chat_1731672000000",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "source": "error"
}
```

---

### 10. Send Query Response

Send admin response to a user query (admin action).

**Endpoint:** `POST /api/send-response`

**Request Headers:**
```
Authorization: Bearer <admin_token>    // Admin authentication required
```

**Request Body:**
```json
{
  "ticket_id": "string",                    // Required
  "email": "string",                        // Required, valid email
  "query_reply": "string",                  // Required
  "name": "string",                         // Optional
  "mobile": "string",                       // Optional
  "query": "string",                        // Optional
  "query_category": "string",               // Optional, default: "General"
  "query_status": "string",                 // Optional, default: "Pending Approval"
  "query_resolved_by": "string",            // Optional, default: "Admin"
  "query_timestamp": "string",              // Optional, ISO 8601
  "query_resolved_timestamp": "string"      // Optional, ISO 8601
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Response sent successfully!",
  "data": {
    "ticket_id": "ticket_1731672000000",
    "query_resolved_timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

---

## Admin Operations

### 11. Admin Login

Authenticate admin user.

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "username": "string",      // Required
  "password": "string"       // Required
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### 12. Get Dashboard Data

Retrieve admin dashboard statistics.

**Endpoint:** `GET /api/admin/dashboard`

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRegistrations": 350,
      "totalPayments": 180,
      "totalContacts": 120,
      "conversionRate": 28
    },
    "recentActivity": [
      {
        "type": "registration",
        "user": "John Doe",
        "role": "Student",
        "time": "2 hours ago",
        "timestamp": "2025-11-15T08:30:00.000Z"
      }
    ],
    "lastUpdated": "2025-11-15T10:30:00.000Z"
  }
}
```

---

### 13. Refresh Admin Token

Renew admin JWT token.

**Endpoint:** `POST /api/admin/refresh-token`

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 14. Get Settings

Retrieve application settings.

**Endpoint:** `GET /api/settings`

**Success Response (200 OK):**
```json
{
  "success": true,
  "settings": {
    "adminUsername": "admin",
    "registrationFee": 4999,
    "registrationDeadline": "2025-11-20",
    "webinarDate": "2025-11-22",
    "webinarTime": "19:00",
    "contactEmail": "webinar@pystack.com",
    "whatsappLink": "https://chat.whatsapp.com/...",
    "discordLink": "https://discord.gg/...",
    "webinarFeatures": [
      "Python Basics to Advanced",
      "Flask Backend Development"
    ]
  }
}
```

---

### 15. Update Settings

Update application settings (admin only).

**Endpoint:** `PUT /api/admin/settings`

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "adminUsername": "string",              // Required, 1-50 chars
  "adminPassword": "string",              // Optional, min 6 chars if provided
  "registrationFee": "number",            // Required
  "registrationDeadline": "string",       // Required, YYYY-MM-DD
  "webinarDate": "string",                // Required, YYYY-MM-DD
  "webinarTime": "string",                // Required, HH:MM
  "contactEmail": "string",               // Required, valid email
  "whatsappLink": "string",               // Required, valid URL
  "discordLink": "string"                 // Required, valid URL
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "admin_username": "admin",
    "reg_fee": 4999,
    "reg_deadline": "20-11-2025",
    "webinar_date": "22-11-2025",
    "webinar_time": "19:00",
    "contact_email": "webinar@pystack.com",
    "whatsapp_invite": "https://chat.whatsapp.com/...",
    "discord_link": "https://discord.gg/..."
  }
}
```

---

## Configuration

### 16. Get Webinar Info

Retrieve public webinar information.

**Endpoint:** `GET /api/webinar-info`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "title": "Python Full Stack in 5 Days",
    "date": "2025-11-22T19:00:00.000Z",
    "duration": "2 hours",
    "instructor": "Expert Python Developer",
    "topics": [
      "Python Basics to Advanced",
      "Flask Backend Development",
      "React Frontend Integration"
    ],
    "timezone": "UTC",
    "registration_count": 1350
  }
}
```

---

### 17. Get Google Sheets Config

Retrieve Google Sheets configuration URLs.

**Endpoint:** `GET /api/config/google-sheets`

**Success Response (200 OK):**
```json
{
  "success": true,
  "config": {
    "sheetId": "1abc...xyz",
    "csvUrls": {
      "USER_DATA": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0",
      "QUERIES": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=1",
      "ADMIN": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=2"
    },
    "editUrls": {
      "USER_DATA": "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
      "QUERIES": "https://docs.google.com/spreadsheets/d/.../edit#gid=1",
      "ADMIN": "https://docs.google.com/spreadsheets/d/.../edit#gid=2"
    },
    "gids": {
      "USER_DATA": "0",
      "QUERIES": "1",
      "ADMIN": "2"
    }
  }
}
```

---

### 18. Get App Constants

Retrieve application constants and defaults.

**Endpoint:** `GET /api/config/constants`

**Success Response (200 OK):**
```json
{
  "success": true,
  "constants": {
    "CURRENCY_SYMBOL": "₹",
    "CURRENCY": "INR",
    "TOAST_DURATION": 3000,
    "NAVIGATION_DELAY": 2000,
    "DEFAULT_REGISTRATION_FEE": 4999,
    "DEFAULT_REGISTRATION_DEADLINE": "2025-11-20",
    "DEFAULT_WEBINAR_DATE": "2025-11-22",
    "DEFAULT_WEBINAR_TIME": "19:00",
    "DEFAULT_CONTACT_EMAIL": "webinar@pystack.com",
    "DEFAULT_WHATSAPP_LINK": "https://chat.whatsapp.com/...",
    "DEFAULT_DISCORD_LINK": "https://discord.gg/...",
    "DEFAULT_WEBINAR_FEATURES": []
  }
}
```

---

### 19. Health Check

Check API server health and uptime.

**Endpoint:** `GET /health`

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-17T10:30:00.000Z",
  "uptime": 3600.5
}
```

**Notes:**
- Unauthenticated endpoint for monitoring
- Returns server uptime in seconds
- Used by load balancers for health checks
- Does not validate database connectivity

---

# Backend to n8n Webhooks

## User Management

### 1. Capture Lead (Registration)

**n8n Webhook:** `${API_BASE_URL}/capture-lead`  
**Triggered by:** User Registration (`POST /api/auth/register`)

**Request Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$hashed_password_here",
  "mobile": "1234567890",
  "role": "Student",
  "source": "Direct",
  "type": "user_registration",
  "reg_timestamp": "2025-11-15T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Expected n8n Response:**
```json
{
  "success": true,              // Optional, false to reject registration
  "message": "string"           // Optional, error/success message
}
```

**Notes:**
- Password is bcrypt hashed (10 salt rounds) before sending to n8n
- If `success: false`, registration is rejected with HTTP 409 (Conflict)
- Stores data in Google Sheets "User Data" tab with columns: name, email, mobile, role, source, reg_timestamp, password, nurturing, client_status, payable_amt
- Source tracking enables attribution analysis for marketing campaigns
- IP address and user agent logged for security auditing

---

### 2. User Login / Verification

**n8n Webhook:** `${API_BASE_URL}/user-login`  
**Triggered by:** User Login (`POST /api/auth/login`) or Token Verification (`GET /api/auth/verify`)

**Request Payload:**
```json
{
  "email": "john@example.com",
  "action": "user_login",              // or "verify_session"
  "timestamp": "2025-11-15T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Expected n8n Response (Success):**
```json
{
  "user": {
    "email": "john@example.com",         // Required
    "name": "John Doe",                  // Required
    "password": "$2a$10$hashed...",      // Required (bcrypt hash)
    "mobile": "1234567890",              // Optional
    "role": "Student",                   // Optional
    "id": "user_1234567890",             // Optional
    "payment_status": "Success",         // Optional
    "couponcode_given": "EARLY50"        // Optional
  }
}
```

**Expected n8n Response (Error):**
```json
{
  "success": false,
  "message": "No account found with this email address"
}
```

**Notes:**
- Backend performs bcrypt password comparison (never sent to n8n in plain text)
- Used for both initial login and session verification/refresh
- Queries Google Sheets "User Data" tab by email (case-insensitive)
- For session verification with `action: "verify_session"`, password comparison is skipped
- Smart caching: If `payment_status: "Success"`, frontend skips fresh data fetch to reduce load

---

## Payment Processing

### 3. Payment Simulation

**n8n Webhook:** `${API_BASE_URL}/simulate-payment`  
**Triggered by:** Payment Submission (`POST /api/simulate-payment`)

**Request Payload:**
```json
{
  "email": "john@example.com",
  "payment_status": "Success",              // "Success" | "Need Time" | "Failure"
  "txn_id": "txn_1731672000000_abc123",
  "txn_timestamp": "2025-11-15T10:30:00.000Z",
  "paid_amt": 4499,
  "reg_fee": 4999,
  "couponcode_applied": "EARLY10",          // Optional
  "discount_percentage": 10,                // Optional
  "discount_amt": 500,
  "payable_amt": 4499,
  "currency": "INR"
}
```

**Expected n8n Response:**
```json
{
  "payment_status": "Success"               // Optional, echoes or updates status
}
```

**Notes:**
- Records transaction in Google Sheets "User Data" tab
- Updates columns: payment_status, txn_id, txn_timestamp, paid_amt, payable_amt, discount_amt, discount_percentage, couponcode_applied, currency
- Calculation logic:
  - `payable_amt = reg_fee - discount_amt` (always calculated, regardless of status)
  - `paid_amt = payable_amt` (only if `payment_status = "Success"`, otherwise 0)
  - `discount_amt = reg_fee × (discount_percentage / 100)`
- For "Need Time" status: sets `confirmation_pending: true`, no WhatsApp link provided
- For "Success" status: may return WhatsApp community invite link
- May trigger email notifications and automated follow-up workflows

---

### 4. Validate Coupon

**n8n Webhook:** `${API_BASE_URL}/validate-coupon`  
**Triggered by:** Coupon Validation (`POST /api/validate-coupon`)

**Request Payload:**
```json
{
  "couponcode_applied": "EARLY10",
  "email": "john@example.com",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "action": "validate_coupon"
}
```

**Expected n8n Response (Valid):**
```json
{
  "success": true,                          // Required
  "discount": 10,                           // Required (discount percentage)
  "message": "10% discount applied successfully"
}
```

**Expected n8n Response (Invalid):**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

**Notes:**
- Validates against Google Sheets coupon database (separate sheet or embedded in User Data)
- Returns discount percentage (0-100) if valid
- Validation checks may include:
  - Coupon code exists and is active
  - Expiry date not exceeded
  - Usage limit not exceeded
  - User eligibility (e.g., first-time users only)
  - Minimum purchase requirements
- Response returns `discount_percentage` field for consistency with payment calculations
- Frontend displays: "Coupon applied! {X}% discount"

---

## Communication

### 5. Contact Form

**n8n Webhook:** `${API_BASE_URL}/contact-form`  
**Triggered by:** Contact Form Submission (`POST /api/contact`)

**Request Payload:**
```json
{
  "query": "I have a question about the webinar schedule...",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",                   // Optional, defaults to "NA"
  "type": "contact_form",
  "query_timestamp": "2025-11-15T10:30:00.000Z",
  "ip_address": "192.168.1.1"
}
```

**Expected n8n Response:**
```json
{
  "message": "Thank you for your message. We will get back to you soon!"
}
```

**Notes:**
- Stores query in Google Sheets
- May trigger email notification to admin
- May auto-respond to user

---

### 6. AI Chat

**n8n Webhook:** `${API_BASE_URL}/ai-chat`  
**Triggered by:** AI Chat Query (`POST /api/ai-chat`)

**Request Payload:**
```json
{
  "query": "When is the webinar?",
  "sessionId": "chat_1731672000000",
  "userId": "anonymous",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "type": "ai_chat"
}
```

**Expected n8n Response:**
```json
{
  "response": "The webinar will be held on November 22, 2025 at 7:00 PM IST..."
}
```

**Notes:**
- Integrates with AI/LLM services (e.g., OpenAI, Claude, or custom models) via n8n
- May implement RAG (Retrieval-Augmented Generation) using:
  - FAQ database from Google Sheets
  - Webinar content and schedule information
  - Previous query-response pairs for context
- Responses prefixed with "AI Recommendation:", "AI Recomendation:" (typo variant), or "AI Response:" for admin review
- Logs conversations in Google Sheets for analysis and improvement
- Fallback responses when AI service unavailable:
  - "I'm currently down for maintenance. You can directly contact us from our Contact page..."
- Session tracking via `sessionId` for conversation continuity
- User identification via `userId` or "anonymous" for personalization

---

### 7. Send Query Response

**n8n Webhook:** `${API_BASE_URL}/send-response`  
**Triggered by:** Admin Response (`POST /api/send-response`)

**Request Payload:**
```json
{
  "ticket_id": "ticket_1731672000000",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "query": "Original query text...",
  "query_reply": "Admin response text...",
  "query_category": "General",
  "query_status": "Resolved",
  "query_resolved_by": "Admin",
  "query_timestamp": "2025-11-15T10:30:00.000Z",
  "query_resolved_timestamp": "2025-11-15T11:00:00.000Z",
  "type": "query_response",
  "ip_address": "192.168.1.1"
}
```

**Expected n8n Response:**
```json
{
  "success": true
}
```

**Notes:**
- Updates query status in Google Sheets "Queries" tab
- Status transitions: "Pending Approval" → "Admin Processed" → "Resolved"
- Columns updated: query_reply, query_status, query_resolved_by, query_resolved_timestamp
- Sends email response to user with admin reply
- Frontend strips "AI Recommendation:"/"AI Response:" prefix before sending
- Admin can edit AI-generated responses before approval
- May trigger automated follow-up workflows:
  - Satisfaction survey after 24 hours
  - Reminder if no response from user
  - Escalation if issue unresolved
- Ticket tracking via unique `ticket_id` for reference

---

## Admin Management

### 8. Admin Authentication

**n8n Webhook:** `${API_BASE_URL}/admin-auth`  
**Triggered by:** Admin Login (`POST /api/admin/login`)

**Request Payload:**
```json
{
  "username": "admin",
  "password": "admin_password",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "source": "admin-login",
  "action": "validate_credentials"
}
```

**Expected n8n Response (Valid):**
```json
{
  "valid": true,                            // Required
  "message": "Authentication successful"    // Optional
}
```

**Expected n8n Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid credentials"
}
```

**Notes:**
- Validates credentials from Google Sheets "Admin" tab
- Credentials stored: `admin_username`, `admin_password` (plain text in Google Sheets)
- **Security Warning:** Admin passwords in Google Sheets should be bcrypt hashed in production
- Implements intentional 1-second delay on failed attempts (timing attack prevention)
- Rate limiting applies (same as other endpoints: 100 req/15 min)
- Logs all admin access attempts with:
  - Timestamp
  - Source IP address
  - Success/failure status
  - User agent information
- Failed attempts should trigger alerts after threshold exceeded
- Consider implementing 2FA for enhanced admin security

---

### 9. Get Admin Settings

**n8n Webhook:** `${API_BASE_URL}/get-settings`  
**Triggered by:** Settings Fetch (`GET /api/settings`)

**Request:** GET request (no body)

**Expected n8n Response:**
```json
{
  "success": true,                          // Required
  "settings": {
    "reg_fee": 4999,                        // Required
    "reg_deadline": "20-11-2025",           // Required, DD-MM-YYYY
    "webinar_date": "22-11-2025",           // Required, DD-MM-YYYY
    "webinar_time": "19:00",                // Required, HH:MM
    "contact_email": "webinar@pystack.com", // Required
    "whatsapp_invite": "https://...",       // Required
    "discord_link": "https://..."           // Required
  }
}
```

**Notes:**
- Retrieves settings from Google Sheets "Admin" tab
- Dates in DD-MM-YYYY format (converted by backend)
- Cached for performance

---

### 10. Update Admin Settings

**n8n Webhook:** `${API_BASE_URL}/post-settings`  
**Triggered by:** Settings Update (`PUT /api/admin/settings`)

**Request Payload:**
```json
{
  "sheet": "Admin",
  "action": "update_settings",
  "data": {
    "admin_username": "admin",
    "admin_password": "new_password",       // Optional, only if changed
    "reg_fee": 4999,
    "reg_deadline": "20-11-2025",           // DD-MM-YYYY
    "webinar_date": "22-11-2025",           // DD-MM-YYYY
    "webinar_time": "19:00",                // HH:MM
    "contact_email": "webinar@pystack.com",
    "whatsapp_invite": "https://...",
    "discord_link": "https://..."
  }
}
```

**Expected n8n Response:**
```json
{
  "success": true,                          // Optional
  "message": "Settings updated successfully",
  "settings": {
    "admin_username": "admin",
    "reg_fee": 4999,
    "reg_deadline": "20-11-2025",
    "webinar_date": "22-11-2025",
    "webinar_time": "19:00",
    "contact_email": "webinar@pystack.com",
    "whatsapp_invite": "https://...",
    "discord_link": "https://..."
  }
}
```

**Notes:**
- Updates Google Sheets "Admin" tab
- Password is optional, only updated if provided
- May trigger cache invalidation

---

# Error Handling

## Standard Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "errorCode": "ERROR_CODE",               // Optional
  "details": []                            // Optional, validation errors
}
```

## HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Authentication required/failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email) |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | n8n service down |

## Common Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `EMAIL_ALREADY_EXISTS` | Email already registered |
| `SERVICE_UNAVAILABLE` | n8n service unavailable |
| `SERVICE_NOT_CONFIGURED` | n8n webhook not configured |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `TOKEN_EXPIRED` | JWT token expired |
| `INVALID_TOKEN` | JWT token invalid |
| `UNAUTHORIZED` | No authentication provided |
| `FORBIDDEN` | Insufficient permissions |

## Validation Error Format

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long",
      "value": ""
    }
  ]
}
```

---

# Rate Limiting

## Configuration

- **Window:** 15 minutes
- **Max Requests:** 100 per IP address
- **Applies to:** All `/api/*` endpoints

## Rate Limit Response (429 Too Many Requests)

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1731672900
```

---

# Security Considerations

## Authentication

1. **JWT Tokens:**
   - Signed with `JWT_SECRET` environment variable
   - HTTP-only cookies for web clients
   - Bearer tokens for API clients

2. **Password Storage:**
   - Bcrypt hashing with salt rounds: 10
   - Plain passwords never logged or stored
   - Password comparison done server-side only

3. **Token Security:**
   - Tokens expire (7 days default, 30 days with "Remember Me")
   - Refresh mechanism available
   - Secure flag in production
   - SameSite: strict

## CORS Configuration

```javascript
{
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
}
```

## Input Validation

1. **Request Size Limit:** 2MB
2. **Field Validation:** express-validator
3. **Email Normalization:** Lowercase, trimmed
4. **XSS Protection:** Helmet middleware
5. **SQL Injection:** N/A (using Google Sheets, not SQL)

## HTTPS

- **Development:** HTTP allowed
- **Production:** HTTPS enforced via redirect
- **Headers:** `X-Forwarded-Proto` checked

## Environment Variables

### Required:
```env
# JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars-use-strong-random-string

# n8n Integration
API_BASE_URL=https://your-n8n-instance.com/webhook

# Frontend Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Environment
NODE_ENV=production

# Google Sheets Configuration
GOOGLE_SHEET_ID=1MBTt9nmLy82_vgB_xxEHXPPdimpto3T9z84QtRbh4Js
SHEET_GID_USER_DATA=0
SHEET_GID_QUERIES=<your_queries_gid>
SHEET_GID_ADMIN=<your_admin_gid>
```

### Optional:
```env
# Server Configuration
PORT=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Custom Webhook URLs (overrides API_BASE_URL if set)
N8N_GET_SETTINGS_WEBHOOK=https://custom-url.com/get-settings
N8N_UPDATE_SETTINGS_WEBHOOK=https://custom-url.com/post-settings
```

## Best Practices

1. **Always use HTTPS in production** - Enforced via middleware redirect
2. **Rotate JWT_SECRET periodically** - Minimum 32 characters, strong entropy
3. **Monitor rate limit violations** - Track suspicious patterns and IP blocks
4. **Log authentication failures** - Audit trail for security analysis
5. **Validate all user inputs** - Use express-validator on all endpoints
6. **Sanitize data before n8n webhooks** - Prevent injection attacks
7. **Implement request timeouts (10-15s)** - Prevent hanging connections
8. **Use environment-specific configurations** - Separate .env files per environment
9. **Keep dependencies updated** - Regular npm audit and updates
10. **Regular security audits** - Penetration testing and code reviews
11. **Implement proper CORS** - Whitelist specific origins only
12. **Enable request logging** - Use morgan for production monitoring
13. **Handle errors gracefully** - Never expose stack traces in production
14. **Backup Google Sheets data** - Regular automated backups
15. **Monitor n8n webhook health** - Alerting for service disruptions

---

# Troubleshooting

## Common Issues

### 1. 503 Service Unavailable - n8n Connection Failed

**Symptoms:**
- API returns `"errorCode": "SERVICE_UNAVAILABLE"`
- Registration, login, or payment operations fail

**Causes:**
- n8n service is down or unreachable
- Incorrect `API_BASE_URL` configuration
- Firewall blocking webhook requests
- Network connectivity issues

**Solutions:**
1. Verify n8n service is running: `curl ${API_BASE_URL}/health`
2. Check `API_BASE_URL` in backend `.env` file
3. Verify firewall rules allow outbound HTTPS to n8n
4. Check n8n logs for webhook registration errors
5. Test webhook manually using Postman/curl

---

### 2. 401 Unauthorized - Token Invalid or Expired

**Symptoms:**
- "Access token required" or "Invalid token" errors
- User logged out unexpectedly

**Causes:**
- JWT token expired (7 or 30 days)
- JWT_SECRET mismatch between sessions
- Cookie cleared or blocked

**Solutions:**
1. Use token refresh endpoint: `POST /api/auth/refresh`
2. Implement auto-refresh before expiry in frontend
3. Verify JWT_SECRET hasn't changed
4. Check browser cookie settings (allow third-party if needed)
5. Re-authenticate user if refresh fails

---

### 3. 409 Conflict - Email Already Exists

**Symptoms:**
- Registration fails with "email already exists"
- User certain they haven't registered before

**Causes:**
- Duplicate email in Google Sheets
- Case-sensitivity issues (JOHN@EMAIL vs john@email)
- Test data not cleaned up

**Solutions:**
1. Check Google Sheets "User Data" tab for duplicate emails
2. Use "Find & Replace" in Google Sheets (case-insensitive)
3. Implement forgot password flow for existing users
4. Clean test data regularly in development

---

### 4. Payment Calculation Mismatch

**Symptoms:**
- Frontend shows different amount than backend
- Discount not applying correctly

**Causes:**
- Settings cache not refreshed after admin changes
- Race condition between settings fetch and payment
- Rounding errors in calculation

**Causes & Solutions:**
1. **Settings cache:** Force refresh with `getSettings(forceRefresh: true)`
2. **Race condition:** Always fetch latest `registrationFee` before payment
3. **Rounding:** Use `.toFixed(2)` for all currency calculations
4. **Verification:** Log all values in payment calculation:
   ```javascript
   console.log('[Payment Debug]', {
     reg_fee, discount_amt, payable_amt, paid_amt
   })
   ```

---

### 5. Rate Limit Exceeded (429 Too Many Requests)

**Symptoms:**
- "Too many requests from this IP" error
- Legitimate users blocked

**Causes:**
- Shared network (office, university)
- Aggressive polling/refresh
- DDoS attack or bot traffic

**Solutions:**
1. Increase rate limits in production: `RATE_LIMIT_MAX_REQUESTS=200`
2. Implement per-user rate limiting (not just IP)
3. Add exponential backoff on frontend retries
4. Use CDN for static assets (reduce API calls)
5. Implement IP whitelisting for known clients

---

### 6. Google Sheets Sync Issues

**Symptoms:**
- Data not appearing in Google Sheets
- Old data showing in admin dashboard
- "Settings not loaded" errors

**Causes:**
- Google Sheets API quota exceeded
- Incorrect sheet permissions
- Wrong GID configuration
- n8n workflow not triggered

**Solutions:**
1. Verify Google Sheets is accessible (not restricted)
2. Check sheet sharing settings (Anyone with link can view)
3. Verify GIDs match actual sheet tabs:
   - Right-click sheet tab → "Copy link" → Extract `gid=XXXXX`
4. Test n8n workflows manually
5. Check Google API quotas and usage
6. Verify n8n has proper Google Sheets credentials

---

### 7. CORS Errors in Browser Console

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- API calls fail from frontend

**Causes:**
- `FRONTEND_URL` mismatch
- Missing credentials in fetch
- Preflight OPTIONS request failing

**Solutions:**
1. Update `FRONTEND_URL` in backend `.env` to match exactly
2. Ensure frontend uses `credentials: 'include'` in fetch
3. Verify CORS middleware configuration
4. Check for trailing slashes in URLs (with vs without)
5. Use same domain for frontend/backend in production (or subdomain)

---

## Debugging Tips

### Enable Detailed Logging

**Backend (.env):**
```env
NODE_ENV=development
DEBUG=express:*
```

**Frontend (console):**
```javascript
localStorage.setItem('debug', 'api:*')
```

### Test Webhooks Manually

```bash
# Test registration webhook
curl -X POST ${API_BASE_URL}/capture-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "$2a$10$hashedpassword",
    "mobile": "1234567890",
    "role": "Student",
    "source": "Direct",
    "type": "user_registration",
    "reg_timestamp": "2025-11-17T10:30:00.000Z"
  }'

# Test login webhook
curl -X POST ${API_BASE_URL}/user-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "action": "user_login",
    "timestamp": "2025-11-17T10:30:00.000Z"
  }'
```

### Verify JWT Token

```bash
# Decode JWT without verification (for debugging only)
echo "<your_jwt_token>" | cut -d'.' -f2 | base64 -d | jq

# Or use jwt.io to decode and inspect claims
```

### Monitor n8n Workflows

1. Access n8n dashboard: `https://your-n8n-instance.com`
2. Navigate to "Executions" tab
3. Filter by workflow name and date
4. Inspect failed executions for error details
5. Check webhook trigger logs

---

## Support & Contact

For API support, integration questions, or bug reports:

**Primary Contact:**
- **Email:** webinar@pystack.com
- **Response Time:** 24-48 hours (business days)

**Developer Resources:**
- **Documentation:** https://github.com/your-repo/wiki
- **API Issues:** https://github.com/your-repo/issues
- **Changelog:** https://github.com/your-repo/releases
- **Status Page:** https://status.your-domain.com (if available)

**Community Support:**
- **Discord:** https://discord.gg/your-community
- **Stack Overflow:** Tag questions with `webinar-sales-funnel`

**Enterprise Support:**
For SLA-backed support, custom integrations, or dedicated assistance, contact: enterprise@pystack.com

---

## Appendix

### API Versioning

This API follows semantic versioning. Current version: **1.0.0**

- **Major version (1.x.x):** Breaking changes
- **Minor version (x.1.x):** New features, backward compatible
- **Patch version (x.x.1):** Bug fixes, backward compatible

**Version Header (Future):**
```
API-Version: 1.0
```

### Webhook Retry Policy

n8n webhooks should implement retry logic for failed requests:

- **Retry Count:** 3 attempts
- **Backoff Strategy:** Exponential (1s, 4s, 16s)
- **Timeout:** 15 seconds per attempt
- **Status Codes for Retry:** 500, 502, 503, 504
- **No Retry:** 400, 401, 403, 404, 409

### Data Retention

- **User Data:** Retained indefinitely (GDPR: user can request deletion)
- **Logs:** 90 days (rotating)
- **Session Tokens:** 7-30 days (auto-expire)
- **Payment Records:** 7 years (compliance requirement)

### Performance Benchmarks

**Expected Response Times (95th percentile):**

| Endpoint | Target | Notes |
|----------|--------|-------|
| `/api/auth/register` | < 500ms | Includes n8n webhook call |
| `/api/auth/login` | < 400ms | Includes password verification |
| `/api/validate-coupon` | < 300ms | n8n lookup required |
| `/api/simulate-payment` | < 600ms | Complex calculation + n8n |
| `/api/settings` | < 100ms | Cached response |
| `/api/admin/dashboard` | < 2000ms | Large dataset processing |

**n8n Webhook Timeouts:**
- Default: 10 seconds
- Extended (dashboard, reports): 30 seconds

---

**Document Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Maintained by:** PyStack Development Team  
**License:** Proprietary - All Rights Reserved
