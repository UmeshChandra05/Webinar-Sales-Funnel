# Webinar Sales Funnel Workflow - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Workflow Modules](#workflow-modules)
- [API Endpoints](#api-endpoints)
- [Data Storage](#data-storage)
- [Email Templates](#email-templates)
- [Setup Instructions](#setup-instructions)
- [Troubleshooting](#troubleshooting)

## Overview

### Purpose
This n8n workflow automates a complete webinar sales funnel for a Python Full-Stack 5-day webinar, including:

- User registration and validation
- Payment processing simulation
- Multi-stage email nurturing campaigns
- Coupon code generation and validation
- AI-powered chatbot support
- Customer query management with ticket system
- Admin dashboard settings management

### Key Features
- **Automated Lead Capture**: Validates and stores user registrations
- **Payment Tracking**: Monitors payment status and triggers appropriate follow-ups
- **Smart Nurturing**: 3-level email campaign based on user behavior
- **Dynamic Coupons**: Role-based discount codes (Student, Faculty, Professional, etc.)
- **AI Support**: Google Gemini-powered chatbot with conversation memory
- **Ticket System**: Automated query categorization and resolution tracking
- **Admin Controls**: Settings management for webinar configuration

## Architecture

### Technology Stack
- **Automation Platform**: n8n
- **Database**: Google Sheets (WebinarSalesFunnel_DB)
- **Email Service**: Gmail API
- **AI Model**: Google Gemini 2.5 Flash
- **Authentication**: OAuth2 for Google services

### Data Flow
```
User Registration → Validation → Database Storage → Email Confirmation
                                                   ↓
                                            Nurturing Campaign
                                                   ↓
                                            Payment Processing
                                                   ↓
                                            Success/Follow-up
```

## Workflow Modules

### 1. Registration Module

**Webhook Endpoint**: `POST /capture-lead`

**Flow**:
1. **Registration Form** - Receives user data (name, email, mobile, role)
2. **Get row(s) in sheet2** - Checks if email already exists
3. **New Registration?** - Conditional check
   - **New User**: → Append row in sheet → Success email
   - **Existing User**: → Error response

**Database Fields Created**:
- `name`, `email`, `mobile`, `role`
- `payment_status`: "Pending"
- `nurturing`: "L0 - Not Started"
- `couponcode_given`: (auto-generated based on role)

**Response**:
```json
{
  "success": true,
  "message": "Lead captured successfully"
}
```

### 2. Payment Processing Module

**Webhook Endpoint**: `POST /simulate-payment`

**Flow**:
1. **Payment Form** - Receives payment data (email, payment_status)
2. **Append or update row in sheet** - Updates payment status
3. **Get row(s) in sheet** - Retrieves updated user data
4. **Check Payment Status** - Routes based on status:
   - **Success**: → Payment Success Mail → Update Status
   - **Failure**: → If1 (checks if "Failure" or other)
     - **Explicit Failure**: → Payment Failed Mail
     - **Other (Need Time)**: → NeedTime Email

**Payment Status Values**:
- `Success` - Payment completed
- `Failure` - Payment explicitly failed
- Other values - User needs more time

**Email Triggers**:
- **Success**: Confirmation with webinar details
- **Failure**: Retry instructions
- **Need Time**: Reservation confirmation with urgency

### 3. Nurturing Campaign Module

**Trigger**: Automated after registration success email

**3-Level Campaign**:

**Level 0 → Level 1** (10 seconds after registration)
1. **Wait node** delays execution
2. **Get row(s) in sheet8** - Fetches current status
3. **Check Payment Status-2** - Verifies: `payment_status != "Success" AND nurturing == "L0 - Not Started"`
4. **Nurture1** - Sends first reminder email
5. **Append or update row in sheet3** - Updates nurturing to "L1 - Remainder Sent"

**Level 1 → Level 2** (2 minutes after L1)
1. **Wait1 node** delays execution
2. **Get row(s) in sheet9** - Fetches current status
3. **Check Payment Status-3** - Verifies: `payment_status != "Success" AND nurturing == "L1 - Remainder Sent"`
4. **Send a message** - Sends continuation prompt
5. **Append or update row in sheet4** - Updates nurturing to "L2 - Discount Offered"

**Level 2 → Level 3** (Additional urgency)
- Continues with urgency emails if payment still pending

**Email Sequence**:
- **Nurture1**: "Your Python Full Stack Webinar Spot is Waiting! 🚀"
- **Send a message**: "Do you want to continue your registration?"
- **Urgency Email**: "⏰Final Call: Secure Your Python Webinar Spot Now!"

### 4. Coupon System Module

#### Coupon Generation
**Webhook Endpoint**: `GET /interest`

**Flow**:
1. **Interest?** - Receives email query parameter
2. **Get row(s) in sheet1** - Fetches user data
3. **Code in JavaScript** - Generates role-based coupon:
   - Student → "STUDENT30" (30% off)
   - Faculty → "FAC20" (20% off)
   - Industry Professional → "IT10" (10% off)
   - Entrepreneur → "E05" (5% off)
   - Freelancer → "FREE20" (20% off)
   - Other → "PY05" (5% off)
4. **CouponCode Updation** - Saves coupon to database
5. **Discount Mail** - Sends personalized discount email
6. **Append or update row in sheet2** - Updates nurturing status

#### Coupon Validation
**Webhook Endpoint**: `POST /validate-coupon`

**Request Body**:
```json
{
  "email": "user@example.com",
  "couponcode_applied": "STUDENT30"
}
```

**Flow**:
1. **Coupon Validation** - Receives coupon data
2. **Get row(s) in sheet3** - Fetches user's assigned coupon
3. **If2** - Validates: `couponcode_applied == couponcode_given`
   - **Valid**: → Code in JavaScript2 (calculates discount) → Update database → Success response
   - **Invalid**: → Error response

**Discount Calculation** (Code in JavaScript2):
```javascript
discount_percentage = extract_number_from_coupon(couponcode_given)
discount_amt = (payable_amt * discount_percentage) / 100
new_payable_amt = payable_amt - discount_amt
```

**Success Response**:
```json
{
  "success": true,
  "discount": 150,
  "message": "30% discount applied successfully!"
}
```

### 5. User Login Module

**Webhook Endpoint**: `POST /user-login`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Flow**:
1. **Login** - Receives email
2. **Get row(s) in sheet7** - Searches for user
3. **Registered?** - Checks if user exists
   - **Found**: → Returns user data with payment status
   - **Not Found**: → Error response

**Success Response**:
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "hashed_password",
    "mobile": "1234567890",
    "role": "Student",
    "payment_status": "Success",
    "CouponCode": "STUDENT30"
  }
}
```

### 6. AI Chatbot Module

**Webhook Endpoint**: `POST /ai-chat`

**Request Body**:
```json
{
  "query": "What is the webinar about?",
  "sessionId": "unique-session-id"
}
```

**Components**:
- **AIBot** - Webhook trigger
- **AI Agent** - Orchestrates AI response
- **Google Gemini Chat Model** - LLM provider (Gemini 2.5 Flash)
- **Simple Memory** - Maintains conversation context (10 messages window)

**System Message** (configured in AI Agent):
```
You are a helpful assistant for a Python Full-Stack webinar.
Answer questions about:
- Webinar content and schedule
- Registration process
- Payment and refunds
- Technical requirements
- Discount codes

Be concise and friendly. If you don't know, direct users to contact support.
```

**Response**:
```json
{
  "response": "The webinar covers Python fundamentals, web frameworks like Django/Flask, databases, and deployment. It's a 5-day intensive program."
}
```

### 7. Query Management Module

**Webhook Endpoint**: `POST /contact-form`

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "9876543210",
  "query": "How do I get a refund?"
}
```

**Flow**:

#### New Query Processing
1. **ContactForm** - Receives query
2. **Get row(s) in sheet6** - Checks for existing queries
3. **New Contact?** - Determines if new or existing user
   - **New**: → TicketID Generation → Append row in sheet1 → AI Categorization
   - **Existing**: → Get row(s) in sheet5 → Message a model (topic comparison)

#### AI-Powered Query Handling

**Topic Comparison** (Message a model):
- Compares new query with last query
- Outputs: "Same" or "New"
- If "Same" → Updates existing ticket
- If "New" → Creates new ticket

**Query Categorization** (Message a model1):
Uses Google Gemini to categorize queries into:
- Payment & Refunds
- Registration Issues
- Technical Support
- Webinar Content
- Discount & Coupons
- Other

**Auto-Response Logic** (Code in JavaScript1):
```javascript
if (category !== "Other") {
  // AI generates response
  // Marks ticket as "Closed"
  // Sends resolution email
} else {
  // Escalates to admin
  // Marks as "Pending"
  // Sends acknowledgment email
}
```

**Ticket Lifecycle**:
```
Created → AI categorizes → Auto-resolves or escalates
Pending → Admin reviews → Sends response
Closed → 20-second wait → Final confirmation email
```

**Ticket ID Format**: `TCKT-YYMMDD-XXXX` (e.g., TCKT-250114-4821)

### 8. Admin Resolution Module

**Webhook Endpoint**: `POST /send-response`

**Request Body**:
```json
{
  "ticket_id": "TCKT-250114-4821",
  "email": "user@example.com",
  "query_reply": "Your refund has been processed.",
  "query_resolved_by": "Admin Name"
}
```

**Flow**:
1. **Admin Processed** - Receives admin response
2. **Append or update row in sheet9** - Updates ticket with resolution
3. **Send a message6** - Sends resolution email to user
4. **Wait4** - 5-second delay
5. **Append or update row in sheet13** - Marks ticket as "Closed"
6. **Send a message7** - Sends final confirmation email

**Email Sequence**:
- **Immediate**: "Query Resolution" with admin's response
- **After 5s**: "Query Resolved!" confirmation

### 9. Admin Settings Module

#### Get Settings
**Webhook Endpoint**: `GET /get-settings`

**Flow**:
1. **Get Settings** - Webhook trigger
2. **Get row(s) in sheet12** - Fetches admin settings (username: "admin")
3. **Respond to Webhook12** - Returns settings

**Response**:
```json
{
  "success": true,
  "settings": {
    "registrationFee": "999",
    "registrationDeadline": "2025-01-20",
    "contactEmail": "support@webinar.com",
    "whatsappLink": "https://chat.whatsapp.com/...",
    "discordLink": "https://discord.gg/..."
  }
}
```

#### Update Settings
**Webhook Endpoint**: `PUT /set-settings`

**Request Body**:
```json
{
  "admin_username": "admin",
  "reg_fee": 999,
  "reg_deadline": "2025-01-20",
  "webinar_time": "2025-01-25 10:00 AM",
  "contact_email": "support@webinar.com",
  "whatsapp_invite": "https://chat.whatsapp.com/...",
  "discord_link": "https://discord.gg/..."
}
```

**Flow**:
1. **Put Settings** - Receives updated settings
2. **Append or update row in sheet8** - Updates admin sheet
3. **Respond to Webhook13** - Confirms update

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": { /* updated settings */ }
}
```

### 10. Admin Authentication Module

**Webhook Endpoint**: `POST /admin-auth`

**Request Body**:
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Flow**:
1. **Admin** - Receives credentials
2. **Get row(s) in sheet4** - Searches for username
3. **Check Username** - Validates username exists
   - **Not Found**: → Error response
   - **Found**: → Validate Credentials
4. **Validate Credentials** - Compares passwords
   - **Match**: → Success response
   - **Mismatch**: → Error response

**Success Response**:
```json
{
  "valid": true,
  "message": "Login Successfull!"
}
```

**Error Response**:
```json
{
  "valid": false,
  "message": "Invalid username or password"
}
```

## API Endpoints

### Summary Table

| Endpoint | Method | Purpose | Module |
|----------|--------|---------|--------|
| `/capture-lead` | POST | User registration | Registration |
| `/simulate-payment` | POST | Payment processing | Payment |
| `/user-login` | POST | User authentication | Login |
| `/interest` | GET | Coupon generation | Coupons |
| `/validate-coupon` | POST | Coupon validation | Coupons |
| `/ai-chat` | POST | AI chatbot | AI Support |
| `/contact-form` | POST | Submit query | Queries |
| `/send-response` | POST | Admin resolution | Admin |
| `/admin-auth` | POST | Admin login | Admin |
| `/get-settings` | GET | Fetch settings | Settings |
| `/set-settings` | PUT | Update settings | Settings |

**Base URL**: `https://webinarsalesfunnel.app.n8n.cloud/webhook/`

## Data Storage

### Google Sheets Structure
**Spreadsheet**: `WebinarSalesFunnel_DB`

#### Sheet 1: User Data
| Column | Description | Example |
|--------|-------------|---------|
| `name` | User's full name | John Doe |
| `email` | User's email (unique) | john@example.com |
| `mobile` | Phone number | 1234567890 |
| `role` | User category | Student |
| `password` | User password | hashed_value |
| `payment_status` | Payment state | Success/Pending/Failure |
| `payable_amt` | Original amount | 999 |
| `discount_percentage` | Applied discount % | 30 |
| `discount_amt` | Discount value | 299.7 |
| `final_amt` | Amount after discount | 699.3 |
| `couponcode_given` | Assigned coupon | STUDENT30 |
| `nurturing` | Campaign level | L0/L1/L2/L3 |

#### Sheet 2: Queries
| Column | Description | Example |
|--------|-------------|---------|
| `name` | User's name | Jane Doe |
| `email` | User's email | jane@example.com |
| `mobile` | Phone number | 9876543210 |
| `ticket_id` | Unique ticket ID | TCKT-250114-4821 |
| `query` | User's question | How do I get a refund? |
| `query_category` | AI-categorized type | Payment & Refunds |
| `query_reply` | Response text | Refund processed |
| `query_resolved_by` | AI or Admin name | Admin John |
| `query_timestamp` | Submission time | 2025-01-14T10:30:00Z |
| `query_resolved_timestamp` | Resolution time | 2025-01-14T11:00:00Z |
| `query_status` | Ticket state | Open/Pending/Closed |

#### Sheet 3: Admin
| Column | Description | Example |
|--------|-------------|---------|
| `admin_username` | Admin login | admin |
| `admin_password` | Admin password | secure_pass |
| `reg_fee` | Registration fee | 999 |
| `reg_deadline` | Registration cutoff | 2025-01-20 |
| `webinar_time` | Webinar schedule | 2025-01-25 10:00 AM |
| `contact_email` | Support email | support@webinar.com |
| `whatsapp_invite` | WhatsApp group link | https://chat.whatsapp.com/... |
| `discord_link` | Discord server link | https://discord.gg/... |

## Email Templates

### 1. Registration Success
- **Subject**: Python Full-Stack 5-day Webinar!
- **Content**: Welcome message, webinar details, next steps

### 2. Payment Success
- **Subject**: Payment Successfull.
- **Content**: Confirmation, access details, WhatsApp/Discord links

### 3. Payment Failed
- **Subject**: Webinar - Transaction Failed
- **Content**: Retry instructions, support contact

### 4. Need Time
- **Subject**: We've Reserved Your Place – Action Needed to Confirm!
- **Content**: Reservation confirmation, urgency message

### 5. Nurture Level 1
- **Subject**: Your Python Full Stack Webinar Spot is Waiting! 🚀
- **Content**: Reminder, benefits, call-to-action

### 6. Nurture Level 2
- **Subject**: Do you want to continue your registration?
- **Content**: Continuation prompt, support offer

### 7. Discount Offer
- **Subject**: We've Reserved Your Spot – Get {X}% Off Now! 🎉
- **Content**: Personalized discount code, urgency

### 8. Urgency Email
- **Subject**: ⏰Final Call: Secure Your Python Webinar Spot Now!
- **Content**: Final reminder, scarcity messaging

### 9. Query Resolution
- **Subject**: Query Resolution.
- **Content**: AI-generated or admin response

### 10. Query Resolved
- **Subject**: Query Resolved!
- **Content**: Confirmation, feedback request

## Setup Instructions

### Prerequisites
- n8n instance (cloud or self-hosted)
- Google account with:
  - Google Sheets API enabled
  - Gmail API enabled
- Google Gemini API key

### Step 1: Google Sheets Setup
1. Create spreadsheet: `WebinarSalesFunnel_DB`
2. Create sheets:
   - User Data (gid=0)
   - Queries (gid=2082547918)
   - Admin (gid=1904087004)
3. Add column headers as per Data Storage section
4. Share spreadsheet with n8n service account

### Step 2: n8n Credentials
1. **Google Sheets OAuth2**:
   - Name: `Google Sheets account`
   - Configure OAuth2 flow
2. **Gmail OAuth2**:
   - Name: `Gmail account`
   - Configure OAuth2 flow
3. **Google Gemini API**:
   - Name: `Google Gemini(PaLM) Api account`
   - Add API key

### Step 3: Import Workflow
1. Copy workflow JSON
2. Import into n8n
3. Update credentials for all nodes
4. Update spreadsheet ID in all Google Sheets nodes

### Step 4: Configure Webhooks
1. Activate workflow
2. Note webhook URLs for each endpoint
3. Update frontend to use these URLs

### Step 5: Test Each Module
1. Test registration flow
2. Test payment processing
3. Test nurturing campaign (reduce wait times for testing)
4. Test coupon system
5. Test AI chatbot
6. Test query management
7. Test admin functions

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending
**Symptoms**: No emails received

**Solutions**:
- Verify Gmail OAuth2 credentials
- Check Gmail API quotas
- Ensure "Less secure app access" is enabled (if using password auth)
- Check spam folder

#### 2. Duplicate Registrations
**Symptoms**: Same email registered multiple times

**Solutions**:
- Verify "New Registration?" IF node condition
- Check Google Sheets filter in "Get row(s) in sheet2"
- Ensure email column is properly indexed

#### 3. Nurturing Emails Not Triggered
**Symptoms**: Users not receiving follow-up emails

**Solutions**:
- Check Wait node durations (increase for testing)
- Verify nurturing status updates in database
- Check IF node conditions for payment status

#### 4. Coupon Validation Failing
**Symptoms**: Valid coupons rejected

**Solutions**:
- Verify coupon code case sensitivity
- Check "Code in JavaScript" node for typos
- Ensure coupon is saved to database before validation

#### 5. AI Chatbot Not Responding
**Symptoms**: Empty or error responses

**Solutions**:
- Verify Google Gemini API key
- Check API quotas and limits
- Review system message configuration
- Test with simpler queries

#### 6. Ticket System Issues
**Symptoms**: Tickets not created or categorized

**Solutions**:
- Verify "TicketID Generation" code node
- Check Google Gemini API for categorization
- Review "Message a model1" prompt
- Ensure Queries sheet has correct columns

### Performance Optimization
- **Reduce Wait Times**: Adjust Wait nodes for production (currently set for testing)
- **Batch Processing**: Consider batching email sends for large user bases
- **Caching**: Implement caching for frequently accessed settings
- **Error Handling**: Add error workflows for failed operations
- **Monitoring**: Set up logging for critical operations

## Best Practices

### Security
- Never expose webhook URLs publicly without authentication
- Rotate API keys regularly
- Use environment variables for sensitive data
- Implement rate limiting on public endpoints

### Maintenance
- Regularly backup Google Sheets data
- Monitor email delivery rates
- Review AI chatbot conversations for improvements
- Update email templates based on user feedback

### Scaling
- Consider migrating from Google Sheets to proper database (PostgreSQL, MySQL)
- Implement queue system for email sending
- Add caching layer for frequently accessed data
- Use dedicated email service (SendGrid, Mailgun) for higher volumes

## Support & Contact

For issues or questions about this workflow:
1. Review this documentation
2. Check n8n community forums
3. Contact workflow administrator

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Webinar Sales Funnel Team
