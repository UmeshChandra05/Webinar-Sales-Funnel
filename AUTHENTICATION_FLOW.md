# 🔐 Authentication Flow - SIMPLE VERSION

## Super Simple Explanation

**The Problem:**
- During registration: Password gets hashed (encrypted) with bcrypt
- During login: You send plain password to n8n, but n8n can't check if it's correct

**The Solution:**
- Use your SAME n8n webhook: `https://harshasrialluri.app.n8n.cloud/webhook-test/auth/login`
- But change what n8n returns back to the backend

---

## What You Need to Change in n8n

### Your existing `/auth/login` webhook needs to:

**BEFORE (What it probably does now):**
- Receive email + password
- Try to check if password is correct ❌ (Can't do this because password is hashed!)
- Return success/failure

**AFTER (What it should do):**
- Receive email + password (plain text)
- Look up the user in Google Sheets by email
- **DON'T check the password in n8n**
- Return the user data INCLUDING the hashed password

---

## 📝 Simple Step-by-Step for n8n

### Step 1: Modify your existing login webhook

**When backend sends:**
```json
{
  "email": "test@example.com",
  "password": "mypassword123",
  "type": "user_login"
}
```

**Your n8n should:**
1. Search Google Sheets for email = "test@example.com"
2. If found, return this:
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "test@example.com",
    "password": "$2a$10$ABC...XYZ",  ← THE HASHED PASSWORD FROM GOOGLE SHEETS
    "mobile": "1234567890",
    "role": "Student"
  }
}
```

3. If NOT found, return 404 error:
```json
{
  "success": false,
  "message": "User not found"
}
```

**That's it!** The backend will then check if the password is correct.

---

## 🖼️ Visual Guide

### What happens in n8n LOGIN webhook:

```
┌─────────────────────────────────────────────┐
│          n8n LOGIN Workflow                 │
└─────────────────────────────────────────────┘

1. WEBHOOK receives:
   {
     "email": "test@example.com",
     "password": "mypassword123"
   }
   
2. GOOGLE SHEETS LOOKUP:
   Search for email = "test@example.com"
   
3. IF FOUND:
   Get the row data:
   - Name: "John Doe"
   - Email: "test@example.com"  
   - Password: "$2a$10$ABC...XYZ" ← This is the HASH
   - Mobile: "1234567890"
   - Role: "Student"
   
4. RESPOND TO WEBHOOK:
   {
     "user": {
       "id": "user_123",
       "name": "John Doe",
       "email": "test@example.com",
       "password": "$2a$10$ABC...XYZ",  ← INCLUDE THIS!
       "mobile": "1234567890",
       "role": "Student"
     }
   }

5. IF NOT FOUND:
   Return 404 with error
```

### Then the Backend does this:

```
Backend receives n8n response
  ↓
Got user.password = "$2a$10$ABC...XYZ" (the hash)
Got plain password = "mypassword123"
  ↓
bcrypt.compare("mypassword123", "$2a$10$ABC...XYZ")
  ↓
Match? ✅ YES → Login success, create JWT token
Match? ❌ NO  → Return "Invalid password"
```

---

## 🔑 Password Security
- **Registration**: Passwords are hashed using **bcrypt** with 10 salt rounds before storing
- **Login**: Backend receives hashed password from n8n, then compares it with user's plain password
- **Storage**: Only the hashed password is stored in Google Sheets via n8n

### 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User → Backend → n8n → Google Sheets
       (Hash password here)
       Send hashed password →
                      Store in sheet

Example: 
Password "test123" → Backend hashes to "$2a$10$ABC...XYZ" → n8n stores


┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                            │
└─────────────────────────────────────────────────────────────┘

User → Backend → n8n → Backend
       Send plain     Get hashed    Compare:
       password       password      - Plain: "test123"
                      from sheet    - Hash: "$2a$10$ABC...XYZ"
                                    - Match? ✓ Login success!
```

---

## 🎯 Simple Rules

### In n8n, for LOGIN webhook:
1. ✅ DO: Search user by email
2. ✅ DO: Return ALL user fields including the hashed password
3. ❌ DON'T: Try to compare passwords in n8n
4. ❌ DON'T: Change or modify the hashed password

### In n8n, for REGISTRATION webhook:
1. ✅ DO: Store the hashed password exactly as received
2. ✅ DO: Check if email already exists (return error if duplicate)
3. ❌ DON'T: Try to hash the password again in n8n

---

## 🧪 Quick Test

After you update n8n:

1. **Register**: http://localhost:3000/register
   - Name: Test User
   - Email: test@example.com
   - Password: password123

2. **Check Google Sheets**: Should see password like `$2a$10$...`

3. **Login**: http://localhost:3000/login
   - Email: test@example.com
   - Password: password123
   - Should work! ✅

---

## 🚨 Troubleshooting

**"No password hash returned from n8n"**
→ Your n8n login webhook is not returning the `password` field. Add it!

**"Invalid email or password"**
→ Either email doesn't exist, or password is wrong, or n8n is not returning the correct hash

**Timeout errors**
→ n8n is taking too long. Optimize your Google Sheets lookup.

---

## 📊 What's in Google Sheets

Your user data should look like:

| Email | Name | Password | Mobile | Role |
|-------|------|----------|--------|------|
| test@example.com | Test User | $2a$10$ABC...XYZ | 1234567890 | Student |

The password column contains the **hash**, not the plain password!

---

**Last Updated**: November 2, 2025
**Version**: 1.0
