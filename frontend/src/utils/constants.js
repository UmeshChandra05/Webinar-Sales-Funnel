/**
 * Application-wide constants
 * Dynamic settings are fetched from backend/Google Sheets
 */

// Static UI constants (never change)
export const CURRENCY_SYMBOL = '₹';
export const TOAST_DURATION = 4000;
export const NAVIGATION_DELAY = 1500;

// Default values (fallback if API fails)
const DEFAULT_SETTINGS = {
  coursePrice: 4999,
  registrationDeadline: '2025-11-07',
  webinarTime: '2025-11-08',
  contactEmail: 'webinar@pystack.com',
  whatsappLink: 'https://wa.me/',
  discordLink: 'https://discord.gg/',
  adminUsername: 'admin',
  courseFeatures: [
    'Complete 5-day Python Full Stack course',
    'Lifetime access to all recordings',
    'Downloadable code templates and projects',
    'Private WhatsApp community access',
    '1-on-1 mentorship session (30 minutes)',
    'Certificate of completion'
  ]
};

// In-memory cache for settings
let cachedSettings = { ...DEFAULT_SETTINGS };
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch settings from backend/Google Sheets
 */
export const fetchSettings = async () => {
  try {
    // Check if cache is still valid
    if (lastFetchTime && Date.now() - lastFetchTime < CACHE_DURATION) {
      console.log('📋 Using cached settings');
      return cachedSettings;
    }

    console.log('🔄 Fetching fresh settings from backend...');
    const response = await fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.settings) {
        cachedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
        lastFetchTime = Date.now();
        console.log('✅ Settings fetched successfully:', cachedSettings);
        return cachedSettings;
      }
    }

    console.warn('⚠️ Failed to fetch settings, using defaults');
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Get current settings (from cache or fetch if needed)
 */
export const getSettings = async () => {
  if (!lastFetchTime) {
    return await fetchSettings();
  }
  return cachedSettings;
};

/**
 * Force refresh settings (bypass cache)
 */
export const refreshSettings = async () => {
  lastFetchTime = null;
  return await fetchSettings();
};

/**
 * Get setting value synchronously (returns cached or default)
 */
export const getSetting = (key) => {
  return cachedSettings[key] || DEFAULT_SETTINGS[key];
};

// Export commonly used settings as getters
export const COURSE_PRICE = () => getSetting('coursePrice');
export const REGISTRATION_DEADLINE = () => getSetting('registrationDeadline');
export const WEBINAR_TIME = () => getSetting('webinarTime');
export const CONTACT_EMAIL = () => getSetting('contactEmail');
export const WHATSAPP_LINK = () => getSetting('whatsappLink');
export const DISCORD_LINK = () => getSetting('discordLink');
export const COURSE_FEATURES = () => getSetting('courseFeatures');

// Initialize settings on module load
fetchSettings();
