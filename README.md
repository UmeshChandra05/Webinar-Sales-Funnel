# 🚀 Webinar Sales Funnel App

A full-stack React + Node.js application for managing webinar registrations, payments, and lead capture with n8n webhook integration.

## 📋 Project Overview

This application handles the complete customer journey from landing page to webinar attendance:
- **Lead Capture**: Interest-based registration forms
- **Payment Processing**: Simulated payment flow ($97 webinar fee)
- **Webinar Management**: Registration and attendance tracking
- **Contact Forms**: Customer support integration
- **n8n Integration**: Automated workflow triggers

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
```

**Key Pages:**
- **Landing**: Hero section with countdown timer
- **Register**: Interest capture form (name, email, phone)
- **Payment**: $97 payment simulation
- **Success**: Payment confirmation + WhatsApp link
- **Contact**: Support form

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
```

3. **Start the application:**
```bash
npm run dev
```

Access at: `http://localhost:3000`

## 🌐 API Endpoints

| Endpoint | Purpose | n8n Webhook |
|----------|---------|-------------|
| `POST /api/capture-lead` | Lead registration | `/capture-lead` |
| `POST /api/simulate-payment` | Payment processing | `/simulate-payment` |
| `POST /api/webinar-attendance` | Attendance tracking | `/webinar-attendance` |
| `POST /api/contact` | Contact forms | `/contact-form` |
| `GET /api/webinar-info` | Webinar details | - |

## 🔧 n8n Integration

The app sends data to 4 n8n webhook endpoints:

**Lead Capture Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
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
  "amount": 97,
  "currency": "USD",
  "timestamp": "2025-09-24T10:30:00Z"
}
```

## 📦 Available Scripts

```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 5000)
npm run install:all      # Install all dependencies
npm run build            # Production build
```

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0, React Router, Axios
- **Backend**: Node.js, Express 4.18.2, CORS, Helmet
- **Integration**: n8n webhooks for automation

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
