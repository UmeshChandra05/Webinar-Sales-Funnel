# Simple API Documentation

## All API Endpoints

### Public Endpoints (No Authentication)
1. `GET /health` - Health check
2. `POST /api/capture-lead` - Lead registration
3. `POST /api/contact` - Contact form submission
4. `POST /api/simulate-payment` - Payment processing
5. `POST /api/validate-coupon` - Coupon validation
6. `GET /api/webinar-info` - Webinar information
7. `POST /api/ai-chat` - AI chatbot
8. `POST /api/admin/login` - Admin login
9. `POST /api/auth/register` - User registration
10. `POST /api/auth/login` - User login

### Protected Endpoints (Require Authentication)
11. `GET /api/admin/dashboard` - Admin dashboard (Admin Token)
12. `POST /api/admin/refresh-token` - Refresh admin token (Admin Token)
13. `GET /api/auth/verify` - Verify user token (User Token)
14. `POST /api/auth/refresh` - Refresh user token (User Token)
15. `POST /api/auth/logout` - User logout (User Token)

---

## API Details with Examples

### 1. Health Check

**Frontend → Backend**
```http
GET /health
```

**Backend Response**
```json
{
  "status": "OK",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "uptime": 12345.67
}
```

**Backend → n8n:** No external call

---

### 2. Capture Lead

**Frontend → Backend**
```http
POST /api/capture-lead
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "role": "Student",
  "source": "landing_page"
}
```

**Backend → n8n** (Optional)
```http
POST ${API_BASE_URL}/capture-lead
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "role": "Student",
  "source": "landing_page",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**n8n → Backend**
```json
{
  "id": "lead_1698412345678"
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "id": "lead_1698412345678",
    "timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```

---

### 3. Contact Form

**Frontend → Backend**
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "message": "I have a question about the webinar."
}
```

**Backend → n8n** (Optional)
```http
POST ${API_BASE_URL}/contact-form
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "message": "I have a question about the webinar.",
  "type": "contact_form",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1"
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Thank you for your message. We will get back to you soon!"
}
```

---

### 4. Simulate Payment

**Frontend → Backend**
```http
POST /api/simulate-payment
Content-Type: application/json

{
  "email": "john@example.com",
  "status": "success",
  "transaction_id": "txn_1698412345678_abc123",
  "couponCode": "SAVE20",
  "discount": 20
}
```

**Backend → n8n** (Optional)
```http
POST ${API_BASE_URL}/simulate-payment
Content-Type: application/json

{
  "email": "john@example.com",
  "status": "success",
  "transaction_id": "txn_1698412345678_abc123",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "amount": 3999.20,
  "originalAmount": 4999,
  "couponCode": "SAVE20",
  "discount": 20,
  "currency": "INR"
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Payment success processed successfully",
  "data": {
    "transaction_id": "txn_1698412345678_abc123",
    "status": "success",
    "timestamp": "2025-10-27T10:30:00.000Z",
    "whatsapp_link": "https://chat.whatsapp.com/sample-group-link",
    "confirmation_pending": false
  }
}
```

**Payment Status Values:**
- `"success"` → WhatsApp link provided, amount charged
- `"failed"` → No link, amount = 0
- `"need_time_to_confirm"` → No link, confirmation pending

---

### 5. Validate Coupon

**Frontend → Backend**
```http
POST /api/validate-coupon
Content-Type: application/json

{
  "couponCode": "SAVE20",
  "email": "john@example.com"
}
```

**Backend → n8n** (REQUIRED)
```http
POST ${API_BASE_URL}/validate-coupon
Content-Type: application/json

{
  "couponCode": "SAVE20",
  "email": "john@example.com",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "action": "validate_coupon"
}
```

**n8n → Backend**
```json
{
  "success": true,
  "discount": 20,
  "message": "Coupon applied successfully"
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "discount": 20,
  "couponCode": "SAVE20"
}
```

---

### 6. Webinar Info

**Frontend → Backend**
```http
GET /api/webinar-info
```

**Backend Response** (No n8n call)
```json
{
  "success": true,
  "data": {
    "title": "Python Full Stack in 5 Days",
    "date": "2025-11-03T19:00:00.000Z",
    "duration": "2 hours",
    "instructor": "Expert Python Developer",
    "topics": [
      "Python Basics to Advanced",
      "Flask Backend Development",
      "React Frontend Integration",
      "Connecting APIs",
      "Deploying Apps in 5 Days",
      "Live Hands-on Learning"
    ],
    "timezone": "UTC",
    "registration_count": 1456
  }
}
```

---

### 7. AI Chat

**Frontend → Backend**
```http
POST /api/ai-chat
Content-Type: application/json

{
  "message": "What is this webinar about?",
  "sessionId": "chat_1698412345678",
  "userId": "user_123"
}
```

**Backend → n8n** (Optional)
```http
POST ${API_BASE_URL}/ai-chat
Content-Type: application/json

{
  "message": "What is this webinar about?",
  "sessionId": "chat_1698412345678",
  "userId": "user_123",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "type": "ai_chat"
}
```

**n8n → Backend** (Flexible format)
```json
{
  "response": "This webinar covers Python Full Stack Development in 5 days..."
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "response": "This webinar covers Python Full Stack Development in 5 days...",
  "sessionId": "chat_1698412345678",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "source": "n8n"
}
```

**Fallback Response** (n8n unavailable)
```json
{
  "success": true,
  "response": "I'm currently down for maintenance. You can directly contact us from our Contact page or search in our FAQs for quick answers.",
  "sessionId": "chat_1698412345678",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "source": "fallback"
}
```

---

### 8. Admin Login

**Frontend → Backend**
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password"
}
```

**Backend → n8n** (REQUIRED)
```http
POST ${API_BASE_URL}/admin-auth
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "source": "admin-login",
  "action": "validate_credentials"
}
```

**n8n → Backend**
```json
{
  "valid": true,
  "userInfo": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Backend → Frontend**
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

---

### 9. User Registration

**Frontend → Backend**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "mobile": "+1234567890",
  "role": "Student",
  "rememberMe": true
}
```

**Backend → n8n** (REQUIRED)
```http
POST ${API_BASE_URL}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$hashed_password...",
  "mobile": "+1234567890",
  "role": "Student",
  "type": "user_registration",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**n8n → Backend**
```json
{
  "success": true,
  "userId": "user_1698412345678"
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1698412345678",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+1234567890",
    "role": "Student",
    "timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```

**Error Response** (Duplicate Email)
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "suggestion": "Try logging in instead, or use a different email address"
}
```

---

### 10. User Login

**Frontend → Backend**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123",
  "rememberMe": true
}
```

**Backend → n8n** (REQUIRED)
```http
POST ${API_BASE_URL}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123",
  "type": "user_login",
  "timestamp": "2025-10-27T10:30:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**n8n → Backend**
```json
{
  "success": true,
  "user": {
    "id": "user_1698412345678",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+1234567890",
    "role": "Student"
  }
}
```

**Backend → Frontend**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1698412345678",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+1234567890",
    "role": "Student"
  }
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 11. Get Admin Dashboard

**Frontend → Backend**
```http
GET /api/admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Response** (No n8n call - returns mock data)
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRegistrations": 342,
      "totalPayments": 123,
      "totalContacts": 189,
      "conversionRate": 28
    },
    "recentActivity": [
      {
        "type": "registration",
        "user": "John Doe",
        "role": "Student",
        "time": "2 hours ago",
        "timestamp": "2025-10-27T08:30:00.000Z"
      },
      {
        "type": "payment",
        "user": "Jane Smith",
        "amount": "$99",
        "time": "3 hours ago",
        "timestamp": "2025-10-27T07:30:00.000Z"
      }
    ],
    "lastUpdated": "2025-10-27T10:30:00.000Z"
  }
}
```

---

### 12. Refresh Admin Token

**Frontend → Backend**
```http
POST /api/admin/refresh-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Response** (No n8n call)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 13. Verify User Token

**Frontend → Backend**
```http
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Response** (No n8n call)
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_1698412345678",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

---

### 14. Refresh User Token

**Frontend → Backend**
```http
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Response** (No n8n call)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1698412345678",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

---

### 15. User Logout

**Frontend → Backend**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Response** (No n8n call)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## n8n Webhook Summary

### Required n8n Webhooks (System won't work without these)

1. **`${API_BASE_URL}/admin-auth`**
   - Validates admin credentials
   - Returns: `{ valid: boolean, userInfo: object }`

2. **`${API_BASE_URL}/auth/register`**
   - Stores user registration
   - Returns: `{ success: boolean, userId: string }`

3. **`${API_BASE_URL}/auth/login`**
   - Validates user credentials
   - Returns: `{ success: boolean, user: object }`

4. **`${API_BASE_URL}/validate-coupon`**
   - Validates coupon codes
   - Returns: `{ success: boolean, discount: number, message: string }`

### Optional n8n Webhooks (Has local fallback)

5. **`${API_BASE_URL}/capture-lead`** - Stores leads
6. **`${API_BASE_URL}/contact-form`** - Stores contact messages
7. **`${API_BASE_URL}/simulate-payment`** - Stores payment records
8. **`${API_BASE_URL}/ai-chat`** - AI chatbot processing

---

## Important Notes

### Authentication
- **Admin Token**: Expires in 24 hours
- **User Token**: Expires in 7 days (30 days with rememberMe)
- **Format**: `Authorization: Bearer <token>`

### Price Calculation
```
Original Price: 4999 INR
With Coupon: 4999 - (4999 × discount / 100)
Example: 20% discount = 4999 - (4999 × 20 / 100) = 3999.20 INR
```

### Password Security
- Frontend sends: Plain text password
- Backend hashes: bcrypt with 10 salt rounds
- n8n receives: Hashed password (registration) or plain (login for verification)

### Cookie Handling
- Authentication tokens stored in HTTP-only cookies
- Cookie name: `authToken`
- Secure in production, accessible in development

---

## Testing URLs

**Development:**
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
```

**Example Full Request:**
```bash
curl -X POST http://localhost:5000/api/capture-lead \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"Student"}'
```

---

**Last Updated:** October 27, 2025
