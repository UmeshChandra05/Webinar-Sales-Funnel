/**
 * Backend Constants - Google Sheets Configuration
 * All Google Sheets related URLs and IDs are centralized here
 */

require('dotenv').config();

/**
 * Require environment variable - throws error if missing
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Optional default value (use only for non-sensitive defaults)
 * @returns {string} - Environment variable value
 */
const requireEnv = (key, defaultValue = null) => {
  const value = process.env[key];
  
  if (!value) {
    if (defaultValue !== null) {
      return defaultValue;
    }
    console.error(`❌ FATAL: Missing required environment variable: ${key}`);
    console.error(`   Please add ${key} to your backend/.env file`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

// Google Sheets Configuration - REQUIRED
const GOOGLE_SHEET_ID = requireEnv('GOOGLE_SHEET_ID');

// Sheet GIDs (unique identifier for each tab/sheet)
// USER_DATA defaults to '0' as it's the standard first sheet GID
const SHEET_GID = {
  USER_DATA: process.env.SHEET_GID_USER_DATA || '0',
  QUERIES: requireEnv('SHEET_GID_QUERIES'),
  ADMIN: requireEnv('SHEET_GID_ADMIN')
};

// Base URLs for Google Sheets
const GOOGLE_SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d';

/**
 * Generate CSV export URL for a specific sheet
 * @param {string} gid - Sheet GID (optional, defaults to main sheet)
 * @returns {string} - Full CSV export URL
 */
const getCSVExportURL = (gid = null) => {
  const baseUrl = `${GOOGLE_SHEETS_BASE_URL}/${GOOGLE_SHEET_ID}/export?format=csv`;
  return gid ? `${baseUrl}&gid=${gid}` : baseUrl;
};

/**
 * Generate edit URL for a specific sheet
 * @param {string} gid - Sheet GID (optional)
 * @returns {string} - Full edit URL
 */
const getSheetEditURL = (gid = null) => {
  const baseUrl = `${GOOGLE_SHEETS_BASE_URL}/${GOOGLE_SHEET_ID}/edit`;
  return gid ? `${baseUrl}#gid=${gid}` : baseUrl;
};

// Pre-configured CSV URLs for common sheets
const CSV_URLS = {
  USER_DATA: getCSVExportURL(SHEET_GID.USER_DATA),
  QUERIES: getCSVExportURL(SHEET_GID.QUERIES),
  ADMIN: getCSVExportURL(SHEET_GID.ADMIN)
};

// Pre-configured Edit URLs
const EDIT_URLS = {
  USER_DATA: getSheetEditURL(SHEET_GID.USER_DATA),
  QUERIES: getSheetEditURL(SHEET_GID.QUERIES),
  ADMIN: getSheetEditURL(SHEET_GID.ADMIN)
};

// Application Constants
const APP_CONSTANTS = {
  // UI Constants
  CURRENCY_SYMBOL: '₹',
  CURRENCY: 'INR',
  TOAST_DURATION: 4000,
  NAVIGATION_DELAY: 1500,
  
  // Default Settings
  DEFAULT_REGISTRATION_FEE: 4999,
  DEFAULT_REGISTRATION_DEADLINE: '2025-11-07',
  DEFAULT_WEBINAR_DATE: '2025-11-08',
  DEFAULT_WEBINAR_TIME: '19:00',
  DEFAULT_CONTACT_EMAIL: 'webinar@pystack.com',
  DEFAULT_WHATSAPP_LINK: 'https://wa.me/',
  DEFAULT_DISCORD_LINK: 'https://discord.gg/',
  DEFAULT_ADMIN_USERNAME: 'admin',
  
  // Webinar Features
  DEFAULT_WEBINAR_FEATURES: [
    'Complete 5-day Python Full Stack webinar',
    'Lifetime access to all recordings',
    'Downloadable code templates and projects',
    'Private WhatsApp community access',
    '1-on-1 mentorship session (30 minutes)',
    'Certificate of completion'
  ]
};

// Export all constants
module.exports = {
  // Google Sheets
  GOOGLE_SHEET_ID,
  SHEET_GID,
  CSV_URLS,
  EDIT_URLS,
  
  // Utility functions
  getCSVExportURL,
  getSheetEditURL,
  
  // App constants
  APP_CONSTANTS
};
