# n8n Webhook API Response Documentation

This document outlines the expected responses from n8n webhooks for all API endpoints in the Webinar Sales Funnel application.

---

## Table of Contents

1. [Lead Capture](#1-lead-capture)
2. [Contact Form](#2-contact-form)
3. [AI Chat](#3-ai-chat)
4. [Payment Simulation](#4-payment-simulation)
5. [Coupon Validation](#5-coupon-validation)
6. [User Registration (Auth)](#6-user-registration-auth)
7. [User Login (Auth)](#7-user-login-auth)

---

## 1. Lead Capture

**Endpoint:** `POST ${API_BASE_URL}/capture-lead`

### Request Payload
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "role": "Student",
  "source": "registration_page",
  "password": "$2a$10$abc123...",
  "reg_timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Lead captured successfully"
}
```

**Alternative Success Format:**
```json
{
  "status": "success",
  "message": "Lead registered successfully"
}
```

**Note:** n8n does NOT need to return a lead ID. The backend will track registrations using the email address.

### Error Responses

#### Duplicate Email (409 Conflict)
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "DUPLICATE_EMAIL"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid email format",
  "errorCode": "VALIDATION_ERROR"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Success:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "reg_timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```

**On n8n Failure:**
```json
{
  "success": false,
  "error": "Registration service temporarily unavailable",
  "message": "Unable to complete registration. Please try again later."
}
```
Status Code: `503`

---

## 2. Contact Form

**Endpoint:** `POST ${API_BASE_URL}/contact-form`

### Request Payload
```json
{
  "query": "I have a question about the webinar...",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "type": "contact_form",
  "query_timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!",
  "ticket_id": "TICKET_1234567890"
}
```

**Alternative Success Format:**
```json
{
  "ticket_id": "TICKET_1234567890",
  "status": "submitted",
  "message": "Query received successfully"
}
```

**Note:** n8n MUST return a `ticket_id` for tracking the query.

### Error Responses

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Query is required",
  "errorCode": "VALIDATION_ERROR"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Success:**
```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!",
  "data": {
    "ticket_id": "TICKET_1234567890",
    "query_timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```

**On n8n Failure:**
```json
{
  "success": false,
  "error": "Failed to send message",
  "message": "Contact form service temporarily unavailable. Please try again later."
}
```
Status Code: `503`

---

## 3. AI Chat

**Endpoint:** `POST ${API_BASE_URL}/ai-chat`

### Request Payload
```json
{
  "message": "What is this webinar about?",
  "sessionId": "chat_1234567890",
  "userId": "user_123",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "type": "ai_chat"
}
```

### Success Response (200 OK)

**Format 1 - With 'response' field:**
```json
{
  "success": true,
  "response": "This webinar covers Python Full Stack development in 5 days...",
  "sessionId": "chat_1234567890",
  "timestamp": "2025-10-27T10:30:00.000Z"
}
```

**Format 2 - With 'message' field:**
```json
{
  "success": true,
  "message": "This webinar covers Python Full Stack development in 5 days...",
  "sessionId": "chat_1234567890"
}
```

**Format 3 - With 'ai_response' field:**
```json
{
  "ai_response": "This webinar covers Python Full Stack development in 5 days...",
  "session": "chat_1234567890"
}
```

**Format 4 - With 'reply' field:**
```json
{
  "reply": "This webinar covers Python Full Stack development in 5 days...",
  "sessionId": "chat_1234567890"
}
```

**Format 5 - Plain string:**
```json
"This webinar covers Python Full Stack development in 5 days..."
```

### Error Responses

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "AI service temporarily unavailable"
}
```

#### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errorCode": "RATE_LIMIT"
}
```

### Backend Response to Frontend

**On Success:**
```json
{
  "success": true,
  "response": "This webinar covers Python Full Stack development in 5 days...",
  "sessionId": "chat_1234567890",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "source": "n8n"
}
```

**On n8n Failure:**
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "message": "I'm currently down for maintenance. You can directly contact us from our Contact page or search in our FAQs for quick answers.",
  "sessionId": "chat_1234567890",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "source": "error"
}
```
Status Code: `503`

---

## 4. Payment Simulation

**Endpoint:** `POST ${API_BASE_URL}/simulate-payment`

### Request Payload
```json
{
  "email": "john@example.com",
  "payment_status": "Success",
  "txn_id": "TXN_1234567890",
  "txn_timestamp": "2025-10-27T10:30:00.000Z",
  "reg_fee": 1000,
  "couponcode_applied": "DISCOUNT10",
  "discount_percentage": 10,
  "discount_amt": 100,
  "payable_amt": 900,
  "paid_amt": 900,
  "currency": "INR",
  "ip_address": "192.168.1.1"
}
```

### Success Response (200 OK)

**For Successful Payment:**
```json
{
  "success": true,
  "message": "Payment Success processed successfully",
  "whatsapp_link": "https://chat.whatsapp.com/actual-group-link",
  "discord_link": "https://discord.gg/actual-invite",
  "txn_id": "TXN_1234567890"
}
```

**For Need Time to Confirm:**
```json
{
  "success": true,
  "message": "Time to confirm request recorded successfully",
  "confirmation_pending": true,
  "txn_id": "TXN_1234567890"
}
```

**For Failed Payment:**
```json
{
  "success": true,
  "message": "Payment Failure recorded",
  "txn_id": "TXN_1234567890"
}
```

**Alternative Success Format:**
```json
{
  "status": "success",
  "payment_id": "PAY_1234567890",
  "whatsapp_link": "https://chat.whatsapp.com/invite"
}
```

### Error Responses

#### Duplicate Transaction (409 Conflict)
```json
{
  "success": false,
  "message": "Transaction ID already exists",
  "errorCode": "DUPLICATE_TRANSACTION"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid payment status",
  "errorCode": "VALIDATION_ERROR"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Payment service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Success (Payment Success):**
```json
{
  "success": true,
  "message": "Payment Success processed successfully",
  "data": {
    "txn_id": "TXN_1234567890",
    "payment_status": "Success",
    "txn_timestamp": "2025-10-27T10:30:00.000Z",
    "paid_amt": 900,
    "reg_fee": 1000,
    "payable_amt": 900,
    "discount_amt": 100,
    "whatsapp_link": "https://chat.whatsapp.com/sample-group-link",
    "confirmation_pending": false
  }
}
```

**On Success (Need Time):**
```json
{
  "success": true,
  "message": "Time to confirm request recorded successfully",
  "data": {
    "txn_id": "TXN_1234567890",
    "payment_status": "Need Time",
    "txn_timestamp": "2025-10-27T10:30:00.000Z",
    "whatsapp_link": null,
    "confirmation_pending": true
  }
}
```

**On n8n Failure:**
```json
{
  "success": false,
  "error": "Payment service temporarily unavailable",
  "message": "Unable to process payment. Please try again later."
}
```
Status Code: `503`

---

## 5. Coupon Validation

**Endpoint:** `POST ${API_BASE_URL}/validate-coupon`

### Request Payload
```json
{
  "couponcode_applied": "DISCOUNT10",
  "email": "john@example.com",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "action": "validate_coupon"
}
```

### Success Response (200 OK)

**Valid Coupon:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "discount_percentage": 10,
  "couponcode_applied": "DISCOUNT10"
}
```

**Alternative Valid Coupon Format:**
```json
{
  "valid": true,
  "discount": 10,
  "message": "Coupon code is valid",
  "code": "DISCOUNT10"
}
```

**Invalid Coupon:**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

**Expired Coupon:**
```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

**Already Used Coupon:**
```json
{
  "success": false,
  "message": "Coupon has already been used by this email"
}
```

**Coupon Limit Reached:**
```json
{
  "success": false,
  "message": "Coupon usage limit has been reached"
}
```

### Error Responses

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Coupon validation service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Valid Coupon:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "discount_percentage": 10,
  "couponcode_applied": "DISCOUNT10"
}
```

**On Invalid Coupon:**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

**On n8n Failure:**
```json
{
  "success": false,
  "message": "Coupon validation service is temporarily unavailable. Please try again later."
}
```

---

## 6. User Registration (Auth)

**Endpoint:** `POST ${API_BASE_URL}/auth/register`

### Request Payload
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$abc123...",
  "mobile": "1234567890",
  "role": "Student",
  "type": "user_registration",
  "reg_timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_1234567890",
  "email": "john@example.com",
  "name": "John Doe"
}
```

**Alternative Success Format:**
```json
{
  "userId": "user_1234567890",
  "status": "registered"
}
```

### Error Responses

#### Duplicate Email (409 Conflict)
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS"
}
```

**Alternative Duplicate Formats:**
```json
{
  "success": false,
  "message": "User already exists"
}
```
```json
{
  "success": false,
  "message": "An account with this email is already in use"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid email format",
  "errorCode": "VALIDATION_ERROR"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Registration service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Success:**
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
    "reg_timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```
Status Code: `201`

**On Duplicate Email:**
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "suggestion": "Try logging in instead, or use a different email address"
}
```
Status Code: `409`

**On Validation Error:**
```json
{
  "success": false,
  "message": "Invalid registration data",
  "errorCode": "VALIDATION_ERROR"
}
```
Status Code: `400`

**On Network Error:**
```json
{
  "success": false,
  "message": "Registration service temporarily unavailable. Please try again later.",
  "errorCode": "SERVICE_UNAVAILABLE"
}
```
Status Code: `503`

**On Generic Error:**
```json
{
  "success": false,
  "message": "Registration failed. Please try again later.",
  "errorCode": "REGISTRATION_ERROR"
}
```
Status Code: `500`

---

## 7. User Login (Auth)

**Endpoint:** `POST ${API_BASE_URL}/auth/login`

### Request Payload
```json
{
  "email": "john@example.com",
  "password": "plaintext_password",
  "type": "user_login",
  "reg_timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_1234567890",
    "userId": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student"
  }
}
```

**Alternative Success Format:**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

### Error Responses

#### Invalid Credentials (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Account Locked (403 Forbidden)
```json
{
  "success": false,
  "message": "Account is locked. Please contact support.",
  "errorCode": "ACCOUNT_LOCKED"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "message": "Login service temporarily unavailable"
}
```

### Backend Response to Frontend

**On Success:**
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
    "role": "Student"
  }
}
```
Status Code: `200`

**On Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```
Status Code: `401`

**On Network Error:**
```json
{
  "success": false,
  "message": "Authentication service temporarily unavailable. Please try again later.",
  "errorCode": "SERVICE_UNAVAILABLE"
}
```
Status Code: `503`

**On Generic Error:**
```json
{
  "success": false,
  "message": "Login failed. Please try again later.",
  "errorCode": "LOGIN_ERROR"
}
```
Status Code: `500`

**On Service Not Configured:**
```json
{
  "success": false,
  "message": "Authentication service is not configured. Please contact support.",
  "errorCode": "SERVICE_NOT_CONFIGURED"
}
```
Status Code: `503`

---

## Common Error Patterns

### Network Errors (ECONNREFUSED, ETIMEDOUT)
All endpoints return:
```json
{
  "success": false,
  "message": "[Service] temporarily unavailable. Please try again later.",
  "errorCode": "SERVICE_UNAVAILABLE"
}
```
Status Code: `503`

### Generic Server Errors
```json
{
  "success": false,
  "message": "Internal server error",
  "errorCode": "SERVER_ERROR"
}
```
Status Code: `500`

---

## Response Field Reference

### Common Success Fields
- `success` (boolean) - Indicates if the operation was successful
- `message` (string) - Human-readable success message
- `ticket_id` (string) - Unique identifier for contact queries
- `userId` / `txn_id` (string) - Unique identifier for users/transactions
- `timestamp` / `reg_timestamp` / `query_timestamp` (ISO 8601 string) - When the operation occurred

**Note:** Lead capture does NOT return an ID - tracking is done via email address.

### Common Error Fields
- `success` (boolean) - Always `false` for errors
- `message` (string) - Human-readable error message
- `errorCode` (string) - Machine-readable error code
- `error` (string) - Error type/category

### Payment Specific Fields
- `whatsapp_link` (string|null) - WhatsApp group invite link
- `discord_link` (string|null) - Discord server invite link
- `confirmation_pending` (boolean) - If payment needs confirmation
- `discount_percentage` (number) - Percentage discount applied
- `discount_amt` (number) - Amount discounted
- `paid_amt` (number) - Amount paid by user
- `payable_amt` (number) - Total amount to be paid
- `reg_fee` (number) - Registration fee before discount

### AI Chat Specific Fields
- `response` / `message` / `ai_response` / `reply` (string) - AI response text
- `sessionId` (string) - Chat session identifier
- `source` (string) - Response source ("n8n", "fallback", "error")

### Authentication Specific Fields
- `token` (string) - JWT authentication token
- `user` (object) - User information object
- `suggestion` (string) - Helpful suggestion for the user

---

## Best Practices for n8n Implementation

### 1. Always Return a Success Field
```json
{
  "success": true,  // or false
  "message": "..."
}
```

### 2. Include Meaningful Error Messages
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "DUPLICATE_EMAIL"
}
```

### 3. Use Proper HTTP Status Codes
- `200` - Success
- `400` - Validation error
- `401` - Authentication failed
- `403` - Forbidden
- `404` - Not found
- `409` - Duplicate/Conflict
- `429` - Rate limit
- `500` - Server error
- `503` - Service unavailable

### 4. Return Consistent Data Structures
Maintain the same field names across similar operations.

### 5. Include Identifiers in Responses
Always return IDs for created/updated records where applicable.

**Required IDs:**
- Contact Form: `ticket_id` (MUST return)
- Payment: `txn_id` (included in request, confirmed in response)
- User Registration: `userId` (MUST return)

**Not Required:**
- Lead Capture: No ID needed (tracked by email)

### 6. Provide Helpful Error Messages
Guide users on how to fix the issue.

---

## Testing n8n Responses

### Test Case Checklist

For each endpoint, test:
- ✅ Success scenario with all fields
- ✅ Success scenario with minimal fields
- ✅ Duplicate data (409 error)
- ✅ Invalid data (400 error)
- ✅ Missing required fields (400 error)
- ✅ Network timeout (503 error)
- ✅ Service unavailable (503 error)

### Example Test Response Formats

**Test with cURL:**
```bash
curl -X POST ${API_BASE_URL}/capture-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "role": "Student",
    "source": "test"
  }'
```

**Expected Success:**
```json
{
  "success": true,
  "id": "lead_1234567890"
}
```

---

## Summary

### Total Endpoints: 7

1. **Lead Capture** - Registers new leads with passwords
2. **Contact Form** - Handles contact queries
3. **AI Chat** - Processes AI chatbot queries
4. **Payment Simulation** - Processes payment transactions
5. **Coupon Validation** - Validates coupon codes
6. **User Registration** - Creates new user accounts
7. **User Login** - Authenticates existing users

### Response Types
- **Success Responses**: Return `success: true` with data
- **Error Responses**: Return `success: false` with error details
- **Alternative Formats**: Backend handles multiple n8n response formats

### Error Codes
- `DUPLICATE_EMAIL` / `DUPLICATE_TRANSACTION`
- `VALIDATION_ERROR`
- `EMAIL_ALREADY_EXISTS`
- `SERVICE_UNAVAILABLE`
- `SERVICE_NOT_CONFIGURED`
- `ACCOUNT_LOCKED`
- `RATE_LIMIT`
- `REGISTRATION_ERROR`
- `LOGIN_ERROR`
- `SERVER_ERROR`

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0
