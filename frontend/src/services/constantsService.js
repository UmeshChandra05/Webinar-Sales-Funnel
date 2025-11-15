/**
 * Constants Service - Fetches all constants from backend
 * All constants are now stored securely in the backend
 */

// In-memory cache for constants
let cachedConstants = null;
let cachedSettings = null;
let lastConstantsFetch = null;
let lastSettingsFetch = null;
let pendingConstantsRequest = null;
let pendingSettingsRequest = null;

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

    // Deduplicate simultaneous requests
    if (pendingConstantsRequest) {
      console.log('⏳ Waiting for pending constants request...');
      return pendingConstantsRequest;
    }

    console.log('🔄 Fetching constants from backend...');
    pendingConstantsRequest = (async () => {
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

    throw new Error('Failed to fetch constants from server');
    })();

    const result = await pendingConstantsRequest;
    pendingConstantsRequest = null;
    return result;
  } catch (error) {
    console.error('❌ Error fetching constants:', error);
    pendingConstantsRequest = null;
    throw error;
  }
};

/**
 * Fetch dynamic settings from backend
 */
const fetchSettings = async () => {
  try {
    // Check cache - no expiration, cache forever until manually refreshed
    if (cachedSettings && lastSettingsFetch) {
      console.log('📋 Using cached settings (loaded at app startup)');
      return cachedSettings;
    }

    // Deduplicate simultaneous requests
    if (pendingSettingsRequest) {
      console.log('⏳ Waiting for pending settings request...');
      return pendingSettingsRequest;
    }

    console.log('🔄 Fetching settings from backend...');
    pendingSettingsRequest = (async () => {
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
        console.log('✅ Settings fetched and cached');
        return cachedSettings;
      }
    }

    throw new Error('Failed to fetch settings from server');
    })();

    const result = await pendingSettingsRequest;
    pendingSettingsRequest = null;
    return result;
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    pendingSettingsRequest = null;
    throw error;
  }
};

/**
 * Fallback constants for UI-only values that don't depend on backend data
 * Data constants must come from API or throw errors
 */
const getFallbackConstants = () => ({
  // UI constants only - these don't require backend configuration
  CURRENCY_SYMBOL: '₹',
  CURRENCY: 'INR',
  TOAST_DURATION: 4000,
  NAVIGATION_DELAY: 1500
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
 * @param {boolean} forceRefresh - If true, bypasses cache and fetches fresh data (admin use only)
 */
export const getSettings = async (forceRefresh = false) => {
  if (forceRefresh) {
    console.log('🔄 Force refreshing settings (admin update)...');
    return await refreshSettings();
  }
  // Return cached settings if available, otherwise fetch
  if (cachedSettings) {
    return cachedSettings;
  }
  return await fetchSettings();
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
 * Returns cached value or fallback for UI constants only
 * Throws error for missing data constants to ensure API issues are visible
 */
export const getConstant = (key) => {
  if (cachedConstants) {
    return cachedConstants[key];
  }
  // Only allow fallback for UI constants
  const fallback = getFallbackConstants();
  if (key in fallback) {
    return fallback[key];
  }
  // For data constants, throw error instead of silently using defaults
  throw new Error(`Constant '${key}' not loaded. Ensure getConstants() is called before accessing data constants.`);
};

/**
 * Get a specific setting value synchronously
 * Returns cached value or undefined if not loaded
 */
export const getSetting = (key) => {
  return cachedSettings ? cachedSettings[key] : undefined;
};

// Export commonly used values as named exports for convenience
// UI constants - safe to use with fallbacks
export const CURRENCY_SYMBOL = () => getConstant('CURRENCY_SYMBOL');
export const CURRENCY = () => getConstant('CURRENCY');
export const TOAST_DURATION = () => getConstant('TOAST_DURATION');
export const NAVIGATION_DELAY = () => getConstant('NAVIGATION_DELAY');

// Data constants - must come from API, throw errors if missing
export const REGISTRATION_FEE = () => {
  const value = getSetting('registrationFee');
  if (value === undefined) {
    throw new Error('Registration fee not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const REGISTRATION_DEADLINE = () => {
  const value = getSetting('registrationDeadline');
  if (value === undefined) {
    throw new Error('Registration deadline not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const WEBINAR_DATE = () => {
  const value = getSetting('webinarDate');
  if (value === undefined) {
    throw new Error('Webinar date not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const WEBINAR_TIME = () => {
  const value = getSetting('webinarTime');
  if (value === undefined) {
    throw new Error('Webinar time not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const CONTACT_EMAIL = () => {
  const value = getSetting('contactEmail');
  if (value === undefined) {
    throw new Error('Contact email not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const WHATSAPP_LINK = () => {
  const value = getSetting('whatsappLink');
  if (value === undefined) {
    throw new Error('WhatsApp link not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const DISCORD_LINK = () => {
  const value = getSetting('discordLink');
  if (value === undefined) {
    throw new Error('Discord link not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};
export const WEBINAR_FEATURES = () => {
  const value = getSetting('webinarFeatures');
  if (value === undefined) {
    throw new Error('Webinar features not loaded. Ensure getSettings() is called before accessing this value.');
  }
  return value;
};

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
  REGISTRATION_FEE,
  REGISTRATION_DEADLINE,
  WEBINAR_DATE,
  WEBINAR_TIME,
  CONTACT_EMAIL,
  WHATSAPP_LINK,
  DISCORD_LINK,
  WEBINAR_FEATURES
};
