const axios = require("../middleware/axios");

// Google Sheets configuration
const SHEET_ID = '1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8';
const ADMIN_SHEET_GID = '1904087004'; // Update this with your actual Admin sheet GID
const ADMIN_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${ADMIN_SHEET_GID}`;

// n8n webhook URL for updating settings - Update with your actual n8n webhook URL
const N8N_UPDATE_SETTINGS_WEBHOOK = process.env.N8N_UPDATE_SETTINGS_WEBHOOK || process.env.API_BASE_URL;

// Helper function to parse CSV
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const settings = {};
  
  // Skip header row and parse data
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles basic cases)
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length >= 2) {
      const key = values[0];
      const value = values[1];
      
      // Map Google Sheets field names to our setting keys
      switch(key) {
        case 'Admin Username':
          settings.adminUsername = value;
          break;
        case 'Admin Password':
          settings.adminPassword = value;
          break;
        case 'Registration Fee':
          settings.coursePrice = parseFloat(value) || 4999;
          break;
        case 'Registration Deadline':
          // Convert DD-MM-YYYY to YYYY-MM-DD
          const dateParts = value.split('-');
          if (dateParts.length === 3) {
            settings.registrationDeadline = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          } else {
            settings.registrationDeadline = value;
          }
          break;
        case 'Webinar Time':
          // Convert DD-MM-YYYY to YYYY-MM-DD format (assume time is not included or add default time)
          const webinarDateParts = value.split('-');
          if (webinarDateParts.length === 3) {
            settings.webinarTime = `${webinarDateParts[2]}-${webinarDateParts[1]}-${webinarDateParts[0]}T19:00`;
          } else {
            settings.webinarTime = value;
          }
          break;
        case 'Contact Email':
          settings.contactEmail = value;
          break;
        case 'Whatsapp Invite Link':
          settings.whatsappLink = value;
          break;
        case 'Discord Community Link':
          settings.discordLink = value;
          break;
      }
    }
  }
  
  return settings;
};

// Get admin settings from Google Sheets Admin tab
exports.getSettings = async (req, res) => {
  try {
    console.log('Fetching admin settings from Google Sheets Admin tab...');
    console.log('Admin CSV URL:', ADMIN_CSV_URL);
    
    // Fetch directly from Google Sheets CSV export
    const response = await axios.get(ADMIN_CSV_URL);
    
    if (response.data) {
      const settings = parseCSV(response.data);
      console.log('Parsed settings:', settings);
      
      res.json({
        success: true,
        settings: settings
      });
    } else {
      throw new Error('No data received from Google Sheets');
    }
  } catch (error) {
    console.error("Error fetching settings from Google Sheets:", error.message);
    
    // Return default settings on error
    res.json({
      success: true,
      settings: {
        adminUsername: 'admin',
        adminPassword: 'admin',
        coursePrice: 4999,
        registrationDeadline: '2025-11-07',
        webinarTime: '2025-11-08T19:00',
        contactEmail: 'webinar@pystack.com',
        whatsappLink: 'www.google.com',
        discordLink: 'www.discord.com'
      },
      message: 'Using default settings due to fetch error: ' + error.message
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
    const response = await axios.post(N8N_UPDATE_SETTINGS_WEBHOOK, {
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
