# API Documentation - Webinar Sales Funnel Application

**Version:** 1.0.0  
**Last Updated:** November 15, 2025  
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
  "message": "10% discount applied successfully",
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
      "LEADS": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0",
      "PAYMENTS": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=1"
    },
    "editUrls": {
      "LEADS": "https://docs.google.com/spreadsheets/d/.../edit#gid=0"
    },
    "gids": {
      "LEADS": "0",
      "PAYMENTS": "1"
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
- Password is bcrypt hashed before sending
- If `success: false`, registration is rejected
- Typically stores data in Google Sheets "Leads" tab

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
- Backend compares password with bcrypt
- Used for both login and session verification
- Queries Google Sheets for user data

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
- Records transaction in Google Sheets
- May trigger email notifications
- Updates user payment status

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
- Validates against Google Sheets coupon database
- Returns discount percentage/amount
- May check usage limits and expiry

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
- May integrate with OpenAI or other LLM services
- Can use RAG with FAQs database
- Logs conversation for analysis

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
- Updates query status in Google Sheets
- Sends email response to user
- May trigger follow-up workflows

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
- Validates credentials from Google Sheets
- May implement rate limiting
- Logs admin access attempts

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
JWT_SECRET=your-secret-key-min-32-chars
API_BASE_URL=https://your-n8n-instance.com/webhook
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Optional:
```env
PORT=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
N8N_GET_SETTINGS_WEBHOOK=https://custom-url.com
N8N_UPDATE_SETTINGS_WEBHOOK=https://custom-url.com
```

## Best Practices

1. **Always use HTTPS in production**
2. **Rotate JWT_SECRET periodically**
3. **Monitor rate limit violations**
4. **Log authentication failures**
5. **Validate all user inputs**
6. **Sanitize data before n8n webhooks**
7. **Implement request timeouts (10-15s)**
8. **Use environment-specific configurations**
9. **Keep dependencies updated**
10. **Regular security audits**

---

## Support & Contact

For API support or integration questions:
- **Email:** webinar@pystack.com
- **Documentation:** https://github.com/your-repo/wiki
- **Issues:** https://github.com/your-repo/issues

---

**Document Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Maintained by:** Development Team
