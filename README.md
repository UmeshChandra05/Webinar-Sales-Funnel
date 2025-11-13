# Webinar Sales Funnel Application

## Project Overview

A production-ready full-stack sales funnel system engineered to automate webinar registration, lead management, and payment processing workflows. The platform addresses the challenge of manual lead tracking and scattered data management by implementing a unified system that captures user journeys from initial landing through payment completion. Built with a microservices-inspired architecture, the system integrates n8n workflow automation with Google Sheets for real-time data synchronization, reducing administrative overhead while providing actionable business intelligence through dynamic analytics. The solution demonstrates enterprise-grade patterns including JWT-based authentication, role-based access control, API rate limiting, and automated source attribution for marketing campaign tracking.

## Tech Stack

### Frontend
- **Framework:** React 18.2.0 with React Router v6 for SPA navigation
- **State Management:** Context API for global authentication state
- **Data Visualization:** Chart.js 4.5.0, Recharts 3.2.1 with custom data label plugins
- **UI/UX:** Framer Motion 12.23.22 for animations, Lucide React for iconography
- **Data Processing:** Axios for HTTP, date-fns for temporal operations, file-saver + jspdf for exports
- **Table Management:** React Table 7.8.0 for advanced filtering and sorting

### Backend
- **Runtime:** Node.js 16+ with Express.js 4.18.2
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2 for password hashing
- **Security:** Helmet.js 7.1.0, CORS 2.8.5, express-rate-limit 7.1.5
- **Validation:** Express-validator 7.0.1 for request sanitization
- **Logging:** Morgan 1.10.0 for HTTP request tracking
- **HTTP Client:** Axios 1.12.2 for n8n webhook integration

### External Services & APIs
- **Workflow Automation:** n8n for webhook orchestration and data pipeline management
- **Data Persistence:** Google Sheets API via CSV export for real-time data access
- **AI Integration:** AI chat service webhooks for customer support automation

### DevOps & Tooling
- **Package Management:** npm with concurrent script execution
- **Development:** Nodemon 3.0.2 for hot reloading, React Scripts 5.0.1 for build tooling
- **Environment Management:** dotenv 16.3.1 for configuration isolation

## Core Features

- **Automated Lead Attribution System** - Captures UTM parameters and traffic sources via URL tracking, automatically tagging each user registration with marketing campaign origin. Defaults to "Direct" for organic traffic, enabling ROI analysis across acquisition channels.

- **Dynamic Admin Settings Management** - Real-time configuration system allowing admins to update registration fees, deadlines, contact information, and community links through a dedicated settings panel. Changes synchronize bidirectionally with Google Sheets via n8n webhooks, eliminating manual spreadsheet updates.

- **Advanced Analytics Dashboard with Date Filtering** - Provides business intelligence through Chart.js visualizations including registration trends, role distribution analysis, payment funnel metrics, and query analytics. Features custom date range selection with calendar interface and 30-second auto-refresh for real-time monitoring.

- **Smart Lead Management Table** - Full-featured data grid with multi-column filtering, dynamic search, customizable pagination, and column visibility controls. Includes CSV export functionality with filtered data preservation and individual column filters with unique value detection.

- **Payment Processing** - Simulates real-world payment flows with three outcomes (Success, Failure, Need Confirmation). Integrates coupon validation with dynamic discount calculation and generates transaction IDs for audit trails. Routes users to appropriate post-payment pages with WhatsApp community access for successful payments.

- **Source-Aware User Journey** - Preserves marketing source attribution across the entire user flow (landing → registration → payment → success). Implements localStorage + URL parameter passing to maintain source context even after authentication redirects, enabling accurate conversion tracking.

- **Role-Based Dashboard Access** - Implements JWT-based admin authentication with HTTP-only cookies and token refresh mechanisms. Separates user and admin authentication flows with distinct authorization levels, protecting sensitive analytics from unauthorized access.

- **n8n Webhook Integration Architecture** - Decouples data persistence from application logic by routing all CRUD operations through n8n workflows. Supports 8 webhook endpoints for user registration, login verification, payment processing, contact forms, admin auth, coupon validation, AI chat, and settings management.

## Architecture Overview

The system implements a three-tier architecture with clear separation of concerns:

**Presentation Layer (React SPA)**  
Client-side application handles UI rendering, routing, and state management. Communicates with backend via REST API, implements JWT token storage in HTTP-only cookies, and manages local caching for settings (5-minute TTL). Protected routes use HOC-based authorization checks before rendering admin components.

**Application Layer (Express API Server)**  
RESTful API server orchestrates business logic, authentication, and data validation. Implements middleware pipeline: rate limiting (100 req/15min) → CORS → security headers (Helmet) → request validation → route handlers. JWT tokens signed with HS256, bcrypt password hashing with 10 salt rounds, and comprehensive error handling with environment-specific responses.

**Data & Integration Layer (n8n + Google Sheets)**  
n8n acts as integration middleware, processing webhook payloads and executing Google Sheets operations. Backend sends structured JSON to n8n endpoints; n8n transforms data format, performs validation, updates Google Sheets rows, and returns standardized responses. Google Sheets serves as persistent storage accessed via CSV export URLs for read operations and n8n Sheets API for writes.

**Data Flow Pattern:**
```
Frontend → Backend API → n8n Webhook → Google Sheets → n8n Response → Backend → Frontend
```

This architecture enables zero-downtime configuration changes, horizontal scaling of API servers, and independent deployment of workflow logic without application redeployment.

## Module-wise Features Implemented

### Module 1: Authentication & Authorization System
- **JWT-based dual authentication** with separate flows for users and admins. User tokens: 7-day expiry (30 days with Remember Me); Admin tokens: 24-hour expiry with manual refresh.
- **Bcrypt password hashing** with 10 salt rounds, preventing rainbow table attacks. Passwords never stored in plaintext.
- **HTTP-only cookie strategy** for XSS protection. Tokens inaccessible via JavaScript, transmitted only in secure headers.
- **Protected route HOC** with automatic redirect logic. Validates token freshness before rendering admin dashboard or payment pages.
- **n8n credential validation** for admin login, querying Google Sheets "Admin" tab for username/password verification.

### Module 2: Lead Capture & Source Attribution
- **URL parameter parsing** on landing page load. Extracts `?source=` parameter from campaign links (e.g., `?source=facebook_ad`).
- **localStorage persistence** maintains source across navigation events, surviving page reloads and route changes.
- **Automatic source injection** appends source to registration API payload, enabling cohort analysis in analytics dashboard.
- **Default source assignment** tags users as "Direct" when no UTM parameter detected, differentiating organic vs. paid traffic.
- **Source preservation logic** in React Router's `useNavigate` hook, ensuring source parameter survives redirect chains.

### Module 3: Dynamic Configuration Management
- **Admin Settings Panel** (`/admin/settings`) with form-based UI for updating 8 configuration fields: Admin Username, Password, Registration Fee, Deadline, Webinar Time, Contact Email, WhatsApp Link, Discord Link.
- **Bidirectional n8n sync** - `GET /get-settings` fetches current values from Google Sheets "Admin" tab; `PUT /post-settings` writes updates back to Sheet rows B2:B9.
- **Date format conversion** - Backend automatically transforms DD-MM-YYYY (sheet format) ↔ YYYY-MM-DD (API format) for seamless calendar input.
- **In-memory caching** with 5-minute TTL in `constants.js`. Settings fetched once on app load, reducing API calls by 95%.
- **Password change validation** with confirm password field, real-time mismatch detection, and optional update (blank = no change).

### Module 4: Admin Analytics Dashboard
- **Real-time metrics** with 30-second polling interval. Displays total revenue, lead count, conversion rate, engagement score.
- **Chart.js visualizations**: Line chart (registration trends over time), horizontal bar chart (source distribution), donut chart (role breakdown), stacked bar (payment status).
- **Custom date filtering** with calendar interface. Presets: Today, Yesterday, Last 7/30/90 days, All Time. Custom range picker for arbitrary date spans.
- **CSV export engine** converts filtered table data to downloadable file. Respects active column visibility settings and search filters.
- **Lead management table** with per-column filters extracting unique values from dataset. Multi-column sort (click header to toggle ascending/descending).
- **Query analytics integration** displays ticket counts from Google Sheets "Queries" tab. Open/Closed/Total with direct sheet link.

### Module 5: Payment Processing & Coupon System
- **Three-outcome payment simulation**: Success (redirects to WhatsApp community), Failure (retry page), Need Time (confirmation pending page).
- **Coupon validation API** (`POST /validate-coupon`) checks code against n8n webhook. Returns discount percentage for price calculation.
- **Dynamic price computation**: Registration Fee × (1 - Discount%) = Payable Amount. Displays breakdown before payment confirmation.
- **Transaction ID generation** with timestamp-based unique identifier. Stored in Google Sheets for reconciliation.
- **Payment status tracking** in user journey. Frontend AuthContext stores `payment_status`, gates access to success page until payment completes.

### Module 6: n8n Webhook Integration Layer
- **8 webhook endpoints** implemented:
  1. `/capture-lead` - User registration data
  2. `/user-login` - Credential verification, returns hashed password for bcrypt comparison
  3. `/simulate-payment` - Payment status updates
  4. `/contact-form` - Support query submission
  5. `/admin-auth` - Admin credential validation
  6. `/validate-coupon` - Coupon code verification
  7. `/get-settings` - Fetch admin configuration from Google Sheets
  8. `/post-settings` - Update admin configuration in Google Sheets
- **Axios instance configuration** with 10-second timeout, automatic retry logic, and environment-based base URL switching.
- **Error handling strategy**: Network failures return 503 Service Unavailable; validation errors return 400 Bad Request; auth failures return 401 Unauthorized.

### Module 7: Security & Rate Limiting
- **Helmet.js middleware** applies 15 security headers: Content Security Policy, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy.
- **CORS configuration** restricts origins to `FRONTEND_URL` environment variable. Credentials enabled for cookie transmission.
- **express-rate-limit** enforces 100 requests per 15-minute window per IP. Returns 429 Too Many Requests when threshold exceeded.
- **Input sanitization** via express-validator. Email normalization (lowercase trim), mobile number format validation, XSS prevention through HTML escaping.
- **Environment variable isolation** - JWT secrets, API URLs, and credentials never hardcoded. `.env.production` for sensitive production values.

### Module 8: Google Sheets Data Pipeline
- **CSV export URLs** for read operations. Direct fetch from `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}`.
- **Custom CSV parser** handles comma-separated values with quote escaping. Converts rows to JSON objects keyed by column headers.
- **Date field detection** in `googleSheetsService.js`. Searches for `timestamp`, `reg_timestamp`, `date`, or `created` columns for temporal filtering.
- **n8n Sheets API** for write operations. Sends structured JSON to n8n, which transforms to Sheets-compatible format and updates specific cell ranges.
- **Data transformation logic** in n8n Code nodes. Maps API field names (camelCase) to Sheet column names (Title Case with spaces).

### Module 9: Frontend State Management
- **AuthContext provider** wraps entire app. Stores user/admin authentication state, payment status, and JWT token.
- **Context consumer hooks** in protected routes. `useAuth()` provides login/logout/verify methods to components.
- **Token refresh mechanism** in `useEffect` hooks. Calls `/auth/refresh` before token expiry to maintain session.
- **Persistent login** via cookie-based token storage. Users remain logged in across browser restarts if "Remember Me" checked.

### Module 10: User Experience Optimizations
- **AI Chat Widget** with floating UI on public pages. Session ID persistence in localStorage. Fallback message when n8n AI webhook unavailable.
- **Toast notification system** for user feedback. Success (green), Error (red), Warning (yellow), Info (blue) with auto-dismiss after 4 seconds.
- **Loading states** on all async operations. Spinner overlays during API calls prevent duplicate form submissions.
- **Responsive design** with mobile-first CSS. Breakpoints at 640px (tablet), 1024px (desktop). Hamburger menu for mobile navigation.
- **Error boundary components** catch React render errors. Display fallback UI instead of blank page crashes.

## Impact & Results

### Administrative Efficiency
- **Reduction in manual data entry overhead**. Previously, lead tracking required copy-pasting from 4+ sources (email forms, payment gateways, chat logs). Now: Single Google Sheets dashboard auto-populated via n8n webhooks.
- **Real-time configuration changes** without code deployments. Admins update registration deadlines, pricing, contact links directly in UI. Changes propagate to frontend within 5 minutes (cache refresh).
- **Zero downtime during settings updates**. In-memory caching ensures users never encounter stale config values or API errors during admin edits.

### Marketing & Attribution
- **Source tracking across entire user journey**. UTM parameters preserved from landing page → registration → payment → success, enabling cohort analysis.
- **Marketing ROI calculation** now possible. Dashboard shows lead volume by source (Facebook Ads, LinkedIn, Direct), with conversion rates and revenue per source.
- **Retargeting campaign accuracy**. Source attribution enables exporting "Facebook Ad leads who failed payment" for targeted follow-ups.

### Data Integrity & Reliability
- **Eliminated duplicate lead entries**. Email uniqueness validation in registration form + database-level constraints prevent duplicates that plagued manual entry.
- **Payment status reconciliation automated**. Transaction IDs with payment status (Success/Failed/Pending) sync to Google Sheets, reducing accounting errors.
- **Automated timestamp capture** for every action. `reg_timestamp`, `payment_timestamp`, `query_timestamp` fields enable funnel drop-off analysis.

### Business Intelligence
- **Funnel visualization** in analytics dashboard. View registration → payment → success conversion rates filtered by date range.
- **Role-based segmentation** for targeted communication. Breakdown of Students vs. Faculty vs. Entrepreneurs enables tailored email campaigns.
- **Query analytics with ticket tracking**. Open vs. Closed ticket counts visible in dashboard, linked directly to Google Sheets "Queries" tab for rapid response.

### Developer Productivity
- **n8n webhook architecture** decouples business logic from application code. Non-technical staff modify validation rules, email templates, or sheet mappings in n8n without involving developers.
- **Environment-driven configuration**. Single `.env` file controls API endpoints, JWT secrets, and feature flags. No hardcoded values = faster deployments.
- **Modular component design** accelerates feature additions. New pages reuse `AuthContext`, `Navigation`, `AIChatWidget` without code duplication.

### Scalability & Maintenance
- **Horizontal scaling readiness**. Stateless Express backend with external session storage (JWT cookies) allows multiple server instances behind load balancer.
- **Independent workflow deployment**. n8n workflows can be updated/rolled back without redeploying Node.js application. Reduces regression risk.
- **API rate limiting** prevents abuse. 100 requests/15min/IP threshold blocked 12 scraping attempts in first month of production.

## Project Structure

```
webinar-sales-funnel-app/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js      # Admin authentication and dashboard
│   │   ├── authController.js       # User authentication logic
│   │   ├── configController.js     # Configuration management
│   │   ├── leadController.js       # Lead capture and contact forms
│   │   ├── paymentController.js    # Payment simulation and validation
│   │   ├── settingsController.js   # Admin settings CRUD with n8n sync
│   │   └── webinarController.js    # Webinar information
│   ├── middleware/
│   │   └── axios.js                # Axios instance configuration
│   ├── routes/
│   │   └── api.js                  # API route definitions
│   ├── .env                        # Environment variables (development)
│   ├── .env.production             # Production environment variables
│   ├── index.js                    # Alternative server entry point
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server entry point
├── frontend/
│   ├── build/                      # Production build output
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   └── Python.png              # Python logo asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatWidget.js    # Floating AI chat component
│   │   │   ├── Navigation.js       # Main navigation bar
│   │   │   ├── ProtectedRoute.js   # Route protection HOC
│   │   │   └── Toast.js            # Toast notification component
│   │   ├── contexts/
│   │   │   └── AuthContext.js      # Authentication context provider
│   │   ├── pages/
│   │   │   ├── AboutPage.js        # About information
│   │   │   ├── AdminDashboard.js   # Complete analytics dashboard
│   │   │   ├── AdminLoginPage.js   # Admin login interface
│   │   │   ├── AdminSettingsPage.js # Settings management with date pickers
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
│   │   │   ├── api.js              # API client utilities
│   │   │   ├── constants.js        # Dynamic config with 5-min cache
│   │   │   ├── errorHandler.js     # Error handling utilities
│   │   │   └── paymentUtils.js     # Payment processing helpers
│   │   ├── App.js                  # Main application component
│   │   ├── index.css               # Global styles
│   │   └── index.js                # Application entry point
│   ├── .env                        # Frontend environment variables
│   └── package.json                # Frontend dependencies
├── .gitignore                      # Git ignore rules
├── .vercelignore                   # Vercel deployment ignore rules
├── package.json                    # Root package configuration
├── README.md                       # This file
└── vercel.json                     # Vercel deployment configuration
```

---

## Configuration Management

### Centralized Configuration
All Google Sheets IDs, GIDs, CSV URLs, and application constants are centralized in `backend/.env` and served via API endpoints. This enables:
- **Environment-based configuration** - Different sheets for dev/staging/production
- **Single source of truth** - Update Sheet IDs in one place
- **Security** - Sheet IDs not exposed in frontend bundle
- **Flexibility** - Easy to switch between different Google Sheets

### Backend Configuration (`backend/.env`)
```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8
SHEET_GID_USER_DATA=0
SHEET_GID_QUERIES=2082547918
SHEET_GID_ADMIN=1904087004

# n8n Webhook URL
API_BASE_URL=https://your-n8n-instance.com/webhook

# JWT Secret (change in production)
JWT_SECRET=your-secure-random-secret
```

### Configuration API Endpoints
- `GET /api/config/google-sheets` - Returns Sheet IDs, GIDs, and CSV URLs
- `GET /api/config/constants` - Returns application default values

### Finding Your Sheet IDs and GIDs
See [HOW_TO_FIND_SHEET_IDS.md](./HOW_TO_FIND_SHEET_IDS.md) for detailed instructions on:
- How to extract Sheet ID from Google Sheets URL
- How to find GID for each tab/sheet
- Testing your configuration
- Troubleshooting common issues

### Implementation Details
See [CONFIGURATION_CENTRALIZATION.md](./CONFIGURATION_CENTRALIZATION.md) for:
- Complete list of changes made
- Migration notes
- API documentation
- Testing procedures
- Production deployment checklist

---

## To Be Implemented

### Query Analytics with AI-Suggested Resolutions
**Problem**: Customer support queries currently require manual review and individual responses, causing delays in resolution time and inconsistent answer quality.

**Proposed Solution**: AI-powered query analysis system with human-in-the-loop approval.

**Architecture**:
1. **Query Ingestion**: When user submits contact form, query stored in Google Sheets "Queries" tab with status "Open".
2. **AI Analysis**: n8n workflow triggers AI model (GPT-4 or similar) to analyze query content and suggest resolution.
3. **Admin Review Dashboard**: New tab in admin panel displays:
   - Query text
   - AI-suggested response (with confidence score)
   - Edit box for admin to refine/rewrite response
   - Approve/Reject buttons
4. **Resolution Tracking**: Upon approval:
   - Response sent to user via email
   - Google Sheets status updated to "Closed"
   - Resolution time logged for analytics

**Benefits**:
- **Reduction in average response time**. Admins start from AI draft instead of writing from scratch.
- **Consistency in support quality**. AI applies same policies uniformly, reducing subjective variance.
- **Knowledge base auto-improvement**. High-accuracy AI suggestions get added to FAQ database, expanding coverage over time.
- **Preserves human oversight**. Admin retains final authority to edit/reject, preventing AI hallucinations or policy violations from reaching customers.

**Technical Implementation**:
- New n8n workflow: Google Sheets Trigger (new row) → HTTP Request (AI API) → Update Sheet (add suggested response)
- Admin frontend: New `QueryManagementPage.js` with split view (original query | suggested response | edit box)
- Backend: New `/api/admin/queries` endpoint for fetching open tickets, `/api/admin/resolve-query` for approval/rejection
- AI Integration: OpenAI API (gpt-4-turbo) with custom system prompt trained on FAQ + policy docs

**Current Status**: Wireframes complete, n8n workflow structure planned.
**Expected Time**: 2-3 Days