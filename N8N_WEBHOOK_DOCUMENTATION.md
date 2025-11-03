# n8n Webhook Integration Documentation

## Overview
This application **strictly waits for n8n responses** for all payment-related activities. No local fallbacks are used for critical operations - if n8n is unavailable, the operation fails gracefully with proper error messages.

---

## 🔗 Required n8n Webhooks

### 1. **Payment Simulation Webhook**
**Endpoint**: `POST /simulate-payment`  
**Purpose**: Record payment transactions and update user payment status in database (Google Sheets)

#### 📤 Request Payload (from Backend to n8n)
```json
{
  "email": "user@example.com",
  "payment_status": "Success",  // or "need_time" or "Failure"
  "txn_id": "txn_1730678900000_abc123def",
  "txn_timestamp": "2025-11-03T10:30:45.123Z",
  "paid_amt": 4999,
  "reg_fee": 4999,
  "couponcode_applied": "SAVE20",  // or null
  "discount_percentage": 20,  // or 0
  "discount_amt": 1000,  // or 0
  "payable_amt": 3999,
  "currency": "INR"
}
```

#### 📥 Expected Response (from n8n to Backend)
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "whatsapp_link": "https://chat.whatsapp.com/your-group-link",  // Only for Success
  "txn_id": "txn_1730678900000_abc123def"
}
```

#### 🔄 n8n Workflow Requirements
1. **Receive webhook data** with payment details
2. **Query Google Sheets** to find user by email
3. **Update user row** with:
   - `payment_status` = "Success" / "Need Time" / "Failure"
   - `txn_id` = Transaction ID
   - `txn_timestamp` = Payment timestamp
   - `paid_amt` = Amount paid
   - `couponcode_applied` = Coupon code (if any)
   - `discount_percentage` = Discount applied
4. **Return success response** with WhatsApp link for successful payments
5. **Error handling**: Return error if user not found or update fails

---

### 2. **User Login Webhook**
**Endpoint**: `POST /user-login`  
**Purpose**: Fetch user data from database for authentication and session verification

#### 📤 Request Payload (from Backend to n8n)
```json
{
  "email": "user@example.com",
  "action": "user_login",  // or "verify_session"
  "timestamp": "2025-11-03T10:30:45.123Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### 📥 Expected Response (from n8n to Backend)
```json
{
  "success": true,
  "email": "user@example.com",
  "name": "John Doe",
  "mobile": "1234567890",
  "role": "Student",
  "password": "$2a$10$hashedPasswordHere...",  // Bcrypt hash
  "payment_status": "Success",  // or "Need Time" / "Failure" / null
  "CouponCode": "SAVE20",  // or couponcode_given, or null
  "id": "user_001",
  "userId": "user_001"
}
```

#### 🔄 n8n Workflow Requirements
1. **Receive webhook data** with email
2. **Query Google Sheets** to find user by email (case-insensitive)
3. **Return user data** with:
   - All profile fields (name, email, mobile, role)
   - **Hashed password** (stored during registration)
   - **Latest payment_status** (updated by payment webhook)
   - **Coupon code** (if given)
4. **Error handling**: 
   - Return `404` if user not found
   - Return `{ success: false, message: "User not found" }`

---

### 3. **User Registration Webhook**
**Endpoint**: `POST /capture-lead`  
**Purpose**: Store new user registration in database

#### 📤 Request Payload (from Backend to n8n)
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "$2a$10$hashedPasswordHere...",  // Already hashed
  "mobile": "1234567890",
  "role": "Student",
  "type": "user_registration",
  "reg_timestamp": "2025-11-03T10:30:45.123Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### 📥 Expected Response (from n8n to Backend)
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_002"
}
```

#### 🔄 n8n Workflow Requirements
1. **Receive webhook data** with user details
2. **Check for duplicate email** in Google Sheets
3. **If duplicate**: Return `{ success: false, message: "Email already exists" }`
4. **If new**: 
   - Add new row to Google Sheets with all user data
   - Set `payment_status` = null (not paid yet)
   - Generate unique `userId`
   - Return success response

---

### 4. **Coupon Validation Webhook**
**Endpoint**: `POST /validate-coupon`  
**Purpose**: Validate coupon codes and return discount percentage

#### 📤 Request Payload (from Backend to n8n)
```json
{
  "couponcode_applied": "SAVE20",
  "email": "user@example.com",
  "timestamp": "2025-11-03T10:30:45.123Z",
  "action": "validate_coupon"
}
```

#### 📥 Expected Response (from n8n to Backend)
```json
{
  "success": true,
  "message": "Coupon applied successfully! 20% discount",
  "discount_percentage": 20
}
```

**Or for invalid coupon:**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

#### 🔄 n8n Workflow Requirements
1. **Receive webhook data** with coupon code
2. **Query coupon database/sheet** to check if coupon is valid
3. **Validate coupon**:
   - Check if coupon exists
   - Check if coupon is active (not expired)
   - Check if user is eligible (first-time use, etc.)
4. **Return discount percentage** if valid
5. **Optional**: Record coupon usage with user email and timestamp

---

## 🛡️ Critical Design Decisions

### ✅ **We STRICTLY WAIT for n8n Responses**

**Why?** To ensure data consistency and prevent race conditions.

#### Payment Flow (CORRECT - What We Implemented)
```
1. User submits payment
   ↓
2. Backend sends to n8n webhook
   ↓
3. Backend WAITS for n8n response (timeout: 10 seconds)
   ↓
4. n8n updates Google Sheets (payment_status = "Success")
   ↓
5. n8n returns success + WhatsApp link
   ↓
6. Backend returns success to frontend
   ↓
7. Frontend calls updateUserPaymentStatus("Success")
   ↓
8. localStorage updated immediately
   ↓
9. User navigates to success page
   ↓
10. Smart cache checks: payment_status = "Success" ✅
    ↓
11. NO n8n call needed - uses cached data
```

#### What Would Happen WITHOUT Waiting (WRONG ❌)
```
1. User submits payment
   ↓
2. Backend sends to n8n webhook
   ↓
3. Backend returns success IMMEDIATELY (doesn't wait)
   ↓
4. Frontend navigates to success page
   ↓
5. Smart cache checks: payment_status still "null" ❌
   ↓
6. Makes n8n call to verify
   ↓
7. n8n hasn't finished updating yet!
   ↓
8. Returns old payment_status = null
   ↓
9. User sees payment buttons (WRONG!)
```

---

## 📊 Google Sheets Database Schema

### **Users Sheet** (Main Database)
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `email` | String (Primary Key) | User email (lowercase) | user@example.com |
| `name` | String | Full name | John Doe |
| `password` | String | Bcrypt hash | $2a$10$hash... |
| `mobile` | String | Phone number | 1234567890 |
| `role` | String | User role | Student |
| `reg_timestamp` | ISO DateTime | Registration time | 2025-11-03T10:30:45.123Z |
| `payment_status` | String | Payment status | Success / Need Time / Failure / null |
| `txn_id` | String | Transaction ID | txn_1730678900000_abc123 |
| `txn_timestamp` | ISO DateTime | Payment time | 2025-11-03T11:00:00.000Z |
| `paid_amt` | Number | Amount paid | 4999 |
| `reg_fee` | Number | Base fee | 4999 |
| `couponcode_applied` | String | Coupon used | SAVE20 / null |
| `discount_percentage` | Number | Discount % | 20 / 0 |
| `discount_amt` | Number | Discount amount | 1000 / 0 |
| `payable_amt` | Number | Final amount | 3999 |
| `CouponCode` | String | Given coupon | EARLY50 / null |
| `userId` | String | Unique ID | user_001 |

### **Coupons Sheet** (Optional - for validation)
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `code` | String (Primary Key) | Coupon code | SAVE20 |
| `discount_percentage` | Number | Discount % | 20 |
| `active` | Boolean | Is active | true / false |
| `expiry_date` | ISO Date | Expiration | 2025-12-31 |
| `max_uses` | Number | Usage limit | 100 |
| `current_uses` | Number | Times used | 45 |

---

## ⏱️ Timeout Configuration

### Current Timeouts
```javascript
// Payment simulation
timeout: 10000  // 10 seconds

// Coupon validation
timeout: 15000  // 15 seconds (longer due to lookup)

// User login
timeout: 10000  // 10 seconds
```

### Why These Values?
- **10 seconds** for payment: Allows n8n to update Google Sheets reliably
- **15 seconds** for coupon: May need to check multiple conditions
- If n8n takes longer, operation fails with timeout error

---

## 🚨 Error Handling

### n8n Unavailable
```javascript
// Backend returns
{
  "success": false,
  "message": "Payment service temporarily unavailable. Please try again later.",
  "errorCode": "SERVICE_UNAVAILABLE"
}

// Frontend shows error toast
// User can retry payment
```

### n8n Webhook Not Configured
```javascript
// Backend returns
{
  "success": false,
  "message": "Payment service is not configured properly. Please contact support.",
  "errorCode": "SERVICE_NOT_CONFIGURED"
}

// Frontend shows error with support contact
```

### n8n Returns Error
```javascript
// n8n returns
{
  "success": false,
  "message": "User not found in database"
}

// Backend forwards to frontend
{
  "success": false,
  "message": "User not found in database"
}
```

---

## 🔐 Security Considerations

### 1. **Password Hashing**
- ✅ Password is **hashed in backend** (bcrypt) before sending to n8n
- ✅ n8n stores the hash, NOT plain password
- ✅ Password verification happens in backend, not n8n

### 2. **Webhook Security**
- 🔒 Use **HTTPS** for n8n webhook URLs (production)
- 🔒 Consider adding **webhook authentication** (API key in headers)
- 🔒 Validate request origin in n8n workflow

### 3. **Data Validation**
- ✅ Backend validates all data before sending to n8n
- ✅ Email format validation
- ✅ Amount calculations verified
- ✅ Coupon codes normalized (uppercase, trimmed)

---

## 🧪 Testing n8n Webhooks

### Test 1: Payment Simulation
```bash
POST https://your-n8n-instance.app.n8n.cloud/webhook/simulate-payment
Content-Type: application/json

{
  "email": "test@example.com",
  "payment_status": "Success",
  "txn_id": "test_txn_001",
  "txn_timestamp": "2025-11-03T10:00:00.000Z",
  "paid_amt": 4999,
  "reg_fee": 4999,
  "couponcode_applied": null,
  "discount_percentage": 0,
  "discount_amt": 0,
  "payable_amt": 4999,
  "currency": "INR"
}
```

**Expected**: 
- Google Sheets updated with payment_status = "Success"
- Response includes whatsapp_link

### Test 2: User Login
```bash
POST https://your-n8n-instance.app.n8n.cloud/webhook/user-login
Content-Type: application/json

{
  "email": "test@example.com",
  "action": "user_login",
  "timestamp": "2025-11-03T10:00:00.000Z"
}
```

**Expected**:
- Response includes user data with latest payment_status
- Password hash is included

### Test 3: Coupon Validation
```bash
POST https://your-n8n-instance.app.n8n.cloud/webhook/validate-coupon
Content-Type: application/json

{
  "couponcode_applied": "SAVE20",
  "email": "test@example.com",
  "timestamp": "2025-11-03T10:00:00.000Z",
  "action": "validate_coupon"
}
```

**Expected**:
- If valid: `{ success: true, discount_percentage: 20 }`
- If invalid: `{ success: false, message: "Invalid coupon" }`

---

## 📝 n8n Workflow Checklist

### For Payment Webhook
- [ ] Webhook trigger configured for POST /simulate-payment
- [ ] Google Sheets connection established
- [ ] Query user by email (lookup node)
- [ ] Update payment fields in Google Sheets
- [ ] Handle "Success" status → return WhatsApp link
- [ ] Handle "Need Time" status → return confirmation_pending
- [ ] Handle "Failure" status → record failed attempt
- [ ] Error handling for user not found
- [ ] Response formatting matches expected schema

### For Login Webhook
- [ ] Webhook trigger configured for POST /user-login
- [ ] Google Sheets connection established
- [ ] Query user by email (case-insensitive)
- [ ] Return ALL required fields (including password hash)
- [ ] Include latest payment_status
- [ ] Handle user not found → 404 response
- [ ] Response formatting matches expected schema

### For Registration Webhook
- [ ] Webhook trigger configured for POST /capture-lead
- [ ] Duplicate email check implemented
- [ ] New row creation in Google Sheets
- [ ] Set payment_status = null for new users
- [ ] Generate unique userId
- [ ] Return success with userId

### For Coupon Webhook
- [ ] Webhook trigger configured for POST /validate-coupon
- [ ] Coupon lookup from database/sheet
- [ ] Expiry date validation
- [ ] Usage limit checking
- [ ] Return discount_percentage for valid coupons
- [ ] Error handling for invalid/expired coupons

---

## 🎯 Summary

**Key Principle**: **We ALWAYS wait for n8n to respond before proceeding with critical operations.**

This ensures:
- ✅ Data consistency across frontend, backend, and database
- ✅ No race conditions
- ✅ Accurate payment status at all times
- ✅ Smart caching works correctly (because database is updated before frontend receives success)

**The trade-off**: 
- Payment takes 1-2 seconds longer (waiting for n8n + Google Sheets)
- But ensures 100% data accuracy and prevents showing wrong payment status

**The result**:
- User always sees correct payment status
- No flickering buttons
- No cache invalidation issues
- Single source of truth (Google Sheets via n8n)

---

## 🔮 Future Enhancements

1. **Webhook Authentication**: Add API key validation in n8n
2. **Retry Logic**: Implement exponential backoff for failed n8n calls
3. **Queue System**: Use message queue (Redis/RabbitMQ) for async processing
4. **Real-time Updates**: WebSocket connection for instant status updates
5. **Monitoring**: Track n8n response times and success rates
6. **Caching Layer**: Redis cache for frequently accessed user data

---

## 📞 Support

If n8n webhooks are not responding:
1. Check n8n workflow is **ACTIVE** (toggle in top-right)
2. Verify webhook URLs match environment variables
3. Check Google Sheets permissions
4. Review n8n execution logs for errors
5. Test webhooks directly using Postman/cURL

---

**Last Updated**: November 3, 2025  
**Version**: 1.0  
**Maintained By**: Development Team
