/**
 * Constants Service - Fetches all constants from backend
 * All constants are now stored securely in the backend
 */

// In-memory cache for constants
let cachedConstants = null;
let cachedSettings = null;
let lastConstantsFetch = null;
let lastSettingsFetch = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch UI constants from backend
 */
const fetchConstants = async () => {
  try {
    // Check cache
    if (lastConstantsFetch && Date.now() - lastConstantsFetch < CACHE_DURATION) {
      console.log('📋 Using cached constants');
      return cachedConstants;
    }

    console.log('🔄 Fetching constants from backend...');
    const response = await fetch('/api/config/constants', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.constants) {
        cachedConstants = data.constants;
        lastConstantsFetch = Date.now();
        console.log('✅ Constants fetched successfully');
        return cachedConstants;
      }
    }

    console.warn('⚠️ Failed to fetch constants, using fallback');
    return getFallbackConstants();
  } catch (error) {
    console.error('❌ Error fetching constants:', error);
    return getFallbackConstants();
  }
};

/**
 * Fetch dynamic settings from backend
 */
const fetchSettings = async () => {
  try {
    // Check cache
    if (lastSettingsFetch && Date.now() - lastSettingsFetch < CACHE_DURATION) {
      console.log('📋 Using cached settings');
      return cachedSettings;
    }

    console.log('🔄 Fetching settings from backend...');
    const response = await fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.settings) {
        cachedSettings = data.settings;
        lastSettingsFetch = Date.now();
        console.log('✅ Settings fetched successfully');
        return cachedSettings;
      }
    }

    console.warn('⚠️ Failed to fetch settings, using defaults from constants');
    const constants = await getConstants();
    return {
      coursePrice: constants.DEFAULT_COURSE_PRICE,
      registrationDeadline: constants.DEFAULT_REGISTRATION_DEADLINE,
      webinarTime: constants.DEFAULT_WEBINAR_TIME,
      contactEmail: constants.DEFAULT_CONTACT_EMAIL,
      whatsappLink: constants.DEFAULT_WHATSAPP_LINK,
      discordLink: constants.DEFAULT_DISCORD_LINK,
      courseFeatures: constants.DEFAULT_COURSE_FEATURES
    };
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    const constants = await getConstants();
    return {
      coursePrice: constants.DEFAULT_COURSE_PRICE,
      registrationDeadline: constants.DEFAULT_REGISTRATION_DEADLINE,
      webinarTime: constants.DEFAULT_WEBINAR_TIME,
      contactEmail: constants.DEFAULT_CONTACT_EMAIL,
      whatsappLink: constants.DEFAULT_WHATSAPP_LINK,
      discordLink: constants.DEFAULT_DISCORD_LINK,
      courseFeatures: constants.DEFAULT_COURSE_FEATURES
    };
  }
};

/**
 * Fallback constants (used only if backend is completely unavailable)
 */
const getFallbackConstants = () => ({
  CURRENCY_SYMBOL: '₹',
  CURRENCY: 'INR',
  TOAST_DURATION: 4000,
  NAVIGATION_DELAY: 1500,
  DEFAULT_COURSE_PRICE: 4999,
  DEFAULT_REGISTRATION_DEADLINE: '2025-11-07',
  DEFAULT_WEBINAR_TIME: '2025-11-08T19:00',
  DEFAULT_CONTACT_EMAIL: 'webinar@pystack.com',
  DEFAULT_WHATSAPP_LINK: 'https://wa.me/',
  DEFAULT_DISCORD_LINK: 'https://discord.gg/',
  DEFAULT_ADMIN_USERNAME: 'admin',
  DEFAULT_COURSE_FEATURES: [
    'Complete 5-day Python Full Stack course',
    'Lifetime access to all recordings',
    'Downloadable code templates and projects',
    'Private WhatsApp community access',
    '1-on-1 mentorship session (30 minutes)',
    'Certificate of completion'
  ]
});

/**
 * Get constants (from cache or fetch if needed)
 */
export const getConstants = async () => {
  if (!cachedConstants) {
    return await fetchConstants();
  }
  return cachedConstants;
};

/**
 * Get settings (from cache or fetch if needed)
 */
export const getSettings = async () => {
  if (!cachedSettings) {
    return await fetchSettings();
  }
  return cachedSettings;
};

/**
 * Force refresh constants
 */
export const refreshConstants = async () => {
  lastConstantsFetch = null;
  return await fetchConstants();
};

/**
 * Force refresh settings
 */
export const refreshSettings = async () => {
  lastSettingsFetch = null;
  return await fetchSettings();
};

/**
 * Get a specific constant value synchronously
 * Returns cached value or fallback if not loaded
 */
export const getConstant = (key) => {
  if (cachedConstants) {
    return cachedConstants[key];
  }
  const fallback = getFallbackConstants();
  return fallback[key];
};

/**
 * Get a specific setting value synchronously
 * Returns cached value or undefined if not loaded
 */
export const getSetting = (key) => {
  return cachedSettings ? cachedSettings[key] : undefined;
};

// Initialize on module load
fetchConstants();
fetchSettings();

// Export commonly used values as named exports for convenience
export const CURRENCY_SYMBOL = () => getConstant('CURRENCY_SYMBOL');
export const CURRENCY = () => getConstant('CURRENCY');
export const TOAST_DURATION = () => getConstant('TOAST_DURATION');
export const NAVIGATION_DELAY = () => getConstant('NAVIGATION_DELAY');
export const COURSE_PRICE = () => getSetting('coursePrice') || getConstant('DEFAULT_COURSE_PRICE');
export const REGISTRATION_DEADLINE = () => getSetting('registrationDeadline') || getConstant('DEFAULT_REGISTRATION_DEADLINE');
export const WEBINAR_TIME = () => getSetting('webinarTime') || getConstant('DEFAULT_WEBINAR_TIME');
export const CONTACT_EMAIL = () => getSetting('contactEmail') || getConstant('DEFAULT_CONTACT_EMAIL');
export const WHATSAPP_LINK = () => getSetting('whatsappLink') || getConstant('DEFAULT_WHATSAPP_LINK');
export const DISCORD_LINK = () => getSetting('discordLink') || getConstant('DEFAULT_DISCORD_LINK');
export const COURSE_FEATURES = () => getSetting('courseFeatures') || getConstant('DEFAULT_COURSE_FEATURES');

export default {
  getConstants,
  getSettings,
  refreshConstants,
  refreshSettings,
  getConstant,
  getSetting,
  CURRENCY_SYMBOL,
  CURRENCY,
  TOAST_DURATION,
  NAVIGATION_DELAY,
  COURSE_PRICE,
  REGISTRATION_DEADLINE,
  WEBINAR_TIME,
  CONTACT_EMAIL,
  WHATSAPP_LINK,
  DISCORD_LINK,
  COURSE_FEATURES
};
