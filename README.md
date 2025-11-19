# 🚀 Webinar Sales Funnel Application

**A Full-Stack Python Webinar Registration & Payment Management Platform**

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)

A comprehensive webinar sales funnel application designed for educational institutions and trainers to manage webinar registrations, payments, and customer interactions. Features a modern React frontend, Node.js/Express backend, and seamless integration with n8n workflows for automation and Google Sheets for data storage.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Features in Detail](#features-in-detail)
- [API Documentation](#api-documentation)
- [Workflow Integration](#workflow-integration)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

This application provides a complete solution for managing webinar-based sales funnels, from initial lead capture to payment processing and post-purchase engagement. Built with modern web technologies and designed for scalability, it offers:

- **Public-facing website** for webinar promotion and registration
- **User authentication system** with JWT-based security
- **Payment simulation system** with coupon code support
- **Admin dashboard** with comprehensive analytics and data visualization
- **AI-powered chatbot** for instant customer support
- **n8n workflow integration** for automation and Google Sheets data storage
- **Contact management system** with ticket tracking

The application is designed for the **Python Full Stack Webinar** program but can be easily customized for any webinar or online course offering.

---

## ✨ Key Features

### 🎨 User-Facing Features

#### 1. **Landing Page**
- Modern, responsive design with gradient animations
- Real-time countdown timer to webinar start
- Dynamic content loading from backend settings
- Webinar features showcase with visual cards
- Smart CTA buttons based on authentication state
- Source tracking for marketing attribution (UTM parameters)

#### 2. **User Registration & Authentication**
- JWT-based authentication with HTTP-only cookies
- "Remember Me" functionality (7-day or 30-day sessions)
- Email validation and duplicate detection
- Password encryption using bcrypt (10 salt rounds)
- Source tracking for lead attribution
- Session persistence across browser refreshes
- Automatic token refresh for long sessions

#### 3. **Payment Processing**
- Simulated payment gateway integration
- Multiple payment status support:
  - **Success**: Immediate access to webinar resources
  - **Need Time to Confirm**: Deferred decision tracking
  - **Failure**: Retry mechanism with support
- Dynamic pricing with real-time calculation
- Coupon code validation system
- Discount percentage application
- Transaction ID generation and tracking
- WhatsApp community invite on successful payment

#### 4. **Coupon System**
- Backend-validated coupon codes
- Percentage-based discounts (0-100%)
- Real-time price calculation with discount preview
- Expiry date and usage limit tracking (via n8n)
- User eligibility verification

#### 5. **AI Chat Widget**
- Floating chat widget on all public pages
- Real-time AI responses via n8n integration
- Session tracking for conversation continuity
- Message history preservation
- Typing indicator animations
- Offline fallback messaging
- Mobile-responsive design

#### 6. **Contact Form**
- Multi-field contact form with validation
- Automatic ticket ID generation
- Submission tracking and timestamp
- Integration with admin query management
- Email notification triggers

#### 7. **User Dashboard Pages**
- **Thank You Page**: Post-payment confirmation
- **Payment Success Page**: WhatsApp invite and next steps
- **Payment Failed Page**: Retry options and support contact
- **About Page**: Webinar and instructor information
- **Contact Page**: Support and inquiry submission

---

### 🔐 Admin Features

#### 8. **Admin Dashboard**
- **Real-time Analytics**:
  - Total revenue tracking
  - Lead conversion rates
  - Payment success/failure metrics
  - User engagement statistics
  - Role distribution analysis
  
- **Interactive Charts**:
  - Registration trend analysis (Line chart)
  - Lead source breakdown (Horizontal bar chart)
  - Role distribution (Donut chart with percentages)
  - Hourly/daily/monthly granularity
  
- **Date Range Filtering**:
  - Today, Yesterday, Last 7/30/90 days
  - Last Month, All Time
  - Custom date range picker with calendar
  - Visual date selection with range highlighting
  
- **Lead Management Table**:
  - Searchable and sortable data grid
  - 18 customizable columns:
    - Name, Email, Mobile, Role
    - Client Status, Nurture Level
    - Payment Status, Transaction ID
    - Source, Registration Timestamp
    - Payable Amount, Paid Amount
    - Discount %, Discount Amount
    - Coupon Codes (Given & Applied)
    - Transaction Timestamp, Currency
  - Advanced column filters per field
  - Pagination (25/50/100/All items per page)
  - CSV export functionality
  - Color-coded payment status badges
  
- **Ticket Management**:
  - Open/Closed ticket tracking
  - Pending approval queue
  - AI-generated response editing
  - Direct email response sending
  - Query status workflow (Pending → Processed → Resolved)

#### 9. **Admin Settings Panel**
- **Webinar Configuration**:
  - Registration fee adjustment
  - Registration deadline setting
  - Webinar date and time configuration
  
- **Contact Information**:
  - Contact email management
  - WhatsApp community link
  - Discord server link
  
- **Admin Credentials**:
  - Username update
  - Password change (secure)
  
- **Real-time Updates**:
  - Instant settings propagation
  - Cache invalidation on update
  - Success/error notifications

#### 10. **Admin Authentication**
- Separate admin login system
- JWT-based admin sessions
- Token refresh mechanism
- Protected admin routes
- Auto-logout on token expiration
- Intentional rate limiting on failed attempts

---

### 🤖 Automation & Integration Features

#### 11. **n8n Workflow Integration**
The application leverages n8n for workflow automation and data management:

- **User Registration Flow**:
  - Capture lead data with hashed passwords
  - Store in Google Sheets (User Data tab)
  - Trigger welcome email sequences
  - Update CRM records
  
- **Authentication Flow**:
  - Query user credentials from Google Sheets
  - Validate password hashes
  - Return user profile data
  - Log authentication attempts
  
- **Payment Processing Flow**:
  - Record transaction details
  - Update payment status in real-time
  - Calculate and apply discounts
  - Generate transaction IDs
  - Trigger payment confirmation emails
  - Send WhatsApp invite links
  
- **Coupon Validation Flow**:
  - Validate coupon codes against database
  - Check expiry dates and usage limits
  - Return discount percentages
  - Log coupon usage
  
- **Contact Form Flow**:
  - Store inquiries in Google Sheets (Queries tab)
  - Send notification to admin
  - Auto-respond to user
  - Track ticket status
  
- **AI Chat Flow**:
  - Process natural language queries
  - Integrate with LLM (OpenAI/Claude)
  - Implement RAG with FAQ database
  - Store conversation history
  - Generate response recommendations for admin approval
  
- **Admin Operations Flow**:
  - Validate admin credentials
  - Fetch settings from Google Sheets (Admin tab)
  - Update settings with validation
  - Send query responses via email

#### 12. **Google Sheets Data Storage**
All data is stored in a centralized Google Sheet with three tabs:

- **User Data Tab (GID: 0)**:
  - User registration details
  - Payment information
  - Transaction records
  - Coupon usage tracking
  
- **Queries Tab (GID: Custom)**:
  - Contact form submissions
  - AI chat conversations
  - Admin responses
  - Ticket status tracking
  
- **Admin Tab (GID: Custom)**:
  - Application settings
  - Admin credentials
  - Configuration parameters

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Landing Page │  │  Auth Pages  │  │ Admin Panel  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Payment Page │  │ Contact Page │  │  AI Chatbot  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS (REST API)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │ Payment APIs │  │ Admin APIs   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ JWT Middleware│ │ Rate Limiter │  │ Validation   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ Webhook Calls (HTTP POST)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   n8n Workflow Engine                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Registration │  │   Payment    │  │   AI Chat    │     │
│  │   Workflow   │  │   Workflow   │  │   Workflow   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Email Sender │  │ CRM Updates  │  │ LLM (AI/LLM) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ Google Sheets API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets Database                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  User Data   │  │   Queries    │  │    Admin     │     │
│  │    (GID 0)   │  │  (GID Custom)│  │  (GID Custom)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

**User Registration Flow**:
1. User submits registration form → Frontend validates
2. Frontend sends POST to `/api/auth/register` → Backend validates
3. Backend hashes password with bcrypt → Sends to n8n `/capture-lead`
4. n8n stores in Google Sheets User Data tab → Returns success
5. Backend generates JWT token → Sets HTTP-only cookie
6. Frontend receives token → Stores user data → Redirects to payment

**Payment Processing Flow**:
1. User submits payment → Frontend calls `/api/simulate-payment`
2. Backend fetches registration fee from settings cache
3. Backend calculates discount and amounts → Sends to n8n `/simulate-payment`
4. n8n updates Google Sheets with transaction data
5. n8n triggers email notification and WhatsApp invite
6. Backend returns payment confirmation → Frontend redirects to success page

---

## 💻 Technology Stack

### Frontend
- **React 18.2**: Modern UI library with hooks
- **React Router DOM 6.20**: Client-side routing
- **Chart.js 4.5**: Data visualization
- **React-ChartJS-2**: React wrapper for Chart.js
- **ChartJS Plugin Datalabels**: Chart data labels
- **Fetch API**: HTTP client for API requests

### Backend
- **Node.js 16+**: JavaScript runtime
- **Express 4.18**: Web application framework
- **JWT (jsonwebtoken)**: Authentication tokens
- **bcryptjs**: Password hashing
- **Axios**: HTTP client for webhook calls
- **express-validator**: Input validation
- **express-rate-limit**: Rate limiting middleware
- **Helmet**: Security headers
- **Morgan**: HTTP request logger
- **CORS**: Cross-origin resource sharing
- **cookie-parser**: Cookie parsing middleware
- **dotenv**: Environment variable management

### Automation & Storage
- **n8n**: Workflow automation platform
- **Google Sheets API**: Data storage and retrieval
- **OpenAI/Claude API** (via n8n): AI chatbot intelligence

### Development Tools
- **nodemon**: Auto-restart on file changes
- **concurrently**: Run frontend and backend simultaneously
- **react-scripts**: React build tooling

---

## 📁 Project Structure

```
webinar-sales-funnel-app/
│
├── backend/                          # Node.js/Express backend
│   ├── config/
│   │   └── constants.js              # App constants and Google Sheets config
│   ├── controllers/
│   │   ├── adminController.js        # Admin authentication and dashboard
│   │   ├── authController.js         # User authentication (register, login, verify)
│   │   ├── configController.js       # Configuration endpoints
│   │   ├── leadController.js         # Contact form and AI chat
│   │   ├── paymentController.js      # Payment processing and coupon validation
│   │   ├── settingsController.js     # Settings management
│   │   └── webinarController.js      # Webinar info endpoints
│   ├── middleware/
│   │   └── axios.js                  # Axios instance configuration
│   ├── routes/
│   │   └── api.js                    # API route definitions
│   ├── index.js                      # Entry point (legacy)
│   ├── server.js                     # Express server setup
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Backend environment variables
│
├── frontend/                         # React frontend
│   ├── public/
│   │   ├── index.html                # HTML template
│   │   └── Python.png                # Python logo asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatWidget.js       # Floating AI chatbot widget
│   │   │   ├── Navigation.js         # Header navigation bar
│   │   │   ├── ProtectedRoute.js     # Route protection component
│   │   │   └── Toast.js              # Toast notification component
│   │   ├── contexts/
│   │   │   └── AuthContext.js        # Authentication context provider
│   │   ├── pages/
│   │   │   ├── AboutPage.js          # About webinar page
│   │   │   ├── AdminDashboard.js     # Admin analytics dashboard
│   │   │   ├── AdminLoginPage.js     # Admin login page
│   │   │   ├── AdminSettingsPage.js  # Admin settings panel
│   │   │   ├── ContactPage.js        # Contact form page
│   │   │   ├── LandingPage.js        # Main landing page
│   │   │   ├── LoginPage.js          # User login page
│   │   │   ├── NotFoundPage.js       # 404 error page
│   │   │   ├── PaymentFailedPage.js  # Payment failure page
│   │   │   ├── PaymentPage.js        # Payment simulation page
│   │   │   ├── PaymentSuccessPage.js # Payment success page
│   │   │   ├── QueryDetailsPage.js   # Query management (admin)
│   │   │   ├── RegisterPage.js       # User registration page
│   │   │   └── ThankYouPage.js       # Post-registration thank you
│   │   ├── services/
│   │   │   ├── constantsService.js   # Constants and settings fetching
│   │   │   └── googleSheetsService.js# Google Sheets data fetching
│   │   ├── utils/
│   │   │   ├── api.js                # API client wrapper
│   │   │   ├── errorHandler.js       # Error handling utilities
│   │   │   └── paymentUtils.js       # Payment status utilities
│   │   ├── App.js                    # Main App component
│   │   ├── index.js                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── package.json                  # Frontend dependencies
│   └── .env                          # Frontend environment variables
│
├── n8n/
│   └── WebinarSalesFunnel_Workflow.json  # n8n workflow configuration
│
├── package.json                      # Root package.json (scripts)
├── API_Documentation.md              # Comprehensive API documentation
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **n8n**: Self-hosted or cloud instance
- **Google Sheets**: Configured spreadsheet with proper sharing permissions

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/webinar-sales-funnel.git
cd webinar-sales-funnel
```

### Step 2: Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Environment Configuration

#### Backend Configuration (`backend/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (REQUIRED - Use strong random string, min 32 chars)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string

# n8n Integration
API_BASE_URL=https://your-n8n-instance.com/webhook

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Sheets Configuration
GOOGLE_SHEET_ID=1MBTt9nmLy82_vgB_xxEHXPPdimpto3T9z84QtRbh4Js
SHEET_GID_USER_DATA=0
SHEET_GID_QUERIES=123456789
SHEET_GID_ADMIN=987654321

# Rate Limiting (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration (`frontend/.env`)
```env
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# Or for production
# REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Step 4: Google Sheets Setup

1. **Create a Google Sheet** with three tabs:
   - **User Data** (GID: 0 - default first sheet)
   - **Queries** (Create and note the GID)
   - **Admin** (Create and note the GID)

2. **Get Sheet ID**:
   - From URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the `SHEET_ID` to `GOOGLE_SHEET_ID` in backend `.env`

3. **Get GIDs**:
   - Right-click sheet tab → "Copy link"
   - Extract `gid=` value from URL
   - Update `SHEET_GID_QUERIES` and `SHEET_GID_ADMIN` in backend `.env`

4. **Set Permissions**:
   - Share settings: "Anyone with the link can view"
   - Or configure Google Sheets API credentials in n8n

### Step 5: n8n Workflow Setup

1. **Import Workflow**:
   - Open n8n dashboard
   - Import `n8n/WebinarSalesFunnel_Workflow.json`

2. **Configure Webhooks**:
   - Ensure webhook URLs match your n8n instance
   - Update `API_BASE_URL` in backend `.env` with your n8n webhook base URL

3. **Connect Google Sheets**:
   - Configure Google Sheets credentials in n8n
   - Test connection to your spreadsheet

4. **Configure AI Integration** (Optional):
   - Add OpenAI or Claude credentials in n8n
   - Configure AI Chat workflow node

### Step 6: Run the Application

#### Development Mode (Concurrent)
```bash
# Run both frontend and backend simultaneously
npm run dev
```

#### Development Mode (Separate Terminals)
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend (serves built frontend)
npm start
```

### Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Admin Panel**: http://localhost:3000/admin

---

## 🔐 Environment Configuration

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT signing | `random-string-min-32-chars` | ✅ Yes |
| `API_BASE_URL` | n8n webhook base URL | `https://n8n.example.com/webhook` | ✅ Yes |
| `GOOGLE_SHEET_ID` | Google Sheets document ID | `1MBTt9nmLy82_vgB...` | ✅ Yes |
| `SHEET_GID_QUERIES` | Queries tab GID | `123456789` | ✅ Yes |
| `SHEET_GID_ADMIN` | Admin tab GID | `987654321` | ✅ Yes |
| `FRONTEND_URL` | Frontend domain for CORS | `http://localhost:3000` | ✅ Yes |
| `PORT` | Backend server port | `5000` | ❌ No (default: 5000) |
| `NODE_ENV` | Environment mode | `production` / `development` | ❌ No (default: development) |
| `SHEET_GID_USER_DATA` | User Data tab GID | `0` | ❌ No (default: 0) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) | ❌ No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ No |

### Security Best Practices

1. **JWT_SECRET**: 
   - Minimum 32 characters
   - Use cryptographically secure random string
   - Never commit to version control
   - Rotate periodically in production

2. **API_BASE_URL**:
   - Use HTTPS in production
   - Verify n8n instance is secured
   - Implement webhook authentication if possible

3. **Google Sheets**:
   - Use service account with limited permissions
   - Enable 2FA on Google account
   - Regularly audit access logs

---

## 🎯 Features in Detail

### User Authentication System

#### Registration
- **Fields**: Name, Email, Password, Mobile (optional), Role (optional)
- **Validation**: 
  - Email format validation
  - Password minimum 6 characters
  - Duplicate email detection
  - Mobile number validation (optional)
- **Source Tracking**: UTM parameters captured for marketing attribution
- **Security**: 
  - Password hashed with bcrypt (10 salt rounds)
  - JWT token generated on success
  - HTTP-only cookie set for session persistence
- **Integration**: Data sent to n8n → Stored in Google Sheets → Welcome email triggered

#### Login
- **Fields**: Email, Password, Remember Me (checkbox)
- **Session Duration**: 
  - Standard: 7 days
  - Remember Me: 30 days
- **Security**: 
  - Password comparison with bcrypt
  - JWT token refresh mechanism
  - Rate limiting on failed attempts
- **Integration**: User data fetched from Google Sheets via n8n

#### Token Management
- **Automatic Refresh**: Token auto-refreshes before expiry
- **Cookie Storage**: HTTP-only, Secure (production), SameSite=Strict
- **Verification**: `/api/auth/verify` endpoint for session validation
- **Logout**: Clears cookies and local storage

---

### Payment Processing System

#### Payment Simulation
The application simulates a payment gateway for demonstration purposes. In production, integrate with Razorpay, Stripe, or other payment providers.

**Payment Statuses**:
1. **Success**: 
   - Payment completed
   - WhatsApp community invite provided
   - Transaction ID generated
   - Email confirmation sent
   - User data updated in Google Sheets

2. **Need Time to Confirm**: 
   - User wants to defer decision
   - No payment processed
   - Follow-up workflow triggered
   - Status tracked for future engagement

3. **Failure**: 
   - Payment declined or error
   - Retry mechanism available
   - Support contact provided
   - Failed transaction logged

**Payment Calculations**:
```javascript
// Registration Fee (fetched from admin settings)
const registrationFee = 4999 // ₹4,999

// Discount Calculation
const discountAmount = registrationFee * (discountPercentage / 100)

// Payable Amount (always calculated, regardless of status)
const payableAmount = registrationFee - discountAmount

// Paid Amount (only for successful payments)
const paidAmount = paymentStatus === "Success" ? payableAmount : 0
```

**Transaction Tracking**:
- Unique transaction ID: `txn_{timestamp}_{random}`
- ISO 8601 timestamp
- Currency: INR (₹)
- All amounts stored in decimal format

---

### Coupon Code System

#### Validation Flow
1. User enters coupon code on payment page
2. Frontend sends to `/api/validate-coupon`
3. Backend forwards to n8n `/validate-coupon`
4. n8n queries Google Sheets coupon database
5. Validates:
   - Code exists and is active
   - Not expired
   - Usage limit not exceeded
   - User eligibility
6. Returns discount percentage
7. Frontend applies discount and updates UI

#### Coupon Management
- **Admin can create coupons** via Google Sheets:
  - Code (e.g., EARLY50, STUDENT10)
  - Discount percentage (0-100%)
  - Expiry date
  - Usage limit
  - Eligible user roles
  
- **Tracking**:
  - Coupon codes given to users (via marketing)
  - Coupon codes applied during payment
  - Usage analytics in admin dashboard

---

### AI Chat Widget

#### Features
- **Floating Widget**: Bottom-right corner on all public pages
- **Real-time Messaging**: Instant responses via n8n/LLM integration
- **Session Management**: Conversation history preserved per session
- **Typing Indicators**: Visual feedback while AI processes
- **Offline Fallback**: Friendly error messages when service unavailable
- **Mobile Responsive**: Adapts to screen size

#### AI Integration Architecture
```
User Query → Frontend AI Chat Widget
            ↓
Backend /api/ai-chat endpoint
            ↓
n8n AI Chat Workflow
            ↓
LLM (OpenAI/Claude API)
    ↑
    └─ RAG (Retrieval-Augmented Generation)
       ├─ FAQ Database (Google Sheets)
       ├─ Webinar Content
       └─ Previous Conversations
            ↓
n8n processes response
            ↓
Stores in Google Sheets (Queries tab)
            ↓
Returns response to backend
            ↓
Frontend displays message
```

#### AI Response Flow for Admin
- AI generates response recommendations
- Stored in Google Sheets with prefix: "AI Recommendation:"
- Admin reviews in dashboard "Pending Approval" section
- Admin can edit response before sending
- Upon approval, email sent to user
- Status updated: Pending → Admin Processed → Resolved

---

### Admin Dashboard Analytics

#### Metrics Cards
1. **Total Revenue**: Sum of all successful payments
2. **Total Leads**: Count of registered users (filtered by date range)
3. **Conversion Rate**: (Successful Payments / Total Leads) × 100
4. **Engagement Rate**: Percentage of non-unsubscribed users

#### Interactive Charts

##### 1. Registration Trend (Line Chart)
- **X-axis**: Time (hours/days/months)
- **Y-axis**: Number of registrations
- **Granularity**:
  - Single day: 24 hours (12 AM - 12 AM)
  - Multiple days: Daily breakdown
  - All Time: Monthly breakdown (Jan - Dec)
- **Features**: 
  - Smooth curve with gradient fill
  - Hover tooltips
  - Point highlights

##### 2. Lead Sources (Horizontal Bar Chart)
- **Shows**: Top 10 lead sources
- **Sorting**: Descending by count
- **Use Case**: Marketing attribution analysis
- **Colors**: Vibrant multi-color palette

##### 3. Role Distribution (Donut Chart)
- **Shows**: User role breakdown
- **Primary Roles**: Student, Faculty, Industry Professional, Entrepreneur
- **Features**: 
  - Percentage labels
  - Center cutout
  - Hover effects
  - Custom legend with counts

#### Lead Management Table

**Column Configuration** (18 columns available):
| Column | Always Visible | Description |
|--------|---------------|-------------|
| Name | ✅ Yes | User full name |
| Email | ✅ Yes | User email address |
| Mobile | ✅ Yes | Phone number |
| Role | ✅ Yes | Professional role |
| Client Status | ✅ Yes | Engagement status |
| Nurture Level | ✅ Yes | Marketing nurture stage |
| Payment Status | ❌ No | Payment completion status |
| Source | ❌ No | Lead attribution source |
| Registration Timestamp | ❌ No | Registration date/time |
| Payable Amount | ❌ No | Calculated payable |
| Paid Amount | ❌ No | Actually paid amount |
| Discount % | ❌ No | Applied discount percentage |
| Discount Amount | ❌ No | Discount in currency |
| Coupon Code (Given) | ❌ No | Marketer-provided coupon |
| Coupon Code (Applied) | ❌ No | User-applied coupon |
| Transaction ID | ❌ No | Payment transaction reference |
| Transaction Timestamp | ❌ No | Payment completion time |
| Currency | ❌ No | Currency code (INR) |

**Table Features**:
- **Search**: Real-time search across Name, Email, Mobile
- **Sort**: Click column headers to sort (ascending/descending)
- **Filter**: 
  - Global filters: Source, Payment Status
  - Per-column filters: All columns have individual dropdown filters
- **Pagination**: 25, 50, 100, or All items per page
- **Export**: Download filtered data as CSV
- **Visual Indicators**: 
  - Payment status badges (color-coded)
  - Amount highlighting based on status
  - Hover effects

#### Date Range Filtering
- **Quick Select**: Today, Yesterday, Last 7/30/90 days, Last Month, All Time
- **Custom Range**: Visual calendar picker with range selection
- **Visual Feedback**: Selected dates highlighted
- **Reset**: One-click reset to All Time
- **Persistence**: Applies to all charts and table data

#### Pending Approval System
- **Queue View**: Shows all queries with "Pending Approval" status
- **AI Response Display**: Shows AI-generated response with clear label
- **Edit Capability**: Admin can modify AI response before sending
- **Navigation**: Previous/Next buttons to cycle through queries
- **Send Action**: Triggers email to user and updates status
- **Auto-advance**: Moves to next query after sending

---

### Admin Settings Management

#### Editable Settings
1. **Webinar Configuration**:
   - Registration Fee (₹): Numeric input
   - Registration Deadline: Date picker
   - Webinar Date: Date picker
   - Webinar Time: Time picker (24-hour format)

2. **Contact Information**:
   - Contact Email: Email input with validation
   - WhatsApp Invite Link: URL input
   - Discord Server Link: URL input

3. **Admin Credentials**:
   - Admin Username: Text input
   - Admin Password: Password input (optional - only update if provided)

#### Settings Update Flow
1. Admin modifies settings in Settings Panel
2. Frontend sends PUT to `/api/admin/settings` (requires admin token)
3. Backend validates all inputs
4. Backend sends to n8n `/post-settings`
5. n8n updates Google Sheets Admin tab
6. Backend invalidates settings cache
7. All users see updated settings on next page load

#### Settings Cache Strategy
- **Preload**: Settings fetched at app startup (before app renders)
- **Cache Duration**: Infinite (until manually refreshed or updated)
- **Invalidation**: Only on admin update
- **Performance**: Reduces API calls, improves load time

---

## 📚 API Documentation

For comprehensive API documentation including:
- All endpoint specifications
- Request/response formats
- Error handling
- Authentication requirements
- Rate limiting details
- Webhook integration guides

See: **[API_Documentation.md](./API_Documentation.md)**

---

## 🔄 Workflow Integration

### n8n Workflow Configuration

#### Required Webhooks
Configure these webhook URLs in your n8n workflows:

| Webhook | Method | Purpose |
|---------|--------|---------|
| `/capture-lead` | POST | User registration |
| `/user-login` | POST | User authentication |
| `/simulate-payment` | POST | Payment processing |
| `/validate-coupon` | POST | Coupon validation |
| `/contact-form` | POST | Contact submissions |
| `/ai-chat` | POST | AI chatbot queries |
| `/send-response` | POST | Admin query responses |
| `/admin-auth` | POST | Admin authentication |
| `/get-settings` | GET | Fetch settings |
| `/post-settings` | POST | Update settings |

#### n8n Workflow Import
1. Download `n8n/WebinarSalesFunnel_Workflow.json`
2. Open n8n dashboard
3. Click "Import from File"
4. Select the workflow JSON
5. Configure credentials:
   - Google Sheets API credentials
   - OpenAI/Claude API key (if using AI)
   - Email service credentials (SMTP)
6. Activate workflows

#### Google Sheets Schema

##### User Data Sheet Columns
```
name | email | mobile | role | source | reg_timestamp | password | 
nurturing | client_status | payment_status | txn_id | txn_timestamp | 
paid_amt | reg_fee | payable_amt | discount_amt | discount_percentage | 
couponcode_given | couponcode_applied | currency | whatsapp_invite | 
discord_link
```

##### Queries Sheet Columns
```
ticket_id | name | email | mobile | query | query_reply | 
query_category | query_status | query_resolved_by | query_timestamp | 
query_resolved_timestamp
```

##### Admin Sheet Columns
```
admin_username | admin_password | reg_fee | reg_deadline | 
webinar_date | webinar_time | contact_email | whatsapp_invite | 
discord_link
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **HTTP-Only Cookies**: Protection against XSS attacks
- **Secure Flag**: HTTPS enforcement in production
- **SameSite=Strict**: CSRF protection
- **Token Expiry**: 7-day (standard) or 30-day (remember me) sessions
- **Password Hashing**: bcrypt with 10 salt rounds
- **Admin Separation**: Separate authentication system for admins

### Input Validation
- **express-validator**: Server-side validation for all inputs
- **Email Normalization**: Lowercase and trimmed
- **XSS Protection**: Helmet middleware
- **Request Size Limit**: 2MB maximum payload
- **Field Length Limits**: All fields have max length constraints

### Rate Limiting
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per IP (configurable)
- **Applies to**: All `/api/*` endpoints
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### CORS Configuration
- **Origin Whitelist**: Only configured frontend URL allowed
- **Credentials**: Enabled for cookie-based auth
- **Methods**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization

### HTTPS Enforcement
- **Development**: HTTP allowed
- **Production**: Automatic redirect to HTTPS
- **Header Check**: X-Forwarded-Proto validation

### Error Handling
- **Development**: Detailed error messages and stack traces
- **Production**: Generic error messages, no stack traces
- **Logging**: All errors logged server-side
- **User-Friendly**: Clear error messages for users

---

## 🚀 Deployment

### Backend Deployment (Node.js/Express)

#### Platform Options
1. **Vercel**: Serverless deployment
2. **Heroku**: Container-based hosting
3. **DigitalOcean App Platform**: PaaS
4. **AWS EC2/Elastic Beanstalk**: Full control
5. **Railway**: Modern PaaS

#### Deployment Steps (Vercel Example)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Environment Variables (Production)
Set these in your hosting platform:
```
NODE_ENV=production
JWT_SECRET=<strong-random-string>
API_BASE_URL=<your-n8n-webhook-url>
FRONTEND_URL=<your-frontend-domain>
GOOGLE_SHEET_ID=<your-sheet-id>
SHEET_GID_QUERIES=<queries-gid>
SHEET_GID_ADMIN=<admin-gid>
```

---

### Frontend Deployment (React)

#### Platform Options
1. **Vercel**: Zero-config React deployment
2. **Netlify**: Continuous deployment from Git
3. **GitHub Pages**: Free static hosting
4. **AWS S3 + CloudFront**: Scalable CDN
5. **Firebase Hosting**: Google's hosting solution

#### Deployment Steps (Vercel Example)
```bash
# Build the frontend
cd frontend
npm run build

# Deploy with Vercel
vercel --prod

# Or configure auto-deployment from GitHub
```

#### Environment Variables (Production)
Set in hosting platform:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

#### Build Command
```bash
npm run build
```

#### Output Directory
```
build/
```

---

### n8n Deployment

#### Cloud Options
1. **n8n.cloud**: Official managed hosting (recommended)
2. **DigitalOcean Droplet**: Self-hosted
3. **AWS EC2**: Self-hosted
4. **Heroku**: Container-based
5. **Docker**: Self-hosted container

#### Self-Hosting with Docker
```bash
# Pull n8n image
docker pull n8nio/n8n

# Run n8n with persistent storage
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Import Workflows
1. Access n8n dashboard
2. Import `n8n/WebinarSalesFunnel_Workflow.json`
3. Configure all credentials
4. Update webhook URLs if needed
5. Activate all workflows

---

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `NODE_ENV=production`
- [ ] Set correct `FRONTEND_URL` and `API_BASE_URL`
- [ ] Enable HTTPS for all domains
- [ ] Configure Google Sheets permissions
- [ ] Set up n8n workflows with proper credentials
- [ ] Test all user flows end-to-end
- [ ] Configure error logging (Sentry, LogRocket)
- [ ] Set up monitoring (UptimeRobot, Datadog)
- [ ] Configure backup for Google Sheets
- [ ] Test rate limiting and security headers
- [ ] Verify CORS configuration
- [ ] Test payment flows thoroughly
- [ ] Configure email service (SMTP)
- [ ] Set up analytics (Google Analytics, Mixpanel)
- [ ] Configure admin alerts for critical errors

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a Pull Request

### Code Standards
- **JavaScript**: ES6+ syntax
- **React**: Functional components with hooks
- **Node.js**: Async/await for asynchronous code
- **Comments**: Clear, concise documentation
- **Error Handling**: Try-catch blocks with meaningful messages

### Testing
- Test all new features manually
- Verify backend API endpoints with Postman
- Check frontend UI on desktop and mobile
- Ensure n8n workflows execute correctly

### Reporting Issues
Use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)

---

## 🙏 Acknowledgments

- **n8n**: Workflow automation platform
- **Google Sheets**: Data storage solution
- **Chart.js**: Data visualization library
- **React**: UI library
- **Express**: Backend framework
- **OpenAI/Claude**: AI chatbot intelligence

---

## 🎓 About the Webinar

**Python Full Stack in 5 Days** is an intensive webinar program designed to teach complete full-stack development using Python, Flask, and React. Topics covered:

- ✅ Python Basics to Advanced
- ✅ Flask Backend Development
- ✅ React Frontend Integration
- ✅ RESTful API Design & Implementation
- ✅ Database Integration
- ✅ Authentication & Authorization
- ✅ Deployment Strategies

**Duration**: 5 days  
**Format**: Live, hands-on sessions  
**Includes**: Lifetime access to recordings, code templates, 1-on-1 mentorship, and certificate of completion

---

## 📊 Project Statistics

- **Total Files**: 50+
- **Lines of Code**: ~15,000+
- **Components**: 15+ React components
- **API Endpoints**: 18+ REST endpoints
- **Workflows**: 10+ n8n automation workflows
- **Dependencies**: 30+ npm packages

---

## 🔮 Future Enhancements

Planned features for future releases:

- [ ] Real payment gateway integration (Razorpay/Stripe)
- [ ] Multi-language support (i18n)
- [ ] Certificate generation and distribution
- [ ] Video streaming integration
- [ ] Discussion forum
- [ ] Automated SMS notifications
- [ ] Social media sharing features
- [ ] A/B testing framework
- [ ] Advanced lead scoring

---

## 📚 Additional Resources

- [API Documentation](./API_Documentation.md) - Complete API reference
- [n8n Documentation](https://docs.n8n.io/) - n8n workflow guides
- [React Documentation](https://react.dev/) - React official docs
- [Express Documentation](https://expressjs.com/) - Express.js guides
- [JWT Best Practices](https://jwt.io/introduction) - JWT security

---

*Last Updated: November 17, 2025*