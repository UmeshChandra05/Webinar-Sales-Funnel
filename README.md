# Webinar Sales Funnel Application

A comprehensive full-stack webinar registration and sales funnel platform designed for managing Python Full Stack Development webinars. Built with React and Node.js, featuring advanced analytics, payment processing, and lead management capabilities.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This application provides a complete sales funnel solution for webinar management, from initial lead capture through payment processing to post-purchase engagement. The system integrates with external services for data persistence, payment validation, and AI-powered customer support.

### Key Capabilities

- Multi-stage user registration and authentication system
- Dynamic payment processing with coupon code validation
- Real-time analytics dashboard with data visualization
- AI-powered chat support for user queries
- Integration with Google Sheets for data management
- Comprehensive admin panel for business intelligence
- Role-based access control and secure authentication

## Architecture

### System Components

**Frontend Application**
- Single Page Application (SPA) built with React 18
- Responsive UI with mobile-first design
- Client-side routing with React Router v6
- Context-based state management for authentication
- Real-time data synchronization

**Backend Services**
- RESTful API server built with Express.js
- JWT-based authentication and authorization
- Rate limiting and security middleware
- Integration layer for external services (n8n webhooks)
- Comprehensive error handling and logging

**External Integrations**
- n8n workflow automation for data processing
- Google Sheets for data persistence and analytics
- Third-party payment validation services
- AI chat services for customer support

## Features

### User-Facing Features

#### 1. Landing Page
- Dynamic countdown timer to webinar date
- Feature showcase with course curriculum
- Responsive design optimized for all devices
- Call-to-action buttons for registration

#### 2. User Registration System
- Multi-field registration form with validation
- Email uniqueness verification
- Mobile number collection
- Role-based user classification (Student, Faculty, Entrepreneur, Industry Professional)
- Remember Me functionality for persistent sessions
- Duplicate email detection with user-friendly error messages

#### 3. User Authentication
- Secure login with JWT tokens
- Session persistence with HTTP-only cookies
- Automatic token refresh for extended sessions
- Password validation and security
- Account verification workflow
- Logout functionality with session cleanup

#### 4. Payment Processing
- Simulated payment flow with multiple outcomes (Success, Failed, Need Time to Confirm)
- Real-time coupon code validation
- Dynamic price calculation based on discounts
- Transaction ID generation and tracking
- Payment status notifications
- Integration with backend validation services

#### 5. Post-Payment Experience
- Success page with WhatsApp community group access
- Failed payment page with retry options
- Thank you page for confirmed participants
- Status tracking and confirmation emails

#### 6. AI Chat Support
- Floating chat widget on all public pages
- Context-aware responses
- Session management
- Integration with AI processing backend
- Fallback responses for service unavailability
- Professional error handling with alternative support options

#### 7. Contact Management
- Contact form with validation
- Message submission tracking
- Integration with ticketing system
- Status updates and follow-ups

### Admin Features

#### 1. Admin Dashboard
- Comprehensive analytics overview
- Real-time data synchronization (30-second refresh)
- Date range filtering with calendar interface
- Custom date range selection
- Multiple visualization charts

#### 2. Key Performance Metrics
- Total revenue tracking with date filtering
- Lead count and conversion rates
- Payment success/pending/failed statistics
- Engagement metrics
- Sales funnel visualization

#### 3. Data Visualization
- Registration trend analysis (line charts)
- Lead source distribution (horizontal bar charts)
- Role distribution analysis (donut charts)
- Payment statistics with visual indicators
- Query analytics with ticket tracking

#### 4. Lead Management Table
- Advanced search and filtering
- Multi-column sorting
- Pagination with customizable page size
- Column visibility controls
- Individual column filters with unique value detection
- Status indicators with color coding
- Export to CSV functionality

#### 5. Advanced Analytics
- Date range comparison
- Hourly breakdown for single-day analysis
- Monthly trends for all-time view
- Source tracking and attribution
- Role-based segmentation
- Payment status tracking

#### 6. Query Analytics
- Open ticket tracking
- Closed ticket monitoring
- Total query count
- Visual ticket status distribution
- Direct link to Google Sheets ticket management

#### 7. Data Management
- Direct Google Sheets integration
- Real-time CSV export
- Filtered data export based on current view
- Column selection for custom exports

### Security Features

#### 1. Authentication Security
- JWT token-based authentication
- HTTP-only secure cookies
- Token expiration and refresh mechanism
- Bcrypt password hashing
- Session management

#### 2. API Security
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Request validation with express-validator
- SQL injection prevention
- XSS protection

#### 3. Data Security
- Input sanitization
- Email normalization
- Mobile number validation
- Environment variable isolation
- Secure credential management

### Integration Features

#### 1. n8n Webhook Integration
- Lead capture webhook
- Payment processing webhook
- Contact form submission
- User registration verification
- Login authentication
- Admin authentication
- Coupon validation
- AI chat processing

#### 2. Google Sheets Integration
- Real-time data fetching via CSV export
- Lead data synchronization
- Contact form submissions tracking
- Admin dashboard data source
- Automated data parsing and processing

## Technology Stack

### Frontend Technologies

**Core Framework**
- React 18.2.0 - UI library
- React Router DOM 6.20.1 - Client-side routing
- React Context API - State management

**Data Visualization**
- Chart.js 4.5.0 - Charting library
- React-Chartjs-2 5.3.0 - React wrapper for Chart.js
- Recharts 3.2.1 - Alternative charting solution
- chartjs-plugin-datalabels 2.2.0 - Data label plugin

**UI Components**
- Framer Motion 12.23.22 - Animation library
- Lucide React 0.294.0 - Icon library
- React Table 7.8.0 - Table component

**Utilities**
- Axios 1.6.2 - HTTP client
- date-fns 4.1.0 - Date manipulation
- file-saver 2.0.5 - File download utility
- jspdf 3.0.3 - PDF generation
- xlsx 0.18.5 - Excel file handling

**Google Services**
- googleapis 161.0.0 - Google Sheets API integration

### Backend Technologies

**Core Framework**
- Node.js 16+ - Runtime environment
- Express 4.18.2 - Web framework
- Nodemon 3.0.2 - Development server

**Security**
- Helmet 7.1.0 - Security headers
- CORS 2.8.5 - Cross-origin resource sharing
- Express-rate-limit 7.1.5 - Rate limiting
- bcryptjs 3.0.2 - Password hashing
- jsonwebtoken 9.0.2 - JWT authentication
- cookie-parser 1.4.7 - Cookie handling

**Validation**
- Express-validator 7.0.1 - Request validation

**Utilities**
- Axios 1.12.2 - HTTP client
- dotenv 16.3.1 - Environment variable management
- Morgan 1.10.0 - HTTP request logger

### Development Tools

- Concurrently 8.2.2 - Run multiple commands
- React Scripts 5.0.1 - Create React App tooling

## Project Structure

```
webinar-sales-funnel-app/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js      # Admin authentication and dashboard
│   │   ├── authController.js       # User authentication logic
│   │   ├── leadController.js       # Lead capture and contact forms
│   │   ├── paymentController.js    # Payment simulation and validation
│   │   └── webinarController.js    # Webinar information
│   ├── middleware/
│   │   └── axios.js                # Axios instance configuration
│   ├── routes/
│   │   └── api.js                  # API route definitions
│   ├── .env                        # Environment variables (development)
│   ├── .env.production             # Production environment variables
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server entry point
├── frontend/
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   └── Python.png              # Python logo asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatWidget.js    # Floating AI chat component
│   │   │   └── Navigation.js       # Main navigation bar
│   │   ├── contexts/
│   │   │   └── AuthContext.js      # Authentication context provider
│   │   ├── pages/
│   │   │   ├── AboutPage.js        # About information
│   │   │   ├── AdminDashboard.js   # Complete analytics dashboard
│   │   │   ├── AdminLoginPage.js   # Admin login interface
│   │   │   ├── ContactPage.js      # Contact form
│   │   │   ├── LandingPage.js      # Main landing page
│   │   │   ├── LoginPage.js        # User login
│   │   │   ├── NotFoundPage.js     # 404 error page
│   │   │   ├── PaymentFailedPage.js # Failed payment handling
│   │   │   ├── PaymentPage.js      # Payment processing interface
│   │   │   ├── PaymentSuccessPage.js # Success confirmation
│   │   │   ├── RegisterPage.js     # User registration
│   │   │   └── ThankYouPage.js     # Post-registration thank you
│   │   ├── services/
│   │   │   └── googleSheetsService.js # Google Sheets integration
│   │   ├── utils/
│   │   │   └── api.js              # API client utilities
│   │   ├── App.js                  # Main application component
│   │   ├── index.css               # Global styles
│   │   └── index.js                # Application entry point
│   ├── package.json                # Frontend dependencies
│   └── README.md                   # Frontend-specific documentation
├── .gitignore                      # Git ignore rules
├── package.json                    # Root package configuration
└── README.md                       # This file
```

## Installation

### Prerequisites

- Node.js v16.0.0 or higher
- npm v7.0.0 or higher
- Git

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webinar-sales-funnel-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This command installs dependencies for root, backend, and frontend simultaneously.

3. **Configure environment variables**
   
   **Backend Configuration** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:3000
   
   # n8n Webhook Base URL
   API_BASE_URL=https://your-n8n-instance.com/webhook
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Frontend Configuration** (`frontend/.env`):
   ```env
   REACT_APP_API_URL=/api
   ```

4. **Verify Installation**
   ```bash
   # Check backend
   cd backend && npm list
   
   # Check frontend
   cd ../frontend && npm list
   ```

## Configuration

### Backend Configuration

The backend uses environment variables for configuration. Key configurations include:

**Server Settings**
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

**Security Settings**
- `JWT_SECRET`: Secret key for JWT token signing
- `RATE_LIMIT_WINDOW_MS`: Rate limit time window
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

**Integration Settings**
- `API_BASE_URL`: n8n webhook base URL for external integrations

### Frontend Configuration

The frontend proxies API requests to the backend during development via the `proxy` setting in `package.json`.

**Production Configuration**
- Update `REACT_APP_API_URL` to point to production backend
- Configure build output directory
- Set up proper CORS headers

### Google Sheets Integration

The admin dashboard reads data from Google Sheets:
- Sheet ID is configured in `frontend/src/services/googleSheetsService.js`
- Public CSV export URL is used for data fetching
- No authentication required for public sheets
- Update `SHEET_ID` constant for different sheets

## Usage

### Development Mode

**Start both servers concurrently:**
```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

**Start servers individually:**
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Production Mode

**Build all components:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

### Accessing the Application

**Public Routes:**
- `/` - Landing page
- `/register` - User registration
- `/login` - User login
- `/payment` - Payment processing
- `/about` - About page
- `/contact` - Contact form

**Protected Routes:**
- `/payment-success` - Post-payment success page
- `/payment-failed` - Payment failure page
- `/thank-you` - Registration confirmation

**Admin Routes:**
- `/admin` - Admin login
- `/admin/dashboard` - Analytics dashboard (requires admin authentication)

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Public Endpoints

#### Health Check
```
GET /health
Response: { status: "OK", timestamp: "ISO-8601", uptime: number }
```

#### Capture Lead
```
POST /api/capture-lead
Body: {
  name: string (2-100 chars),
  email: string (valid email),
  mobile: string (optional, valid mobile),
  role: string (1-50 chars),
  source: string (optional)
}
Response: { success: boolean, message: string, data: { id: string, timestamp: string } }
```

#### Simulate Payment
```
POST /api/simulate-payment
Body: {
  email: string (valid email),
  status: "success" | "failed" | "need_time_to_confirm",
  transaction_id: string (optional),
  couponCode: string (optional),
  discount: number (optional, 0-100)
}
Response: { success: boolean, message: string, data: { transaction_id, status, timestamp, whatsapp_link } }
```

#### Validate Coupon
```
POST /api/validate-coupon
Body: {
  couponCode: string (1-20 chars),
  email: string (valid email)
}
Response: { success: boolean, message: string, discount: number, couponCode: string }
```

#### Get Webinar Info
```
GET /api/webinar-info
Response: {
  success: boolean,
  data: {
    title: string,
    date: string (ISO-8601),
    duration: string,
    instructor: string,
    topics: string[],
    timezone: string,
    registration_count: number
  }
}
```

#### Contact Form
```
POST /api/contact
Body: {
  name: string (2-100 chars),
  email: string (valid email),
  message: string (10-1000 chars)
}
Response: { success: boolean, message: string }
```

#### AI Chat
```
POST /api/ai-chat
Body: {
  message: string (1-1000 chars),
  sessionId: string (optional),
  userId: string (optional)
}
Response: { success: boolean, response: string, sessionId: string, timestamp: string }
```

### User Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  name: string (2-100 chars),
  email: string (valid email),
  password: string (min 6 chars),
  mobile: string (optional, valid mobile),
  role: string (optional)
}
Response: { success: boolean, message: string, token: string, user: object }
```

#### Login User
```
POST /api/auth/login
Body: {
  email: string (valid email),
  password: string,
  rememberMe: boolean (optional)
}
Response: { success: boolean, message: string, token: string, user: object }
```

#### Verify Token
```
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, message: string, user: object }
```

#### Refresh Token
```
POST /api/auth/refresh
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, message: string, token: string, user: object }
```

#### Logout User
```
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, message: string }
```

### Admin Endpoints

#### Admin Login
```
POST /api/admin/login
Body: {
  username: string,
  password: string
}
Response: { success: boolean, message: string, token: string, user: object }
```

#### Get Dashboard Data
```
GET /api/admin/dashboard
Headers: { Authorization: "Bearer <admin-token>" }
Response: { success: boolean, data: { stats, recentActivity, lastUpdated } }
```

#### Refresh Admin Token
```
POST /api/admin/refresh-token
Headers: { Authorization: "Bearer <admin-token>" }
Response: { success: boolean, message: string, token: string }
```

### Rate Limiting

All `/api/*` endpoints are rate-limited to:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables
- Returns 429 status code when limit exceeded

### Error Responses

Standard error response format:
```json
{
  "error": "Error message",
  "details": [] 
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Security

### Authentication Mechanisms

**JWT Tokens**
- Signed with HS256 algorithm
- 24-hour expiration for admin tokens
- 7-day expiration for user tokens (30 days with Remember Me)
- Stored in HTTP-only cookies for enhanced security

**Password Security**
- Bcrypt hashing with 10 salt rounds
- Minimum password length: 6 characters
- Password validation on registration

### Security Headers

Implemented via Helmet.js:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security (HSTS)

### Input Validation

- Express-validator for request validation
- Email normalization and sanitization
- Mobile number format validation
- SQL injection prevention
- XSS protection through input sanitization

### CORS Configuration

- Restricted origin (configurable via environment)
- Credentials support enabled
- Pre-flight request handling

## Deployment

### Production Build

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure environment:**
   - Set `NODE_ENV=production` in backend
   - Update `API_BASE_URL` to production n8n instance
   - Configure `FRONTEND_URL` for CORS
   - Set strong `JWT_SECRET`

3. **Deploy backend:**
   - Use process manager (PM2, Forever)
   - Configure reverse proxy (Nginx)
   - Set up SSL/TLS certificates
   - Enable HTTPS

4. **Deploy frontend:**
   - Serve `build` directory via static server
   - Configure CDN (optional)
   - Enable gzip compression

### Environment-Specific Configuration

**Development:**
- Hot reloading enabled
- Detailed error messages
- Morgan logging in dev mode
- CORS origin: `http://localhost:3000`

**Production:**
- Minified builds
- Generic error messages
- Production logging
- CORS restricted to production domain
- Rate limiting enforced

### Recommended Infrastructure

**Backend:**
- Node.js hosting (Heroku, AWS, DigitalOcean)
- Reverse proxy (Nginx)
- SSL termination
- Process monitoring (PM2)

**Frontend:**
- Static hosting (Netlify, Vercel, AWS S3)
- CDN integration
- Automatic deployments

**Database/Storage:**
- Google Sheets for data persistence
- n8n for workflow automation
- Redis for session storage (optional)

## Contributing

This is a proprietary company project. Internal contributions should follow:

1. Create feature branch from `main`
2. Implement changes with comprehensive tests
3. Update documentation
4. Submit pull request for review
5. Ensure CI/CD pipeline passes

### Code Standards

- ESLint configuration for consistent code style
- Prettier for code formatting
- Meaningful commit messages
- Component and function documentation
- Error handling best practices

**Document Version:** 1.0.0  
**Last Updated:** October 18, 2025  
**Maintained By:** Development Team