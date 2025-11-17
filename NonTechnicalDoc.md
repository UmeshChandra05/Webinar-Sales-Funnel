# Webinar Sales Funnel Application

## Overview

The Webinar Sales Funnel Application is a comprehensive, production-ready platform designed to manage, automate, and optimize the entire lifecycle of a webinar sales funnel. It streamlines user registration, payment processing, lead management, admin operations, and post-webinar engagement, providing a seamless experience for both attendees and administrators. The system integrates with Google Sheets and n8n for robust data management and workflow automation, ensuring reliability and scalability for real-world deployments.

---

## Modules & Features

### 1. **Frontend (User & Admin Portal)**

#### **A. User-Facing Features**
- **Landing Page**
  - Webinar overview, countdown timer, and call-to-action.
  - Dynamic display of webinar date, time, and registration deadline.
  - Responsive design for all devices.
- **Registration**
  - Secure user registration form with validation.
  - Source tracking for marketing attribution.
  - Instant authentication and navigation to payment after registration.
- **Login & Authentication**
  - Secure login for users and admins.
  - JWT-based authentication with session persistence.
  - Protected routes for payment and admin pages.
- **Payment Page**
  - Displays webinar fee, discounts, and coupon code application.
  - Simulated payment options for demo/testing.
  - "Webinar Includes" section listing all benefits.
  - Real-time feedback and error handling.
- **Post-Payment Flows**
  - Success, failure, and "need time" confirmation pages.
  - Automatic redirects and user guidance.
- **User Experience**
  - Toast notifications for all actions (success, error, info).
  - Loading indicators and smooth navigation.
  - Modern, accessible UI with clear calls to action.

#### **B. Admin-Facing Features**
- **Admin Login**
  - Secure admin authentication with token validation.
- **Dashboard**
  - Real-time analytics: revenue, leads, conversion rates, engagement.
  - Funnel visualization and advanced filtering.
  - Downloadable CSV reports.
  - Pending queries management with approval workflow.
  - Toast notifications for all admin actions.
- **Settings Management**
  - Update webinar details, fees, deadlines, and contact info.
  - Optional WhatsApp and Discord links.
  - Password change and admin credential management.
  - Instant feedback on save and error states.

---

### 2. **Backend (API & Automation)**

#### **A. API Server**
- **User Management**
  - Registration, login, JWT issuance, and session validation.
  - Secure password hashing (bcrypt).
- **Payment Processing**
  - Simulated payment endpoint for demo/testing.
  - Coupon validation and discount calculation.
- **Settings API**
  - Fetch and update webinar settings (integrated with Google Sheets via n8n).
- **Lead & Query Management**
  - Capture leads, handle contact forms, and manage user queries.
  - AI chat integration for automated responses.
- **Admin Operations**
  - Admin login, dashboard data, and protected settings update.
- **Configuration**
  - Centralized constants and environment-based configuration.
  - Secure handling of sensitive data via .env files.

#### **B. n8n Integration**
- **Workflow Automation**
  - All CRUD operations (leads, payments, settings) routed through n8n webhooks.
  - Google Sheets as the primary data store for leads, payments, and settings.
  - Robust error handling and logging for all webhook calls.

---

### 3. **Data & Security**
- **Data Storage**
  - Google Sheets for all user, payment, and admin data.
  - LocalStorage for client-side session persistence.
- **Security**
  - JWT authentication for all protected routes.
  - HTTP-only cookies for sensitive tokens (optional).
  - Input validation on both frontend and backend.
  - Secure password storage and admin credential management.

---

## Deployment & Operations
- **Production-Ready**
  - Environment variable support for all sensitive and environment-specific settings.
  - Modular codebase for easy maintenance and scaling.
  - Comprehensive error handling and user feedback throughout the application.
- **How to Deploy**
  - Configure all required environment variables in `.env` files (backend and frontend).
  - Set up Google Sheets and n8n workflows as per documentation.
  - Start backend and frontend servers using `npm run dev` or production build commands.
  - Access the application via the configured domain or localhost.

---

## Summary
This application is designed for non-technical users to easily manage and operate a webinar sales funnel with minimal setup. All features are accessible via a modern web interface, and the system is robustly integrated with Google Sheets and n8n for automation and data management. No technical expertise is required for day-to-day operations after initial deployment.

For further details or support, refer to the in-app help sections or contact the development team.
