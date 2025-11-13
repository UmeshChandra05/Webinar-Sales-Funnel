/**
 * Configuration Controller
 * Serves application configuration and constants to frontend
 */

const { CSV_URLS, EDIT_URLS, GOOGLE_SHEET_ID, SHEET_GID, APP_CONSTANTS } = require('../config/constants');

/**
 * Get Google Sheets configuration
 * Returns CSV URLs and sheet information for frontend consumption
 */
exports.getGoogleSheetsConfig = (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        sheetId: GOOGLE_SHEET_ID,
        csvUrls: CSV_URLS,
        editUrls: EDIT_URLS,
        gids: SHEET_GID
      }
    });
  } catch (error) {
    console.error('Error fetching Google Sheets config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration'
    });
  }
};

/**
 * Get application constants
 * Returns default values and app-wide constants
 */
exports.getAppConstants = (req, res) => {
  try {
    res.json({
      success: true,
      constants: {
        // UI Constants
        CURRENCY_SYMBOL: APP_CONSTANTS.CURRENCY_SYMBOL,
        CURRENCY: APP_CONSTANTS.CURRENCY,
        TOAST_DURATION: APP_CONSTANTS.TOAST_DURATION,
        NAVIGATION_DELAY: APP_CONSTANTS.NAVIGATION_DELAY,
        
        // Default Settings
        DEFAULT_COURSE_PRICE: APP_CONSTANTS.DEFAULT_COURSE_PRICE,
        DEFAULT_REGISTRATION_DEADLINE: APP_CONSTANTS.DEFAULT_REGISTRATION_DEADLINE,
        DEFAULT_WEBINAR_TIME: APP_CONSTANTS.DEFAULT_WEBINAR_TIME,
        DEFAULT_CONTACT_EMAIL: APP_CONSTANTS.DEFAULT_CONTACT_EMAIL,
        DEFAULT_WHATSAPP_LINK: APP_CONSTANTS.DEFAULT_WHATSAPP_LINK,
        DEFAULT_DISCORD_LINK: APP_CONSTANTS.DEFAULT_DISCORD_LINK,
        DEFAULT_ADMIN_USERNAME: APP_CONSTANTS.DEFAULT_ADMIN_USERNAME,
        DEFAULT_COURSE_FEATURES: APP_CONSTANTS.DEFAULT_COURSE_FEATURES
      }
    });
  } catch (error) {
    console.error('Error fetching app constants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch constants'
    });
  }
};

module.exports = exports;
