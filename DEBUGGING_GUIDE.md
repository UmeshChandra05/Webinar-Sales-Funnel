# 🔍 Debugging Guide - User Not Found Issue

## Problem
- n8n is working and responding
- User is registered
- But login says "user not found"

## Common Causes

### 1. **n8n Response Format Mismatch**
The backend expects user data, but n8n might be returning it in a different format.

**✅ Backend now handles 3 formats:**
- Format 1: `{ "user": { email, password, name, ... } }`
- Format 2: `{ email, password, name, ... }` (direct)
- Format 3: `[{ email, password, name, ... }]` (array)

### 2. **Missing Password Field**
n8n might not be returning the password field.

---

## 🧪 How to Debug

### Step 1: Check Backend Terminal Logs

After you updated the code, the terminal will now show:

**For Registration:**
```
👤 User registration: { email: 'test@example.com', name: 'Test User', role: 'Student' }
🌐 API Request: POST https://harshasrialluri.app.n8n.cloud/webhook-test/auth/register
✅ User registration sent to n8n successfully
📦 n8n Registration Response: {
  "success": true,
  "userId": "12345"
}
```

**For Login:**
```
🔐 User login attempt: { email: 'test@example.com' }
🌐 API Request: POST https://harshasrialluri.app.n8n.cloud/webhook-test/auth/login
✅ n8n response received
📦 Response data: {
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "password": "$2a$10$ABC...XYZ",
    "mobile": "1234567890",
    "role": "Student"
  }
}
👤 User data retrieved: { email: 'test@example.com', name: 'Test User', hasPassword: true }
✅ Password verified successfully
```

---

## 🔍 What to Look For in Logs

### ❌ If you see: "No user data found in n8n response"
**Cause:** n8n is not returning the user data properly

**Check in n8n:**
1. Is the login webhook finding the user in Google Sheets?
2. Is it returning the user data in the response?

### ❌ If you see: "No password hash returned from n8n"
**Cause:** n8n is returning user data but WITHOUT the password field

**Fix in n8n:**
Make sure your login webhook returns the `password` column from Google Sheets!

### ❌ If you see: "Invalid password for user"
**Cause:** Password comparison failed

**Possible issues:**
1. You're entering the wrong password
2. The password stored in Google Sheets is not hashed correctly
3. The hash was modified/corrupted

---

## 📝 Expected n8n Response for Login

Your n8n `/auth/login` webhook should return:

```json
{
  "user": {
    "id": "user_123",
    "email": "test@example.com",
    "name": "Test User",
    "password": "$2a$10$AbCdEf1234567890HASH_STRING_HERE",
    "mobile": "1234567890",
    "role": "Student"
  }
}
```

**Or simply (without the "user" wrapper):**

```json
{
  "id": "user_123",
  "email": "test@example.com",
  "name": "Test User",
  "password": "$2a$10$AbCdEf1234567890HASH_STRING_HERE",
  "mobile": "1234567890",
  "role": "Student"
}
```

**Both formats work now!**

---

## 🎯 Quick Tests

### Test 1: Check if n8n is Storing Data

1. Register a new user
2. Check your Google Sheets
3. **Verify:**
   - ✅ Email is there
   - ✅ Name is there
   - ✅ Password column has hash (starts with `$2a$10$`)
   - ✅ Mobile and Role are there

### Test 2: Check n8n Login Response

Use this curl command to test n8n directly:

```bash
curl -X POST https://harshasrialluri.app.n8n.cloud/webhook-test/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"anypassword","type":"user_login"}'
```

**Expected result:**
- Should return user data including the password hash
- Should NOT return 404 or empty response

### Test 3: Test Full Login Flow

1. Go to http://localhost:3000/login
2. Enter your registered email and password
3. Click Login
4. **Check the terminal** - you'll now see detailed logs showing:
   - What n8n returned
   - Whether user data was found
   - Whether password matched

---

## 🔧 Common n8n Issues

### Issue 1: Email Lookup Not Working

**In n8n Google Sheets node:**
- Make sure you're searching the correct column (Email column)
- Use lowercase for email search: `{{ $json.email.toLowerCase() }}`
- Check that the column name matches exactly

### Issue 2: Not Returning All Fields

**In n8n Respond to Webhook node:**
Make sure you're mapping ALL fields:

```javascript
{
  "user": {
    "id": "{{ $json.id }}",
    "email": "{{ $json.email }}",
    "name": "{{ $json.name }}",
    "password": "{{ $json.password }}",  ← DON'T FORGET THIS!
    "mobile": "{{ $json.mobile }}",
    "role": "{{ $json.role }}"
  }
}
```

### Issue 3: Case Sensitivity

Emails should be case-insensitive. In n8n:
- Convert to lowercase when storing: `{{ $json.email.toLowerCase() }}`
- Convert to lowercase when searching: `{{ $json.email.toLowerCase() }}`

---

## 📊 Debugging Checklist

- [ ] Registration successfully stores data in Google Sheets
- [ ] Google Sheets has password column with hashed values (starts with `$2a$10$`)
- [ ] n8n login webhook searches for user by email
- [ ] n8n login webhook returns user data including password field
- [ ] Backend terminal shows "✅ n8n response received"
- [ ] Backend terminal shows "📦 Response data: {...}" with user info
- [ ] Backend terminal shows "👤 User data retrieved: { hasPassword: true }"
- [ ] Backend terminal shows "✅ Password verified successfully"

---

## 💡 Pro Tips

1. **Always check the terminal logs first** - they now show exactly what n8n is returning
2. **Test n8n directly** with curl to isolate issues
3. **Check Google Sheets** to verify data is actually stored
4. **Compare passwords** - the hash in Google Sheets should start with `$2a$10$`

---

## 🚨 Still Not Working?

Share these from the terminal:

1. The `📦 Response data:` log from login attempt
2. The `👤 User data retrieved:` log
3. Any error messages you see

This will help identify exactly what n8n is returning!

---

**Updated**: November 2, 2025
**Version**: 2.0 - With Enhanced Logging
