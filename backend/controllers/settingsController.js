const axios = require("../middleware/axios");

// n8n webhook URLs - Update these with your actual n8n webhook URLs
const N8N_GET_SETTINGS_WEBHOOK = process.env.N8N_GET_SETTINGS_WEBHOOK || "https://your-n8n-instance.com/webhook/get-admin-settings";
const N8N_UPDATE_SETTINGS_WEBHOOK = process.env.N8N_UPDATE_SETTINGS_WEBHOOK || "https://your-n8n-instance.com/webhook/update-admin-settings";

// Get admin settings from Google Sheets via n8n
exports.getSettings = async (req, res) => {
  try {
    // Fetch settings from n8n webhook which reads from Google Sheets "Admin" tab
    const response = await axios.post(N8N_GET_SETTINGS_WEBHOOK, {
      action: "getSettings"
    });

    // Expected response from n8n:
    // {
    //   adminUsername: "admin",
    //   coursePrice: 4999,
    //   registrationDeadline: "2025-11-07",
    //   webinarTime: "2025-11-08T19:00",
    //   contactEmail: "webinar@pystack.com",
    //   whatsappLink: "https://wa.me/...",
    //   discordLink: "https://discord.gg/..."
    // }

    if (response.data) {
      res.json({
        success: true,
        settings: response.data
      });
    } else {
      // Return default settings if no data from Google Sheets
      res.json({
        success: true,
        settings: {
          adminUsername: 'admin',
          coursePrice: 4999,
          registrationDeadline: '2025-11-07',
          webinarTime: '2025-11-08T19:00',
          contactEmail: 'webinar@pystack.com',
          whatsappLink: 'https://wa.me/',
          discordLink: 'https://discord.gg/'
        }
      });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    
    // Return default settings on error
    res.json({
      success: true,
      settings: {
        adminUsername: 'admin',
        coursePrice: 4999,
        registrationDeadline: '2025-11-07',
        webinarTime: '2025-11-08T19:00',
        contactEmail: 'webinar@pystack.com',
        whatsappLink: 'https://wa.me/',
        discordLink: 'https://discord.gg/'
      },
      message: 'Using default settings due to fetch error'
    });
  }
};

// Update admin settings to Google Sheets via n8n
exports.updateSettings = async (req, res) => {
  try {
    const {
      adminUsername,
      coursePrice,
      registrationDeadline,
      webinarTime,
      contactEmail,
      whatsappLink,
      discordLink
    } = req.body;

    // Validate required fields
    if (!adminUsername || !coursePrice || !registrationDeadline || 
        !webinarTime || !contactEmail || !whatsappLink || !discordLink) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
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

    // Send update to n8n webhook which will write to Google Sheets "Admin" tab
    const response = await axios.post(N8N_UPDATE_SETTINGS_WEBHOOK, {
      action: "updateSettings",
      settings: {
        adminUsername,
        coursePrice: Number(coursePrice),
        registrationDeadline,
        webinarTime,
        contactEmail,
        whatsappLink,
        discordLink,
        updatedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: response.data
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
