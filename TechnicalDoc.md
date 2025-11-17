# Webinar Sales Funnel Application – Technical Documentation

## Overview
The Webinar Sales Funnel Application is a full-stack, production-ready platform for managing webinar registrations, payments, lead tracking, and admin operations. It is built with a modular architecture using React (frontend), Node.js/Express (backend), and integrates with Google Sheets and n8n for workflow automation. The system is designed for scalability, security, and maintainability, supporting both user and admin roles with robust authentication and data management.

---

## Architecture
- **Frontend:** React (SPA), Context API for state management, React Router for navigation, modular component structure.
- **Backend:** Node.js with Express, RESTful API, modular controllers, middleware, and configuration.
- **Automation:** n8n workflows for all CRUD operations, Google Sheets as the primary data store.
- **Authentication:** JWT-based, with secure password hashing (bcrypt), HTTP-only cookies (optional), and localStorage for session persistence.
- **Deployment:** Environment variable-driven configuration, ready for cloud or on-premise deployment.

---

## Module-wise Feature Breakdown

### 1. **Frontend (React)**

#### **A. Pages & Routing**
- **LandingPage.js:** Webinar overview, countdown timer, dynamic settings fetch, responsive design.
- **RegisterPage.js:** User registration form, validation, source tracking, instant authentication, navigation to payment.
- **LoginPage.js:** User login, JWT handling, error feedback, session persistence.
- **PaymentPage.js:** Payment simulation, coupon validation, dynamic pricing, feature list, real-time feedback.
- **PaymentSuccessPage.js / PaymentFailedPage.js / ThankYouPage.js:** Post-payment user flows, navigation, and feedback.
- **AdminLoginPage.js:** Admin authentication, token management.
- **AdminDashboard.js:** Analytics, funnel visualization, lead management, query approval modal, CSV export, advanced filtering.
- **AdminSettingsPage.js:** Settings CRUD, password management, validation, force refresh from backend.
- **Other Pages:** About, Contact, NotFound, QueryDetails (for admin query review).

#### **B. Components**
- **Navigation.js:** Dynamic navbar, user/admin menu, protected links.
- **ProtectedRoute.js:** Route guard for user/admin, token validation, loading state.
- **Toast.js:** Global notification system for all actions.
- **AIChatWidget.js:** (Optional) AI-powered chat for user queries.

#### **C. Context & Services**
- **AuthContext.js:** Global auth state, login/logout, session refresh, user/payment status update.
- **constantsService.js:** Centralized settings/constants fetch, caching, and accessors.
- **googleSheetsService.js:** API for Google Sheets data fetch (admin analytics, contacts).
- **api.js:** API client abstraction for backend calls.
- **errorHandler.js:** Centralized error formatting and logging.
- **paymentUtils.js:** Payment status helpers, logging, and UI logic.

#### **D. Utilities**
- **Form validation:** Regex and custom logic for all user/admin forms.
- **Loading & error states:** Consistent UI feedback for all async operations.
- **Responsive design:** CSS modules and inline styles for mobile/desktop support.

---

### 2. **Backend (Node.js/Express)**

#### **A. Controllers**
- **authController.js:**
  - User registration (bcrypt, JWT, n8n webhook for lead capture)
  - User login (JWT, session validation)
  - Token refresh, logout, and verification
- **paymentController.js:**
  - Simulate payment (success, need time, failure)
  - Coupon validation (discount calculation, n8n webhook)
- **settingsController.js:**
  - Fetch/update settings (Google Sheets via n8n)
  - Fallback to default constants if n8n data missing
- **leadController.js:**
  - Capture leads, handle contact forms, manage AI chat and query responses
- **adminController.js:**
  - Admin login, dashboard analytics, protected settings update
- **configController.js:**
  - Expose Google Sheets and app constants to frontend

#### **B. Middleware**
- **axios.js:** Custom axios instance with interceptors for logging and error handling.
- **Validation:** Express-validator for all API endpoints (registration, login, payment, settings, etc).

#### **C. Routes**
- **api.js:**
  - All REST endpoints for auth, payment, settings, admin, contact, AI chat, etc.
  - Route-level validation and controller mapping.

#### **D. Config & Constants**
- **constants.js:**
  - Centralized app constants (currency, deadlines, webinar features, etc).
  - Google Sheets IDs, URLs, and environment variable management.
- **.env:**
  - All sensitive and environment-specific configuration (API keys, webhook URLs, etc).

---

### 3. **Automation & Data Layer**

#### **A. n8n Workflows**
- **WebinarSalesFunnel_Workflow.json:**
  - All CRUD operations (leads, payments, settings) automated via n8n webhooks.
  - Google Sheets as the primary data store for all business data.
  - Error handling and logging for all webhook calls.

#### **B. Google Sheets**
- **Data Storage:**
  - Leads, payments, admin settings, and queries stored in separate sheets/tabs.
  - Sheet GIDs and URLs managed via backend constants.

---

## Security & Best Practices
- **Authentication:** JWT for all protected routes, HTTP-only cookies (optional), session refresh.
- **Password Storage:** bcrypt hashing for all user/admin passwords.
- **Input Validation:** Both frontend and backend validation for all forms and API endpoints.
- **Error Handling:** Centralized error logging, user-friendly messages, and fallback mechanisms.
- **Environment Management:** All secrets and environment-specific values in `.env` files.
- **Modularity:** Separation of concerns in both frontend and backend for maintainability.

---

## Deployment & Operations
- **Environment Setup:**
  - Configure `.env` files for backend and frontend.
  - Set up Google Sheets and n8n workflows as per documentation.
- **Build & Start:**
  - Use `npm run dev` for development, production build commands for deployment.
- **Monitoring:**
  - Console logs, toast notifications, and n8n error handling for operational visibility.

---

## Summary
This technical documentation provides a complete, module-wise breakdown of the Webinar Sales Funnel Application. The system is designed for extensibility, security, and ease of maintenance, and is ready for production deployment in real-world webinar sales scenarios.
