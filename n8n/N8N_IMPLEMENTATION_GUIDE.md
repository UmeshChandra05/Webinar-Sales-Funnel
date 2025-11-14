# N8N Webhook Implementation Guide

## Overview
This document outlines the missing n8n webhook implementations required to complete the Webinar Sales Funnel application. Each section includes the webhook endpoint, request format, expected response, and Google Sheets operations.

---

## 1. Settings Management

### 1.1 Get Settings (Public Endpoint)

**Endpoint:** `GET /settings`

**N8N Webhook Path:** `/settings`

**HTTP Method:** GET

**Purpose:** Fetch application settings from Admin Sheet

**Google Sheet:** `Admin` (Tab name in Webinardb)

**Request:**
```http
GET /settings HTTP/1.1
Host: n8n-base-url
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "adminUsername": "admin",
    "registrationFee": 4999,
    "registrationDeadline": "02-10-2025",
    "webinarTime": "10:00 AM",
    "contactEmail": "contact@example.com",
    "whatsappLink": "https://wa.me/1234567890",
    "discordLink": "https://discord.gg/example"
  }
}
```

**Google Sheets Operation:**
- Operation: `Get row(s) in sheet`
- Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`
- Sheet Name: `Admin`
- Filter: Get first row (or all rows if only one exists)
- **IMPORTANT:** Use lowercase backend field names from sheet columns, NOT display labels
- Map fields:
  - `admin_username` (from sheet) → `adminUsername` (in response)
  - `reg_fee` (from sheet) → `registrationFee` (in response)
  - `reg_deadline` (from sheet) → `registrationDeadline` (in response)
  - `webinar_time` (from sheet) → `webinarTime` (in response)
  - `contact_email` (from sheet) → `contactEmail` (in response)
  - `whatsapp_invite` (from sheet) → `whatsappLink` (in response)
  - `discord_link` (from sheet) → `discordLink` (in response)

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch settings"
}
```

---

### 1.2 Update Settings (Admin Protected Endpoint)

**Endpoint:** `PUT /admin/settings`

**N8N Webhook Path:** `/admin/settings`

**HTTP Method:** POST (n8n webhooks use POST, application will send PUT)

**Purpose:** Update application settings in Admin Sheet

**Google Sheet:** `Admin` (Tab name in Webinardb)

**Request:**
```json
{
  "adminUsername": "admin",
  "adminPassword": "newpassword123",
  "registrationFee": 3999,
  "registrationDeadline": "15-10-2025",
  "webinarTime": "11:00 AM",
  "contactEmail": "newemail@example.com",
  "whatsappLink": "https://wa.me/9876543210",
  "discordLink": "https://discord.gg/newlink"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "adminUsername": "admin",
    "registrationFee": 3999,
    "registrationDeadline": "15-10-2025",
    "webinarTime": "11:00 AM",
    "contactEmail": "newemail@example.com",
    "whatsappLink": "https://wa.me/9876543210",
    "discordLink": "https://discord.gg/newlink"
  }
}
```

**Google Sheets Operation:**
- Operation: `Append or Update row in sheet`
- Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`
- Sheet Name: `Admin`
- Matching Column: `admin_username` (or update first row)
- **IMPORTANT:** Use lowercase backend field names as sheet column headers, NOT display labels
- Map fields:
  - `body.adminUsername` → `admin_username` (sheet column)
  - `body.adminPassword` → `admin_password` (sheet column, only if provided)
  - `body.registrationFee` → `reg_fee` (sheet column)
  - `body.registrationDeadline` → `reg_deadline` (sheet column)
  - `body.webinarTime` → `webinar_time` (sheet column)
  - `body.contactEmail` → `contact_email` (sheet column)
  - `body.whatsappLink` → `whatsapp_invite` (sheet column)
  - `body.discordLink` → `discord_link` (sheet column)

**Important Notes:**
- Password should only be updated if provided (optional field)
- Date format in sheet: DD-MM-YYYY
- Return updated settings without password in response

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to update settings"
}
```

---

## 2. Configuration Endpoints

### 2.1 Get Google Sheets Configuration (Admin Only)

**Endpoint:** `GET /config/google-sheets`

**N8N Webhook Path:** `/config/google-sheets`

**HTTP Method:** GET

**Purpose:** Return Google Sheets URLs for admin panel

**Request:**
```http
GET /config/google-sheets HTTP/1.1
Host: n8n-base-url
```

**Expected Response:**
```json
{
  "success": true,
  "config": {
    "userDataSheetUrl": "https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/edit#gid=0",
    "queriesSheetUrl": "https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/edit#gid=2082547918",
    "adminSheetUrl": "https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/edit#gid=1904087004"
  }
}
```

**Implementation:**
- No Google Sheets operation needed
- Return hardcoded URLs from n8n configuration
- Sheet GIDs:
  - User Data: `gid=0`
  - Queries: `gid=2082547918`
  - Admin: `gid=1904087004`

---

### 2.2 Get App Constants (Public)

**Endpoint:** `GET /config/constants`

**N8N Webhook Path:** `/config/constants`

**HTTP Method:** GET

**Purpose:** Return application-wide constants

**Request:**
```http
GET /config/constants HTTP/1.1
Host: n8n-base-url
```

**Expected Response:**
```json
{
  "success": true,
  "constants": {
    "N8N_BASE_URL": "https://your-n8n-instance.com",
    "GOOGLE_SHEET_ID": "1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8",
    "APP_NAME": "Webinar Sales Funnel",
    "WEBINAR_NAME": "Python Full Stack Development",
    "DEFAULT_CURRENCY": "INR"
  }
}
```

**Implementation:**
- No Google Sheets operation needed
- Return hardcoded constants from n8n environment variables

---

## 3. Webinar Information

### 3.1 Get Webinar Info (Public)

**Endpoint:** `GET /webinar-info`

**N8N Webhook Path:** `/webinar-info`

**HTTP Method:** GET

**Purpose:** Return webinar details for landing page

**Request:**
```http
GET /webinar-info HTTP/1.1
Host: n8n-base-url
```

**Expected Response:**
```json
{
  "success": true,
  "webinar": {
    "name": "Python Full Stack Development",
    "date": "02-10-2025",
    "time": "10:00 AM",
    "duration": "5 hours",
    "host": "Harsha Sri",
    "speakers": ["Harsha Sri", "Umesh Chandra"],
    "topics": [
      "Python fundamentals",
      "Object-Oriented Programming (OOP) in Python",
      "Database integration with MySQL/PostgreSQL",
      "Backend development using Flask / Django",
      "REST API design and implementation",
      "Frontend basics with HTML, CSS, JavaScript",
      "Frontend frameworks (React / Angular basics)",
      "Connecting frontend with backend",
      "Authentication & Authorization",
      "Deployment to cloud platforms"
    ],
    "fee": 4999,
    "currency": "INR"
  }
}
```

**Implementation:**
- Can fetch `date`, `time`, and `fee` from Admin Sheet
- Other fields can be hardcoded in n8n workflow
- Or create a new "Webinar Info" sheet tab

**Google Sheets Operation (Option 1 - Use Admin Sheet):**
- Operation: `Get row(s) in sheet`
- Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`
- Sheet Name: `Admin`
- Get fields: `reg_deadline`, `webinar_time`, `reg_fee`

---

## 4. Admin Dashboard Data

### 4.1 Get Dashboard Statistics (Admin Only)

**Endpoint:** `GET /admin/dashboard`

**N8N Webhook Path:** `/admin/dashboard`

**HTTP Method:** GET

**Purpose:** Aggregate and return dashboard statistics

**Request:**
```http
GET /admin/dashboard HTTP/1.1
Host: n8n-base-url
```

**Expected Response:**
```json
{
  "success": true,
  "dashboard": {
    "totalRegistrations": 150,
    "paidUsers": 45,
    "pendingPayments": 80,
    "failedPayments": 25,
    "totalRevenue": 224955,
    "openQueries": 12,
    "resolvedQueries": 38,
    "recentRegistrations": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "reg_timestamp": "14-11-2025 10:30:00",
        "payment_status": "Success"
      }
    ],
    "recentQueries": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "query": "How to join the webinar?",
        "query_status": "Open",
        "query_timestamp": "14-11-2025 09:15:00"
      }
    ]
  }
}
```

**Google Sheets Operations:**

**Step 1: Get All User Data**
- Operation: `Get row(s) in sheet`
- Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`
- Sheet Name: `User Data`
- No filters (get all rows)

**Step 2: Get All Queries**
- Operation: `Get row(s) in sheet`
- Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`
- Sheet Name: `Queries`
- No filters (get all rows)

**Step 3: Aggregate in JavaScript Node**
```javascript
const userData = $('Get All Users').all();
const queriesData = $('Get All Queries').all();

// Calculate statistics
const totalRegistrations = userData.length;
const paidUsers = userData.filter(u => u.json.payment_status === 'Success').length;
const pendingPayments = userData.filter(u => u.json.payment_status === 'Need Time').length;
const failedPayments = userData.filter(u => u.json.payment_status === 'Failure').length;

// Calculate total revenue
const totalRevenue = userData
  .filter(u => u.json.payment_status === 'Success')
  .reduce((sum, u) => sum + (parseFloat(u.json.paid_amt) || 0), 0);

// Query statistics
const openQueries = queriesData.filter(q => q.json.query_status === 'Open').length;
const resolvedQueries = queriesData.filter(q => q.json.query_status === 'Answered').length;

// Recent registrations (last 10)
const recentRegistrations = userData
  .sort((a, b) => new Date(b.json.reg_timestamp) - new Date(a.json.reg_timestamp))
  .slice(0, 10)
  .map(u => ({
    name: u.json.name,
    email: u.json.email,
    reg_timestamp: u.json.reg_timestamp,
    payment_status: u.json.payment_status
  }));

// Recent queries (last 10)
const recentQueries = queriesData
  .sort((a, b) => new Date(b.json.query_timestamp) - new Date(a.json.query_timestamp))
  .slice(0, 10)
  .map(q => ({
    name: q.json.name,
    email: q.json.email,
    query: q.json.query,
    query_status: q.json.query_status,
    query_timestamp: q.json.query_timestamp
  }));

return [{
  json: {
    success: true,
    dashboard: {
      totalRegistrations,
      paidUsers,
      pendingPayments,
      failedPayments,
      totalRevenue,
      openQueries,
      resolvedQueries,
      recentRegistrations,
      recentQueries
    }
  }
}];
```

---

## 5. Summary of Required N8N Webhooks

| Webhook Path | Method | Purpose | Google Sheet | Priority |
|--------------|--------|---------|--------------|----------|
| `/settings` | GET | Get application settings | Admin | **High** |
| `/admin/settings` | POST | Update application settings | Admin | **High** |
| `/config/google-sheets` | GET | Get Google Sheets URLs | None | **Medium** |
| `/config/constants` | GET | Get app constants | None | **Medium** |
| `/webinar-info` | GET | Get webinar information | Admin | **Medium** |
| `/admin/dashboard` | GET | Get dashboard statistics | User Data + Queries | **High** |

---

## 6. Implementation Checklist

### For Each Webhook:

- [ ] Create webhook node in n8n
- [ ] Set correct HTTP method and path
- [ ] Set response mode to "responseNode"
- [ ] Add Google Sheets operations (if needed)
- [ ] Add JavaScript/Code nodes for data transformation
- [ ] Add "Respond to Webhook" node with correct JSON format
- [ ] Test with sample requests
- [ ] Verify response format matches expected structure
- [ ] Handle error cases with appropriate error responses

---

## 7. Testing Endpoints

After implementation, test each endpoint using:

**Using PowerShell:**
```powershell
# Test GET /settings
Invoke-RestMethod -Uri "http://localhost:5678/webhook/settings" -Method GET

# Test POST /admin/settings
$body = @{
    adminUsername = "admin"
    registrationFee = 4999
    registrationDeadline = "02-10-2025"
    webinarTime = "10:00 AM"
    contactEmail = "contact@example.com"
    whatsappLink = "https://wa.me/1234567890"
    discordLink = "https://discord.gg/example"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/admin/settings" -Method POST -Body $body -ContentType "application/json"

# Test GET /webinar-info
Invoke-RestMethod -Uri "http://localhost:5678/webhook/webinar-info" -Method GET

# Test GET /admin/dashboard
Invoke-RestMethod -Uri "http://localhost:5678/webhook/admin/dashboard" -Method GET

# Test GET /config/constants
Invoke-RestMethod -Uri "http://localhost:5678/webhook/config/constants" -Method GET

# Test GET /config/google-sheets
Invoke-RestMethod -Uri "http://localhost:5678/webhook/config/google-sheets" -Method GET
```

---

## 8. Notes for Implementation

1. **Date Format Consistency:**
   - Google Sheets uses: `DD-MM-YYYY`
   - Application expects: `DD-MM-YYYY` in responses
   - Ensure consistent formatting in all date fields

2. **Error Handling:**
   - All endpoints should return `{"success": false, "error": "message"}` on failure
   - Use try-catch in JavaScript nodes
   - Return HTTP 200 even for errors (handled in JSON response)

3. **Response Format:**
   - Always include `success: true/false` field
   - Wrap data in appropriate object keys (`settings`, `dashboard`, `webinar`, etc.)
   - Use camelCase for JSON keys

4. **Security:**
   - Admin endpoints (`/admin/*`) should validate admin credentials (if needed)
   - Consider adding authentication headers in future

5. **Google Sheets Credentials:**
   - All Google Sheets operations use: `Google Sheets account` (OAuth2)
   - Document ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`

6. **⚠️ CRITICAL: Column Names in Google Sheets:**
   - **ALWAYS use lowercase backend field names** (e.g., `admin_username`, `reg_fee`, `payment_status`)
   - **NEVER use display labels** (e.g., ~~Admin Username~~, ~~Registration Fee~~, ~~Payment Status~~)
   - Display labels are only for UI/frontend display
   - Backend field names are the actual column headers in Google Sheets
   - Example from Admin Sheet:
     - ✅ Correct: `admin_username`, `admin_password`, `reg_fee`, `reg_deadline`, `webinar_time`, `contact_email`, `whatsapp_invite`, `discord_link`
     - ❌ Wrong: `Admin Username`, `Admin Password`, `Registration Fee`, `Registration Deadline`, `Webinar Time`, `Contact Email`, `WhatsApp Link`, `Discord Link`

---

## 9. Workflow Structure Example

**Example: GET /settings Workflow**

```
[Webhook: settings] 
    ↓
[Get row(s) in sheet: Admin Sheet]
    ↓
[JavaScript Node: Transform Data]
    ↓ (maps Admin Username → adminUsername, etc.)
[Respond to Webhook]
    ↓ (returns JSON with settings object)
```

**Example: GET /admin/dashboard Workflow**

```
[Webhook: admin/dashboard]
    ↓
[Get All Users from User Data Sheet]
    ↓
[Get All Queries from Queries Sheet]
    ↓
[JavaScript Node: Aggregate Statistics]
    ↓ (calculates totals, filters data)
[Respond to Webhook]
    ↓ (returns JSON with dashboard object)
```

---

## 10. Contact

For questions or clarifications during implementation, please reach out.

**Document Version:** 1.0  
**Date:** November 14, 2025  
**Author:** Development Team
