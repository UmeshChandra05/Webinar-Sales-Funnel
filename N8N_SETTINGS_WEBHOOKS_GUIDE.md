# n8n Webhooks for Admin Settings - Complete Implementation Guide

## Overview
This guide shows how to set up two n8n webhooks for managing admin settings in Google Sheets.

---

## Google Sheets Structure

### Sheet Name: **Admin** (Sheet 3)

**Column Structure:**

| Column A (Field Name) | Column B (Value) |
|----------------------|------------------|
| Admin Username | admin |
| Admin Password | admin |
| Registration Fee | 4999 |
| Registration Deadline | 7-11-2025 |
| Webinar Time | 8-11-2025 |
| Contact Email | webinar@pystack.com |
| Whatsapp Invite Link | www.google.com |
| Discord Community Link | www.discord.com |

**Important Notes:**
- Row 1 contains headers: `Field` and `Value`
- Data starts from Row 2
- Dates are in **DD-MM-YYYY** format in the sheet
- The backend automatically converts to/from YYYY-MM-DD format

---

## Webhook 1: GET Settings (Read from Google Sheets)

### Purpose
Fetch current admin settings from Google Sheets Admin tab when:
- Application loads
- Admin opens settings page
- Settings need to be refreshed

### Configuration

**Endpoint:** `POST {API_BASE_URL}/get-settings`  
**Method:** POST  
**Path:** `/webhook/webinar-funnel/get-settings`

**Request Payload:**
```json
{
  "action": "get_settings"
}
```

**Expected Response Format:**
```json
{
  "Admin Username": "admin",
  "Admin Password": "admin",
  "Registration Fee": 4999,
  "Registration Deadline": "7-11-2025",
  "Webinar Time": "8-11-2025",
  "Contact Email": "webinar@pystack.com",
  "Whatsapp Invite Link": "www.google.com",
  "Discord Community Link": "www.discord.com"
}
```

---

## n8n Workflow: GET Settings

### Step 1: Webhook Trigger
- **Node:** Webhook
- **HTTP Method:** POST
- **Path:** `webinar-funnel/get-settings`
- **Response Mode:** Last Node
- **Response Code:** 200

### Step 2: Read Google Sheets
- **Node:** Google Sheets
- **Operation:** Read
- **Document:** Your Webinar Google Sheet (ID: `1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8`)
- **Sheet:** Admin
- **Range:** `A2:B9` (All settings data)
- **Output as:** JSON

### Step 3: Transform Data to Key-Value Format
- **Node:** Code (JavaScript)

```javascript
// Get all rows from Google Sheets
const items = $input.all();

// Create settings object with exact field names
const settings = {};

// Process each row
items.forEach(item => {
  const field = item.json.Field || item.json['A'];  // Column A
  const value = item.json.Value || item.json['B'];  // Column B
  
  if (field && value !== undefined) {
    settings[field] = value;
  }
});

// Return the settings object
return [{
  json: settings
}];
```

**Alternative if Google Sheets returns array format:**
```javascript
const items = $input.all();
const settings = {};

// If data comes as array: [["Admin Username", "admin"], ...]
items.forEach(item => {
  const rowData = item.json;
  
  // Handle different formats
  if (Array.isArray(rowData)) {
    settings[rowData[0]] = rowData[1];
  } else if (rowData.Field && rowData.Value !== undefined) {
    settings[rowData.Field] = rowData.Value;
  }
});

return [{ json: settings }];
```

### Step 4: Respond to Webhook
- **Node:** Respond to Webhook
- **Response Code:** 200
- **Response Body:** `{{ $json }}`

---

## Webhook 2: POST Settings (Write to Google Sheets)

### Purpose
Update admin settings in Google Sheets when:
- Admin saves changes in settings page

### Configuration

**Endpoint:** `POST {API_BASE_URL}/post-settings`  
**Method:** POST  
**Path:** `/webhook/webinar-funnel/post-settings`

**Request Payload:**
```json
{
  "sheet": "Admin",
  "action": "update_settings",
  "data": {
    "Admin Username": "admin",
    "Admin Password": "newpass123",
    "Registration Fee": 5999,
    "Registration Deadline": "15-12-2025",
    "Webinar Time": "20-12-2025",
    "Contact Email": "support@pystack.com",
    "Whatsapp Invite Link": "https://wa.me/919876543210",
    "Discord Community Link": "https://discord.gg/yourserver"
  }
}
```

**Expected Response Format:**
```json
{
  "success": true,
  "message": "Admin settings updated successfully",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```

---

## n8n Workflow: POST Settings

### Step 1: Webhook Trigger
- **Node:** Webhook
- **HTTP Method:** POST
- **Path:** `webinar-funnel/post-settings`
- **Response Mode:** Last Node

### Step 2: Validate Request
- **Node:** IF (Conditional)
- **Condition 1:** `{{ $json.sheet }}` equals `Admin`
- **Condition 2:** `{{ $json.action }}` equals `update_settings`
- **Condition 3:** `{{ $json.data }}` is not empty

### Step 3: Extract and Prepare Data
- **Node:** Code (JavaScript)

```javascript
// Extract settings data from webhook payload
const data = $input.first().json.data;

// Validate required fields
if (!data) {
  throw new Error('No data provided');
}

// Create array of updates for each setting field
// Each object represents one row to update in Google Sheets
const updates = [
  {
    field: 'Admin Username',
    value: data['Admin Username'] || 'admin',
    range: 'Admin!B2',
    row: 2
  },
  {
    field: 'Admin Password',
    value: data['Admin Password'] || 'admin',
    range: 'Admin!B3',
    row: 3
  },
  {
    field: 'Registration Fee',
    value: data['Registration Fee'] || 4999,
    range: 'Admin!B4',
    row: 4
  },
  {
    field: 'Registration Deadline',
    value: data['Registration Deadline'] || '7-11-2025',
    range: 'Admin!B5',
    row: 5
  },
  {
    field: 'Webinar Time',
    value: data['Webinar Time'] || '8-11-2025',
    range: 'Admin!B6',
    row: 6
  },
  {
    field: 'Contact Email',
    value: data['Contact Email'] || 'webinar@pystack.com',
    range: 'Admin!B7',
    row: 7
  },
  {
    field: 'Whatsapp Invite Link',
    value: data['Whatsapp Invite Link'] || 'www.google.com',
    range: 'Admin!B8',
    row: 8
  },
  {
    field: 'Discord Community Link',
    value: data['Discord Community Link'] || 'www.discord.com',
    range: 'Admin!B9',
    row: 9
  }
];

// Return array of updates
return updates.map(update => ({ json: update }));
```

### Step 4: Loop Through Updates (Option A - One by One)
- **Node:** Split In Batches
- **Batch Size:** 1

### Step 5: Update Google Sheets (Row by Row)
- **Node:** Google Sheets
- **Operation:** Update
- **Document:** Your Webinar Google Sheet
- **Sheet:** Admin
- **Range:** `{{ $json.range }}`
- **Value Input Mode:** RAW
- **Values:** `{{ $json.value }}`

### Step 6: Merge Results
- **Node:** Merge
- **Mode:** Keep Key Matches
- Combines all the updated results

---

## Alternative: Bulk Update (Faster Method)

Instead of updating row by row, update all at once:

### Modified Step 3: Prepare Bulk Update
```javascript
const data = $input.first().json.data;

// Create single update with all values
const values = [
  [data['Admin Username'] || 'admin'],
  [data['Admin Password'] || 'admin'],
  [data['Registration Fee'] || 4999],
  [data['Registration Deadline'] || '7-11-2025'],
  [data['Webinar Time'] || '8-11-2025'],
  [data['Contact Email'] || 'webinar@pystack.com'],
  [data['Whatsapp Invite Link'] || 'www.google.com'],
  [data['Discord Community Link'] || 'www.discord.com']
];

return [{
  json: {
    range: 'Admin!B2:B9',
    values: values
  }
}];
```

### Modified Step 4: Google Sheets (Bulk Update)
- **Node:** Google Sheets
- **Operation:** Update
- **Document:** Your Webinar Google Sheet
- **Sheet:** Admin
- **Range:** `Admin!B2:B9`
- **Value Input Mode:** JSON
- **Values:** `{{ $json.values }}`

---

## Step 7: Respond to Webhook (For Both Methods)
- **Node:** Respond to Webhook
- **Response Code:** 200
- **Response Body:**

```json
{
  "success": true,
  "message": "Admin settings updated successfully",
  "timestamp": "{{ $now.toISO() }}"
}
```

---

## Complete Workflow Diagrams

### GET Settings Workflow:
```
┌─────────────────┐
│ Webhook Trigger │
│ POST /get-      │
│ settings        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Sheets   │
│ Read A2:B9      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Code: Transform │
│ to Key-Value    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Respond to      │
│ Webhook (200)   │
└─────────────────┘
```

### POST Settings Workflow:
```
┌─────────────────┐
│ Webhook Trigger │
│ POST /post-     │
│ settings        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ IF: Validate    │
│ sheet="Admin"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Code: Extract & │
│ Prepare Updates │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Sheets   │
│ Update B2:B9    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Respond to      │
│ Webhook (200)   │
└─────────────────┘
```

---

## Testing the Webhooks

### Test GET Settings:
```bash
curl -X POST https://your-n8n.com/webhook/webinar-funnel/get-settings \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_settings"
  }'
```

**Expected Response:**
```json
{
  "Admin Username": "admin",
  "Admin Password": "admin",
  "Registration Fee": 4999,
  "Registration Deadline": "7-11-2025",
  "Webinar Time": "8-11-2025",
  "Contact Email": "webinar@pystack.com",
  "Whatsapp Invite Link": "www.google.com",
  "Discord Community Link": "www.discord.com"
}
```

### Test POST Settings:
```bash
curl -X POST https://your-n8n.com/webhook/webinar-funnel/post-settings \
  -H "Content-Type: application/json" \
  -d '{
    "sheet": "Admin",
    "action": "update_settings",
    "data": {
      "Admin Username": "admin",
      "Admin Password": "newpass123",
      "Registration Fee": 5999,
      "Registration Deadline": "15-12-2025",
      "Webinar Time": "20-12-2025",
      "Contact Email": "test@pystack.com",
      "Whatsapp Invite Link": "https://wa.me/919876543210",
      "Discord Community Link": "https://discord.gg/test"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin settings updated successfully",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```

---

## Environment Configuration

### Backend .env File:
```bash
# Base n8n webhook URL
API_BASE_URL=https://your-n8n.com/webhook/webinar-funnel

# Optional: Override specific endpoints
N8N_GET_SETTINGS_WEBHOOK=https://your-n8n.com/webhook/webinar-funnel/get-settings
N8N_UPDATE_SETTINGS_WEBHOOK=https://your-n8n.com/webhook/webinar-funnel
```

---

## Data Flow

### When Application Loads:
```
1. Frontend → GET /api/settings
2. Backend → POST {API_BASE_URL}/get-settings
3. n8n → Read Google Sheets Admin tab
4. n8n → Transform to key-value format
5. n8n → Return settings JSON
6. Backend → Convert dates DD-MM-YYYY → YYYY-MM-DD
7. Backend → Return to frontend
8. Frontend → Cache for 5 minutes
```

### When Admin Saves Settings:
```
1. Frontend → PUT /api/admin/settings (with admin token)
2. Backend → Validate data
3. Backend → Convert dates YYYY-MM-DD → DD-MM-YYYY
4. Backend → POST {API_BASE_URL}/post-settings
5. n8n → Validate request
6. n8n → Update Google Sheets B2:B9
7. n8n → Return success response
8. Backend → Return success to frontend
9. Frontend → Show success toast
10. Frontend → Refresh settings cache
```

---

## Important Notes

### Date Format Handling:
- **Google Sheets:** DD-MM-YYYY (e.g., "7-11-2025")
- **Backend API:** YYYY-MM-DD (e.g., "2025-11-07")
- **Frontend:** YYYY-MM-DD for date inputs
- **Conversion:** Backend handles all conversions automatically

### Password Handling:
- Password is optional when updating (only updates if provided)
- Leave blank in frontend to keep current password
- n8n should store password as-is (backend handles hashing if needed)

### Error Handling:
- If n8n is unavailable, backend returns default fallback settings
- Frontend always has default values to prevent app crashes
- Error messages are logged but users see friendly fallback data

---

## Troubleshooting

### GET Settings Returns Empty:
1. Check Google Sheets Admin tab has correct structure
2. Verify Range is `A2:B9` (not A1:B9)
3. Check field names match exactly (case-sensitive)
4. Test Google Sheets node independently in n8n

### POST Settings Not Saving:
1. Check webhook receives correct payload format
2. Verify "sheet" field equals "Admin"
3. Check Google Sheets API permissions
4. Test with bulk update method if row-by-row fails

### Date Format Issues:
- Ensure dates in sheet are DD-MM-YYYY format
- Check conversion logic in backend
- Verify n8n returns dates in correct format

### Authentication Errors:
- Ensure Google Sheets node has proper credentials
- Verify Sheet ID and permissions are correct
- Check n8n service account has edit access

---

## Summary

✅ **GET Settings:** `POST /get-settings` → Reads from Google Sheets Admin tab  
✅ **POST Settings:** `POST /post-settings` → Writes to Google Sheets Admin tab  
✅ **Automatic Date Conversion:** DD-MM-YYYY ↔ YYYY-MM-DD  
✅ **Error Handling:** Falls back to defaults if n8n unavailable  
✅ **Security:** Admin authentication required for updates  
✅ **Validation:** Both frontend and backend validate before saving  

Your admin settings system is now fully webhook-based with n8n as the middle layer! 🚀
