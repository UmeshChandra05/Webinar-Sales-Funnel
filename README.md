# 🚀 Webinar Sales Funnel App

A comprehensive full-stack application built with React frontend and Node.js backend for managing webinar sales funnels. This application provides a complete solution for webinar registration, payment processing, and lead management with n8n webhook integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🔍 Overview

The Webinar Sales Funnel App is designed to handle the complete customer journey from landing page to webinar attendance. It includes lead capture, payment processing simulation, webinar registration, and attendance tracking with seamless integration to external systems via webhooks.

### Key Capabilities
- **Lead Management**: Capture and process leads from various sources
- **Payment Processing**: Simulate payment flows with success/failure handling
- **Webinar Registration**: Complete registration system with countdown timers
- **Attendance Tracking**: Monitor and record webinar attendance
- **Contact Forms**: Handle customer inquiries and support requests
- **Webhook Integration**: Ready for n8n or other automation tools

## ✨ Features

### Frontend Features
- 🎨 **Modern UI/UX**: Clean, responsive design with gradient effects
- ⏱️ **Real-time Countdown**: Dynamic countdown timer for webinar start
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🛣️ **Client-side Routing**: Smooth navigation with React Router
- 💾 **Local Storage**: Persistent user data across sessions
- 🔔 **Error Handling**: Comprehensive error handling with user feedback
- 🎯 **Lead Capture Forms**: Multi-step registration process
- 💳 **Payment Simulation**: Mock payment processing interface

### Backend Features
- 🔐 **Security**: Helmet.js security headers and CORS protection
- 🚦 **Rate Limiting**: Configurable request rate limiting
- ✅ **Input Validation**: Comprehensive request validation with express-validator
- 📊 **Logging**: Morgan HTTP request logging
- 🌐 **Webhook Integration**: n8n webhook support for external automation
- 🏥 **Health Monitoring**: Health check endpoints for monitoring
- 🔄 **Graceful Error Handling**: Structured error responses
- 📈 **Performance Monitoring**: Request timing and monitoring

## 🛠 Tech Stack

### Frontend
- **React 18.2.0**: Modern React with hooks and functional components
- **React Router DOM 6.20.1**: Client-side routing
- **Axios 1.6.2**: HTTP client for API communication
- **Lucide React 0.294.0**: Modern icon library
- **CSS3**: Custom styling with gradients and animations

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
- **CORS 2.8.5**: Cross-origin resource sharing
- **Helmet 7.1.0**: Security middleware
- **Morgan 1.10.0**: HTTP request logger
- **Express Rate Limit 7.1.5**: Rate limiting middleware
- **Express Validator 7.0.1**: Input validation and sanitization
- **Axios**: HTTP client for external API calls
- **dotenv 16.3.1**: Environment variable management

### Development Tools
- **Nodemon 3.0.2**: Development server auto-restart
- **Concurrently 8.2.2**: Run multiple npm scripts simultaneously
- **React Scripts 5.0.1**: Create React App build tools

## 📁 Project Structure

\`\`\`
Webinar-Sales-Funnel-App/
├── 📦 package.json                    # Root package.json with scripts
├── 📖 README.md                       # This documentation file
├── 🎯 frontend/                       # React frontend application
│   ├── 📦 package.json               # Frontend dependencies
│   ├── 🌐 public/
│   │   └── 📄 index.html             # Main HTML template
│   └── 📂 src/
│       ├── 🚀 App.js                 # Main App component with routing
│       ├── 🎯 index.js               # React DOM entry point
│       ├── 🎨 index.css              # Global styles and CSS variables
│       ├── 🧩 components/
│       │   └── Navigation.js         # Navigation bar component
│       ├── 📄 pages/
│       │   ├── LandingPage.js        # Main landing page with countdown
│       │   ├── RegisterPage.js       # User registration form
│       │   ├── PaymentPage.js        # Payment processing interface
│       │   ├── PaymentSuccessPage.js # Payment success confirmation
│       │   ├── PaymentFailedPage.js  # Payment failure handling
│       │   ├── ThankYouPage.js       # Post-registration thank you
│       │   ├── AboutPage.js          # About the webinar
│       │   ├── ContactPage.js        # Contact form
│       │   └── NotFoundPage.js       # 404 error page
│       └── 🔧 utils/
│           └── api.js                # API client and utility functions
└── 🖥️ backend/                        # Node.js Express backend
    ├── 📦 package.json               # Backend dependencies
    ├── 🚀 server.js                  # Main server file with middleware
    ├── 🎮 controllers/
    │   ├── leadController.js         # Lead capture and contact form logic
    │   ├── paymentController.js      # Payment simulation logic
    │   └── webinarController.js      # Webinar info and attendance logic
    ├── 🛡️ middleware/
    │   └── axios.js                  # Configured axios instance
    └── 🛣️ routes/
        └── api.js                    # API routes with validation
\`\`\`

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 16.0.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: \`node --version\`
- **npm**: Usually comes with Node.js
  - Verify installation: \`npm --version\`
- **Git**: For version control (optional but recommended)
  - Download from [git-scm.com](https://git-scm.com/)

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 500MB free space
- **Network**: Internet connection for package installation

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project
\`\`\`powershell
# If using Git
git clone <your-repository-url>
cd Webinar-Sales-Funnel-App

# Or download and extract the ZIP file
\`\`\`

### Step 2: Install All Dependencies
\`\`\`powershell
# Install dependencies for root, frontend, and backend in one command
npm run install:all
\`\`\`

This command will:
1. Install root dependencies (\`concurrently\`)
2. Install backend dependencies (Express, CORS, etc.)
3. Install frontend dependencies (React, React Router, etc.)

### Step 3: Set Up Environment Variables
Create a \`.env\` file in the \`backend\` directory:

\`\`\`powershell
cd backend
# Create .env file (Windows PowerShell)
New-Item -ItemType File -Name ".env"
# Or use: touch .env (on macOS/Linux)
\`\`\`

Add the following environment variables to \`backend/.env\`:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External API Integration (Optional)
# Set this to your n8n webhook URL or leave as default
API_BASE_URL=API_URL

# Additional Configuration (Optional)
LOG_LEVEL=debug
\`\`\`

### Step 4: Verify Installation
\`\`\`powershell
# Return to root directory
cd ..

# Check if all packages are installed correctly
npm list --depth=0
cd frontend; npm list --depth=0
cd ../backend; npm list --depth=0
cd ..
\`\`\`

## 🏃‍♂️ Running the Application

### Development Mode (Recommended for Development)

1. **Start both frontend and backend simultaneously:**
   \`\`\`powershell
   npm run dev
   \`\`\`

   This will start:
   - Backend server on \`http://localhost:5000\`
   - Frontend development server on \`http://localhost:3000\`
   - Automatic reload on code changes

2. **Access the application:**
   - Open your browser and navigate to \`http://localhost:3000\`
   - The frontend will automatically proxy API requests to the backend

### Alternative: Start Services Individually

1. **Start Backend Only:**
   \`\`\`powershell
   npm run dev:backend
   # Or manually:
   cd backend; npm run dev
   \`\`\`

2. **Start Frontend Only (in a new terminal):**
   \`\`\`powershell
   npm run dev:frontend
   # Or manually:
   cd frontend; npm start
   \`\`\`

### Production Mode

1. **Build the application:**
   \`\`\`powershell
   npm run build
   \`\`\`

2. **Start production server:**
   \`\`\`powershell
   npm start
   \`\`\`

## 🌐 API Endpoints

### Base URL
- **Development**: \`http://localhost:5000/api\`
- **Production**: \`https://yourdomain.com/api\`

### Available Endpoints

#### 🏥 Health Check
\`\`\`http
GET /health
\`\`\`
Returns server status, uptime, and timestamp.

#### 👤 Lead Management
\`\`\`http
POST /api/capture-lead
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "website"
}
\`\`\`

#### 💳 Payment Simulation
\`\`\`http
POST /api/simulate-payment
Content-Type: application/json

{
  "email": "john@example.com",
  "status": "success",
  "transaction_id": "txn_123456789"
}
\`\`\`

#### 📊 Webinar Management
\`\`\`http
# Get webinar information
GET /api/webinar-info

# Record attendance
POST /api/webinar-attendance
Content-Type: application/json

{
  "email": "john@example.com",
  "attended": true
}
\`\`\`

#### 📧 Contact Form
\`\`\`http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about the webinar."
}
\`\`\`

## 🖥️ Frontend Pages

### Page Flow
\`\`\`
Landing Page → Register Page → Payment Page → Success/Failed Page → Thank You Page
     ↓
About Page ← → Contact Page
\`\`\`

### Page Descriptions

1. **🏠 Landing Page (\`/\`)**
   - Hero section with webinar countdown timer
   - Feature overview: Python basics, Flask backend, React frontend, API integration, deployment
   - Call-to-action buttons for registration
   - Real-time countdown to webinar start date (7 days from current date)

2. **📝 Register Page (\`/register\`)**
   - User registration form (name, email, phone)
   - Form validation and error handling
   - Lead capture integration via API
   - Redirect to payment page on successful registration

3. **💳 Payment Page (\`/payment\`)**
   - Payment simulation interface with success/failure scenarios
   - Transaction ID generation
   - WhatsApp group link for successful payments ($97 USD)

4. **✅ Payment Success Page (\`/payment-success\`)**
   - Payment confirmation with transaction details
   - WhatsApp group access link
   - Next steps for webinar access

5. **❌ Payment Failed Page (\`/payment-failed\`)**
   - Payment failure notification with retry options
   - Support contact information

6. **🎉 Thank You Page (\`/thank-you\`)**
   - Registration confirmation
   - Webinar details and preparation information

7. **ℹ️ About Page (\`/about\`)**
   - Detailed webinar curriculum and instructor information
   - Learning outcomes and FAQ section

8. **📞 Contact Page (\`/contact\`)**
   - Contact form with validation
   - Support information and business hours

9. **🚫 404 Not Found Page (\`/*\`)**
   - Custom 404 error page with navigation

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| \`PORT\` | Server port number | \`5000\` | No |
| \`NODE_ENV\` | Environment mode | \`development\` | No |
| \`FRONTEND_URL\` | Frontend URL for CORS | \`http://localhost:3000\` | No |
| \`RATE_LIMIT_WINDOW_MS\` | Rate limit window (ms) | \`900000\` | No |
| \`RATE_LIMIT_MAX_REQUESTS\` | Max requests per window | \`100\` | No |
| \`API_BASE_URL\` | External webhook URL (n8n) | \`API_URL\` | No |

### Setting Up n8n Integration

1. Set up your n8n instance
2. Create webhook endpoints in n8n
3. Update \`API_BASE_URL\` in backend \`.env\`:
   \`\`\`env
   API_BASE_URL=https://your-n8n-instance.com/webhook
   \`\`\`

Expected n8n webhook endpoints:
- \`/capture-lead\` - Lead capture data
- \`/simulate-payment\` - Payment notifications
- \`/webinar-attendance\` - Attendance tracking
- \`/contact-form\` - Contact submissions

## 💻 Development

### Common Development Tasks

\`\`\`powershell
# Install new frontend dependency
cd frontend; npm install package-name

# Install new backend dependency  
cd backend; npm install package-name

# Clean install (remove node_modules and reinstall)
Remove-Item -Recurse -Force node_modules, package-lock.json; npm run install:all
\`\`\`

### Debugging

**Frontend**: Check browser console and React DevTools
**Backend**: Monitor terminal logs with \`LOG_LEVEL=debug\`

## 🚀 Production Deployment

### Build Process
\`\`\`powershell
npm run build
\`\`\`

### Environment Setup
\`\`\`env
NODE_ENV=production
PORT=80
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://your-n8n-instance.com/webhook
\`\`\`

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use (Windows)
\`\`\`powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
\`\`\`

#### CORS Errors
Check \`FRONTEND_URL\` in backend \`.env\` matches frontend origin

#### Module Not Found
\`\`\`powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm run install:all
\`\`\`

#### API Connection Issues
\`\`\`powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:5000/health"
\`\`\`

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: \`git checkout -b feature/your-feature-name\`
3. Make changes and test thoroughly
4. Commit: \`git commit -m "Add: Your feature description"\`
5. Push and create pull request

### Testing Checklist
- [ ] All pages load without errors
- [ ] Forms validate and submit correctly
- [ ] API endpoints respond properly
- [ ] Responsive design works on all devices
- [ ] Cross-browser compatibility

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](#api-endpoints)
3. Test backend health at \`http://localhost:5000/health\`
4. Create issue with detailed error information

**Built with ❤️ using React and Node.js**
