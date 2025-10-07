# 📊 Admin Dashboard - Live Data Integration

## ✅ Implemented Features

### 🔄 **Auto-Refresh System**
- ✨ **Automatic data refresh every 30 seconds**
- 📡 Fetches data from Google Sheets CSV export
- ⏱️ Shows last updated timestamp in header
- 🔄 Manual refresh button available

### 📈 **Real-Time Data Display**

#### **Overall Performance Panel**
- 💰 **Total Revenue** - Sum of all successful payments (₹)
- 👥 **Total Leads** - Count of all entries in spreadsheet
- 📊 **Conversion Rate** - (Paid / Total Leads) × 100%
- 🎯 **Engagement** - (Completed / Registered) × 100%

#### **Role Distribution Panel**
- 🥧 Donut chart showing total leads
- 📋 Breakdown by role (from 'role' or 'Role' column)
- 🎨 Color-coded visualization

#### **Payment Stats Panel**
- ✅ **Successful Payments** - Green segment
- ⏳ **Pending Payments** - Yellow segment
- ❌ **Failed Payments** - Red segment
- 📊 Horizontal bar visualization with counts

#### **Webinar Sales Funnel**
- 📍 **Stage 1: Leads** - Total leads (75% width)
- 📍 **Stage 2: Registered** - Those who registered (66% width)
- 📍 **Stage 3: Paid** - Successful payments (50% width)
- 📍 **Stage 4: Completed** - Finished webinar (33% width)

### 📥 **Export Functionality**
- 💾 Export all dashboard metrics to CSV
- 📅 Filename includes current date
- 📊 Includes all key metrics and funnel data

## 🔗 **Data Source**

**Google Sheets URL:**
```
https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/edit
```

**CSV Export URL:**
```
https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/export?format=csv
```

## 📋 **Expected CSV Columns**

The service automatically maps these column names (case-insensitive):

### Required Columns:
- `role` or `Role` - User's role/category
- `paymentStatus` or `Payment Status` - Values: success/successful/completed, pending, failed/failure
- `price` or `Price` - Payment amount (numeric)
- `registered` or `Registered` - Values: yes/1/true for registered users
- `completed` or `Completed` or `webinarCompleted` - Values: yes/1/true for completed webinar

### Example CSV Structure:
```csv
name,email,role,paymentStatus,price,registered,completed
John Doe,john@example.com,Student,success,499,yes,yes
Jane Smith,jane@example.com,Professional,pending,999,yes,no
Bob Wilson,bob@example.com,Business,failed,1499,yes,no
```

## 🎨 **UI Features**

### Loading States:
- 🌀 Full-screen loading overlay during data fetch
- ⏳ Spinner animation with loading message

### Error Handling:
- ⚠️ Error notifications displayed in top-right corner
- 🔴 Red alert box for connection/data issues
- 🔄 Automatic retry on next refresh cycle

### Responsive Design:
- 📱 Two-column grid layout
- 🎴 Card-based sections with proper spacing
- 🎨 Dark theme with CSS variables
- ✨ Smooth transitions and animations

## 🚀 **How It Works**

1. **Initial Load**: Dashboard fetches data immediately on mount
2. **Auto-Refresh**: Every 30 seconds, data is refreshed automatically
3. **CSV Parsing**: Fetches CSV from Google Sheets, parses rows and columns
4. **Data Processing**: Calculates all metrics, distributions, and funnel stages
5. **UI Update**: React state updates trigger re-render with new data
6. **Timestamp**: Shows when data was last updated

## 🛠️ **Technical Details**

### Files Modified:
- ✅ `frontend/src/pages/AdminDashboard.js` - Main dashboard component
- ✅ `frontend/src/services/googleSheetsService.js` - Data fetching service

### Dependencies Used:
- React hooks: `useState`, `useEffect`
- Fetch API for HTTP requests
- CSV parsing with custom parser
- Blob API for CSV export

### Performance:
- ⚡ Efficient CSV parsing
- 🎯 Minimal re-renders
- 📦 Small bundle size (no extra libraries)
- 🔄 Cleanup of intervals on unmount

## 🔧 **Configuration**

To change refresh interval, edit line in `AdminDashboard.js`:
```javascript
const interval = setInterval(() => {
  loadData();
}, 30000); // Change 30000 to desired milliseconds
```

To change Google Sheet ID, edit `googleSheetsService.js`:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
```

## 📊 **Data Flow**

```
Google Sheets → CSV Export → Fetch API → Parse CSV → Process Data → Calculate Metrics → Update UI
                                                                              ↓
                                                                      Auto-refresh every 30s
```

---

**Status**: ✅ Fully Functional
**Last Updated**: October 7, 2025
