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
      console.error('❌ API_BASE_URL not configured');
      return res.status(500).json({
        success: false,
        message: 'API_BASE_URL not configured. Please configure n8n webhook URL in backend/.env file.',
        error: 'Configuration error'
      });
    }
    
    // Fetch settings from n8n webhook using GET request
    const response = await axios.get(N8N_GET_SETTINGS_WEBHOOK, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    console.log('✅ n8n response received');
    console.log('📦 Raw n8n response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      // n8n returns: { success: boolean, settings: { ... } }
      
      if (!response.data.success) {
        throw new Error('n8n returned success=false');
      }
      
      const settingsData = response.data.settings;
      
      if (!settingsData) {
        throw new Error('No settings object in n8n response');
      }
      
      console.log('📊 n8n settings data:', JSON.stringify(settingsData, null, 2));
      
      // Convert to our API format
      const settings = {
        adminUsername: 'admin', // Not exposed by n8n for security
        registrationFee: parseFloat(settingsData.reg_fee) || 0,
        registrationDeadline: convertDateFormat(settingsData.reg_deadline),
        webinarDate: convertDateFormat(settingsData.webinar_date),
        webinarTime: settingsData.webinar_time,
        contactEmail: settingsData.contact_email,
        whatsappLink: settingsData.whatsapp_invite,
        discordLink: settingsData.discord_link,
        webinarFeatures: settingsData.webinar_features || []
      };
      
      console.log('🔄 Mapped settings:', JSON.stringify(settings, null, 2));
      
      // Validate required fields are present
      const requiredFields = ['adminUsername', 'registrationFee', 'registrationDeadline', 'webinarDate', 'webinarTime', 'contactEmail', 'whatsappLink', 'discordLink'];
      const missingFields = requiredFields.filter(field => {
        const value = settings[field];
        return value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value));
      });
      
      if (missingFields.length > 0) {
        console.error('❌ Missing fields:', missingFields);
        console.error('❌ Settings object:', JSON.stringify(settings, null, 2));
        throw new Error(`Missing or invalid required fields from n8n: ${missingFields.join(', ')}. Please check Google Sheets Admin tab has all required data.`);
      }
      
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
    
    // Return error without fallback data - force proper configuration
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings from n8n. Please ensure n8n webhook is configured and accessible.',
      error: error.message
    });
  }
};

// Update admin settings to Google Sheets via n8n
exports.updateSettings = async (req, res) => {
  try {
    const {
      adminUsername,
      adminPassword,
      registrationFee,
      registrationDeadline,
      webinarDate,
      webinarTime,
      contactEmail,
      whatsappLink,
      discordLink
    } = req.body;

    // Validate required fields (password, whatsappLink, discordLink are optional)
    if (!adminUsername || !registrationFee || !registrationDeadline || 
        !webinarDate || !webinarTime || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: "Required fields: adminUsername, registrationFee, registrationDeadline, webinarDate, webinarTime, contactEmail"
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

    // Validate URLs (only if provided)
    const urlRegex = /^https?:\/\/.+/;
    if (whatsappLink && whatsappLink.trim() && !urlRegex.test(whatsappLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format for WhatsApp link"
      });
    }
    if (discordLink && discordLink.trim() && !urlRegex.test(discordLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format for Discord link"
      });
    }

    // Validate registration fee
    if (isNaN(registrationFee) || registrationFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Registration fee must be a positive number"
      });
    }

    // Validate registration deadline is before webinar date
    const deadlineDate = new Date(registrationDeadline);
    const webinarDateTime = new Date(webinarDate);
    
    if (deadlineDate >= webinarDateTime) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline must be before webinar date"
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
      "admin_username": adminUsername,
      "reg_fee": Number(registrationFee),
      "reg_deadline": formatDateForSheet(registrationDeadline),
      "webinar_date": formatDateForSheet(webinarDate),
      "webinar_time": webinarTime,
      "contact_email": contactEmail,
      "whatsapp_invite": whatsappLink,
      "discord_link": discordLink
    };

    // Only include password if it's provided (not empty)
    if (adminPassword && adminPassword.trim().length > 0) {
      sheetData["admin_password"] = adminPassword;
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
    console.log('📦 n8n Update Response:', JSON.stringify(response.data, null, 2));

    // n8n returns: { success: boolean, message: string, settings: {...} }
    res.json({
      success: response.data?.success !== false,
      message: response.data?.message || 'Settings updated successfully',
      settings: response.data?.settings || {
        admin_username: adminUsername,
        reg_fee: Number(registrationFee),
        reg_deadline: formatDateForSheet(registrationDeadline),
        webinar_date: formatDateForSheet(webinarDate),
        webinar_time: webinarTime,
        contact_email: contactEmail,
        whatsapp_invite: whatsappLink,
        discord_link: discordLink
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
