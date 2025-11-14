const axios = require("../middleware/axios");
const { APP_CONSTANTS } = require("../config/constants");

// n8n webhook URLs
const API_BASE_URL = process.env.API_BASE_URL;
const N8N_GET_SETTINGS_WEBHOOK = process.env.N8N_GET_SETTINGS_WEBHOOK || `${API_BASE_URL}/get-settings`;
const N8N_UPDATE_SETTINGS_WEBHOOK = process.env.N8N_UPDATE_SETTINGS_WEBHOOK || (API_BASE_URL ? `${API_BASE_URL}` : null);

// Helper function to convert DD-MM-YYYY to YYYY-MM-DD
const convertDateFormat = (dateStr) => {
  if (!dateStr) return null;
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // DD-MM-YYYY to YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Get admin settings from n8n webhook
exports.getSettings = async (req, res) => {
  try {
    console.log('Fetching admin settings from n8n webhook...');
    console.log('n8n webhook URL:', N8N_GET_SETTINGS_WEBHOOK);
    
    if (!API_BASE_URL || API_BASE_URL === "API_URL") {
      console.log('⚠️ API_BASE_URL not configured, using default settings');
      return res.json({
        success: true,
        settings: {
          adminUsername: APP_CONSTANTS.DEFAULT_ADMIN_USERNAME,
          // adminPassword: Intentionally excluded from public API for security
          coursePrice: APP_CONSTANTS.DEFAULT_COURSE_PRICE,
          registrationDeadline: APP_CONSTANTS.DEFAULT_REGISTRATION_DEADLINE,
          webinarTime: APP_CONSTANTS.DEFAULT_WEBINAR_TIME,
          contactEmail: APP_CONSTANTS.DEFAULT_CONTACT_EMAIL,
          whatsappLink: APP_CONSTANTS.DEFAULT_WHATSAPP_LINK,
          discordLink: APP_CONSTANTS.DEFAULT_DISCORD_LINK
        },
        message: 'Using default settings - n8n not configured'
      });
    }
    
    // Fetch settings from n8n webhook
    const response = await axios.post(N8N_GET_SETTINGS_WEBHOOK, {
      action: "get_settings"
    }, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    console.log('✅ n8n response received');
    
    if (response.data) {
      // n8n should return data in format matching Google Sheets Admin tab:
      // {
      //   "Admin Username": "admin",
      //   "Admin Password": "admin",
      //   "Registration Fee": 4999,
      //   "Registration Deadline": "7-11-2025",  // DD-MM-YYYY format
      //   "Webinar Time": "8-11-2025",  // DD-MM-YYYY format
      //   "Contact Email": "webinar@pystack.com",
      //   "Whatsapp Invite Link": "http://www.google.com/",
      //   "Discord Community Link": "http://www.discord.com/"
      // }
      
      const rawData = response.data;
      
      // Convert to our API format
      // Note: adminPassword is intentionally excluded from public API for security
      const settings = {
        adminUsername: rawData['Admin Username'] || APP_CONSTANTS.DEFAULT_ADMIN_USERNAME,
        coursePrice: parseFloat(rawData['Registration Fee']) || APP_CONSTANTS.DEFAULT_COURSE_PRICE,
        registrationDeadline: convertDateFormat(rawData['Registration Deadline']) || APP_CONSTANTS.DEFAULT_REGISTRATION_DEADLINE,
        webinarTime: convertDateFormat(rawData['Webinar Time']) 
          ? `${convertDateFormat(rawData['Webinar Time'])}T19:00` 
          : APP_CONSTANTS.DEFAULT_WEBINAR_TIME,
        contactEmail: rawData['Contact Email'] || APP_CONSTANTS.DEFAULT_CONTACT_EMAIL,
        whatsappLink: rawData['Whatsapp Invite Link'] || APP_CONSTANTS.DEFAULT_WHATSAPP_LINK,
        discordLink: rawData['Discord Community Link'] || APP_CONSTANTS.DEFAULT_DISCORD_LINK
      };
      
      console.log('✅ Parsed settings:', settings);
      
      res.json({
        success: true,
        settings: settings
      });
    } else {
      throw new Error('No data received from n8n webhook');
    }
  } catch (error) {
    console.error("❌ Error fetching settings from n8n:", error.message);
    
    // Return default settings on error
    // Note: adminPassword is intentionally excluded from public API for security
    res.json({
      success: true,
      settings: {
        adminUsername: APP_CONSTANTS.DEFAULT_ADMIN_USERNAME,
        coursePrice: APP_CONSTANTS.DEFAULT_COURSE_PRICE,
        registrationDeadline: APP_CONSTANTS.DEFAULT_REGISTRATION_DEADLINE,
        webinarTime: APP_CONSTANTS.DEFAULT_WEBINAR_TIME,
        contactEmail: APP_CONSTANTS.DEFAULT_CONTACT_EMAIL,
        whatsappLink: APP_CONSTANTS.DEFAULT_WHATSAPP_LINK,
        discordLink: APP_CONSTANTS.DEFAULT_DISCORD_LINK
      },
      message: 'Using default settings due to n8n error: ' + error.message
    });
  }
};

// Update admin settings to Google Sheets via n8n
exports.updateSettings = async (req, res) => {
  try {
    const {
      adminUsername,
      adminPassword,
      coursePrice,
      registrationDeadline,
      webinarTime,
      contactEmail,
      whatsappLink,
      discordLink
    } = req.body;

    // Validate required fields (password is optional)
    if (!adminUsername || !coursePrice || !registrationDeadline || 
        !webinarTime || !contactEmail || !whatsappLink || !discordLink) {
      return res.status(400).json({
        success: false,
        message: "All fields except password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate URLs
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(whatsappLink) || !urlRegex.test(discordLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format for links"
      });
    }

    // Validate course price
    if (isNaN(coursePrice) || coursePrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Course price must be a positive number"
      });
    }

    // Validate registration deadline is before webinar time
    const deadlineDate = new Date(registrationDeadline);
    const webinarDate = new Date(webinarTime);
    
    if (deadlineDate >= webinarDate) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline must be before webinar time"
      });
    }

    // Convert dates to DD-MM-YYYY format for Google Sheets
    const formatDateForSheet = (dateStr) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Build data object for n8n webhook in the format expected by Google Sheets
    const sheetData = {
      "Admin Username": adminUsername,
      "Registration Fee": Number(coursePrice),
      "Registration Deadline": formatDateForSheet(registrationDeadline),
      "Webinar Time": formatDateForSheet(webinarTime),
      "Contact Email": contactEmail,
      "Whatsapp Invite Link": whatsappLink,
      "Discord Community Link": discordLink
    };

    // Only include password if it's provided (not empty)
    if (adminPassword && adminPassword.trim().length > 0) {
      sheetData["Admin Password"] = adminPassword;
    }

    // Send update to n8n webhook which will write to Google Sheets "Admin" tab
    console.log('Sending settings update to n8n webhook...');
    
    if (!N8N_UPDATE_SETTINGS_WEBHOOK) {
      console.error('❌ N8N_UPDATE_SETTINGS_WEBHOOK not configured');
      return res.status(503).json({
        success: false,
        message: "Settings update service not configured. Please contact administrator."
      });
    }
    
    const response = await axios.post(`${N8N_UPDATE_SETTINGS_WEBHOOK}/post-settings`, {
      sheet: "Admin",
      action: "update_settings",
      data: sheetData
    });

    console.log('Settings updated successfully in Google Sheets');

    res.json({
      success: true,
      message: "Settings updated successfully in Google Sheets",
      settings: {
        adminUsername,
        coursePrice: Number(coursePrice),
        registrationDeadline,
        webinarTime,
        contactEmail,
        whatsappLink,
        discordLink
      }
    });

  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message
    });
  }
};
