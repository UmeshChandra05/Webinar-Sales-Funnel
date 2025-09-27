# PyStack Analytics - Webinar Sales Funnel App

🚀 **Complete Professional Webinar Sales Funnel with Admin Dashboard** - A sophisticated React-based application that transforms visitors into paying customers through a strategically designed conversion journey. Features a comprehensive admin panel with JWT authentication for managing analytics, leads, and performance metrics. This isn't just a landing page - it's a complete business management system with advanced features that maximize conversions and provide deep insights.

## 🎯 Complete Sales Funnel Features

### **🔥 Advanced Lead Generation System**
- **High-Converting Landing Page** with 2x2 instructor showcase grid for social proof
- **Smart Lead Capture** with role-based segmentation (Student, Faculty, Industry Professional)
- **Interactive FAQ Accordion** addressing objections and building trust
- **Professional Contact Forms** with intelligent validation and real-time feedback

### **💳 Sophisticated Payment & Conversion System**
- **Dynamic Coupon Engine** with n8n webhook validation for personalized offers
- **Professional Payment Flow** with strikethrough pricing and clear success/failure messaging
- **Customer Journey Optimization** with contextual guidance at every step
- **Conversion Tracking** through integrated lead capture workflows

### **🛡️ Secure Admin Dashboard System**
- **JWT Authentication** with 24-hour session management and secure token handling
- **PyStack Analytics Platform** with comprehensive performance metrics
- **Protected Admin Routes** with automatic session validation and cleanup
- **Professional Split-Screen Login** with gradient backgrounds and responsive design
- **Real-time Dashboard** with lead management, payment tracking, and analytics
- **Session Security** with automatic logout and token expiration handling

### **⚡ Professional User Experience**
- **Advanced Toast Notification System** with icons, progress bars, and animations
- **Smart Form Validation** with positive UX patterns and character limits
- **Real-time Feedback** for all user interactions
- **Mobile-Responsive Design** ensuring conversions across all devices

### **🏗️ Enterprise-Grade Technical Architecture**
- **React 18.2.0** with modern hooks and component architecture
- **JWT Authentication System** with secure token management and protected routes
- **Custom Animation Engine** with CSS keyframes and smooth transitions
- **n8n Workflow Integration** for real-time coupon validation and lead automation
- **Express.js Backend** with comprehensive validation middleware and admin endpoints
- **Professional Notification Framework** with progress tracking and user guidance
- **Advanced Form Engine** with character counting and real-time validation
- **RESTful API Design** with proper error handling and JWT middleware protection
- **PyStack Analytics Engine** with comprehensive dashboard and metrics tracking

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0, React Router, Axios, CSS Grid & Flexbox, Custom Animations
- **Backend**: Node.js, Express 4.18.2, express-validator, CORS, Helmet, **jsonwebtoken** for JWT authentication
- **Authentication**: JWT tokens with 24-hour expiration, protected routes, secure session management
- **Integration**: n8n webhooks for automation and coupon validation
- **UI/UX**: Professional toast system with icons & progress bars, accordion components, real-time form validation
- **Admin System**: PyStack Analytics dashboard with secure login and comprehensive metrics
- **Validation**: Frontend & backend validation with user-friendly error handling and character limits

## 🎯 Sales Funnel Optimization Features

**Conversion-Focused Design:**
- **Social Proof Integration**: 2x2 instructor showcase with expertise display
- **Objection Handling**: Interactive FAQ accordion addressing common concerns
- **Friction Reduction**: One-click coupon application with instant feedback
- **Trust Building**: Professional UI with clear progress indicators
- **Lead Segmentation**: Role-based categorization for targeted follow-up
- **Payment Optimization**: Streamlined checkout with dynamic pricing

**Advanced Analytics & Automation:**
- **Real-time Lead Capture**: Instant webhook triggers to n8n workflows
- **Conversion Tracking**: Complete funnel analytics from landing to payment
- **Personalized Offers**: Dynamic coupon system with user validation
- **Automated Follow-up**: Integrated lead nurturing through n8n

## 📋 Project Overview

This application handles the complete customer journey from landing page to webinar registration, plus comprehensive admin management:

### **🎯 Customer Journey:**
- **Lead Capture**: Role-based registration forms with real-time validation
- **Payment Processing**: Simulated payment flow (₹4999 webinar fee) with dynamic coupon system and strikethrough pricing
- **Coupon Validation**: Dynamic coupon code validation through n8n integration
- **Interactive UI**: Professional toast notifications with icons, progress bars, and animations
- **Form Validation**: Real-time character validation with user-friendly feedback
- **Webinar Management**: Registration and information display
- **Contact Forms**: Advanced message validation with character counting and error states

### **🛡️ Admin Management:**
- **Secure Authentication**: JWT-based login with environment variable credentials
- **PyStack Analytics Dashboard**: Comprehensive metrics and performance tracking
- **Protected Routes**: Automatic session validation and secure access control
- **Professional Admin UI**: Split-screen design with PyStack branding and analytics cards
- **Session Management**: 24-hour token expiration with automatic cleanup
- **Lead & Payment Tracking**: Real-time monitoring of conversions and revenue

### **🔗 Integration:**
- **n8n Webhooks**: Automated workflow triggers for payments, coupons, and lead capture
- **Backend API**: Secure endpoints with JWT middleware protection

## 🗂️ Project Structure

```
Webinar-Sales-Funnel-App/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Navigation component
│   │   ├── pages/           # All app pages
│   │   └── utils/           # API utilities
│   └── package.json
├── backend/                  # Node.js Express server
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Axios configuration
│   └── server.js
└── package.json             # Root scripts
```

## 🔄 Application Flow

```
Landing Page → Interest Form → Payment Page → Success/Failed → Thank You
     ↓
Contact/About Pages

Admin Route:
/admin → JWT Login → PyStack Analytics Dashboard
```

**Key Pages:**
- **Landing**: Hero section with countdown timer
- **About**: Team showcase with 2x2 instructor grid and professional layout
- **Register**: Interest capture form with role selection (Student, Faculty, Industry Professional, etc.)
- **Payment**: ₹4999 payment simulation with advanced coupon system, strikethrough pricing, and professional toast notifications
- **Success**: Payment confirmation with email delivery timeline information
- **Contact**: Support form with message validation (10-1000 chars) and interactive FAQ accordion
- **Thank You**: Conditional display based on payment status with proper user guidance
- **Admin Login**: Secure JWT authentication with PyStack branding and split-screen design
- **Admin Dashboard**: PyStack Analytics with lead management, payment tracking, and performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0+
- npm

### Installation

1. **Clone and install:**
```bash
git clone https://github.com/UmeshChandra05/Webinar-Sales-Funnel.git
cd Webinar-Sales-Funnel-App
npm run install:all
```

2. **Environment setup:**
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_BASE_URL=https://your-n8n-webhook-url.com/webhook

# Admin Authentication (N8n-based validation)
ADMIN_AUTH_WEBHOOK_URL=https://your-n8n-webhook-url.com/webhook/admin-auth
JWT_SECRET=your-super-secure-jwt-secret-key
```

3. **Start the application:**
```bash
npm run dev
```

Access at: `http://localhost:3000`

## 🛡️ Admin Access

**PyStack Analytics Dashboard:**
- **URL**: `http://localhost:3000/admin`
- **Authentication**: Dynamic validation through N8n webhook
- **Credentials**: Managed centrally in N8n workflow (no hardcoded values)
- **Features**: Lead management, payment tracking, PyStack analytics with Python-focused metrics
- **Session**: 24-hour JWT token with automatic expiration
- **Security**: Protected routes with N8n-based credential validation

## 🌐 API Endpoints

### **Public Endpoints:**
| Endpoint | Purpose | n8n Webhook |
|----------|---------|-------------|
| `POST /api/capture-lead` | Lead registration | `/capture-lead` |
| `POST /api/simulate-payment` | Payment processing | `/simulate-payment` |
| `POST /api/validate-coupon` | Coupon validation | `/validate-coupon` |
| `POST /api/contact` | Contact forms | `/contact-form` |
| `GET /api/webinar-info` | Webinar details | - |
| `POST /api/admin/login` | Admin authentication | `/admin-auth` |

### **Admin Endpoints (JWT Protected):**
| Endpoint | Purpose | Authentication |
|----------|---------|----------------|
| `POST /api/admin/login` | Admin authentication | N8n webhook validation |
| `GET /api/admin/dashboard` | Dashboard data | JWT Bearer token |
| `GET /api/admin/verify-token` | Token validation | JWT Bearer token |

## 🔧 n8n Integration

The app sends data to 5 n8n webhook endpoints:

**Lead Capture Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "Industry Professional",
  "source": "website",
  "timestamp": "2025-09-24T10:30:00Z",
  "ip_address": "192.168.1.100"
}
```

**Payment Data:**
```json
{
  "email": "john@example.com",
  "status": "success",
  "transaction_id": "txn_123456789",
  "amount": 3999,
  "originalAmount": 4999,
  "couponCode": "SAVE20",
  "discount": 20,
  "currency": "INR",
  "timestamp": "2025-09-24T10:30:00Z"
}
```

**Coupon Validation Data:**
```json
{
  "couponCode": "SAVE20",
  "email": "john@example.com",
  "timestamp": "2025-09-24T10:30:00Z",
  "action": "validate_coupon"
}
```

**Contact Form Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about the webinar content and schedule.",
  "timestamp": "2025-09-24T10:30:00Z",
  "source": "contact_form"
}
```

**Admin Authentication Data:**
```json
{
  "username": "admin_user",
  "password": "secure_password",
  "timestamp": "2025-09-24T10:30:00Z",
  "source": "admin-login",
  "action": "validate_credentials"
}
```

**Expected N8n Response for Admin Auth:**
```json
{
  "valid": true,
  "userInfo": {
    "username": "admin_user",
    "role": "admin",
    "permissions": ["dashboard", "analytics", "user_management"]
  }
}
```

## � N8n Admin Authentication Setup

**Required N8n Workflow for Admin Authentication:**

1. **Webhook Trigger**: `/admin-auth`
2. **Credential Validation Logic**: Check username/password against your secure data source
3. **Response Format**: Return JSON with `valid: true/false` and optional `userInfo`

**Sample N8n Workflow Response:**
- **Valid Login**: `{ "valid": true, "userInfo": { "username": "admin", "role": "admin" } }`
- **Invalid Login**: `{ "valid": false, "message": "Invalid credentials" }`

## �📦 Available Scripts

```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 5000)
npm run install:all      # Install all dependencies
npm run build            # Production build
```

## ✨ Complete Sales Funnel Features

### **🚀 Lead Generation & Conversion**
- **🎯 High-Converting Landing Page**: Strategic layout with social proof and urgency
- **👥 2x2 Instructor Showcase**: Professional team display building credibility
- **📋 Interactive FAQ System**: Objection handling with accordion UI (8-10 questions)
- **� Smart Lead Capture**: Role-based forms with real-time validation

### **💰 Revenue Optimization**
- **🎟️ Dynamic Coupon Engine**: Real-time validation with n8n webhook integration
- **💳 Streamlined Payment Flow**: Reduced friction checkout with clear feedback
- **💰 Dynamic Pricing Display**: Instant price updates with discount calculation
- **🔄 Conversion Analytics**: Complete tracking from lead to payment

### **⚡ Professional User Experience**
- **🍞 Advanced Toast System**: Icons, progress bars, slide-in animations
- **✅ Smart Form Validation**: Character limits (10-1000), positive UX patterns
- **📱 Mobile-First Design**: Conversion optimization across all devices
- **🎨 Professional UI**: Consistent design language with micro-interactions

## �🛠️ Tech Stack

- **Frontend**: React 18.2.0, React Router, Axios, CSS Grid & Flexbox
- **Backend**: Node.js, Express 4.18.2, express-validator, CORS, Helmet
- **Integration**: n8n webhooks for automation and coupon validation
- **UI/UX**: Toast notifications, accordion components, inline styling for reliability

## 🔧 Troubleshooting

**Port in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm run install:all
```

## 📞 Support

- Check `/health` endpoint: `http://localhost:5000/health`
- Review console logs for errors
- Ensure `.env` file is configured correctly

---

**Built with ❤️ using React and Node.js**
