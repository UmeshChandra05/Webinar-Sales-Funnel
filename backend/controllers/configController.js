const axios = require("../middleware/axios");

const API_BASE_URL = process.env.API_BASE_URL;

const configController = {
  // Fetch admin configuration from Google Sheets (Sheet 3 - Admin)
  getAdminConfig: async (req, res) => {
    try {
      console.log("📋 Fetching admin configuration from Google Sheets...");

      if (!API_BASE_URL || API_BASE_URL === "API_URL") {
        console.log("⚠️ n8n API not configured, returning default config");
        return res.status(200).json({
          success: true,
          message: "Using default configuration",
          config: {
            coursePrice: 4999,
            registrationDeadline: "2025-11-07",
            webinarTime: "2025-11-08T19:00:00",
            contactEmail: "webinar@pystack.com",
            whatsappInviteLink: "https://wa.me/yourwhatsapplink",
            discordCommunityLink: "https://discord.gg/yourcommunity"
          }
        });
      }

      try {
        // Call n8n webhook to fetch admin configuration
        const response = await axios.get(`${API_BASE_URL}/admin-config`, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Admin configuration fetched successfully");
        console.log("📦 Config data:", JSON.stringify(response.data, null, 2));

        // Parse the response from Google Sheets
        let configData = response.data;

        // Handle different response formats
        if (Array.isArray(configData) && configData.length > 0) {
          configData = configData[0];
        }

        // Map Google Sheets field names to our config format
        const config = {
          coursePrice: parseInt(configData.registration_fee || configData.registrationFee || configData.coursePrice || 4999),
          registrationDeadline: configData.registration_deadline || configData.registrationDeadline || "2025-11-07",
          webinarTime: configData.webinar_time || configData.webinarTime || "2025-11-08T19:00:00",
          contactEmail: configData.contact_email || configData.contactEmail || "webinar@pystack.com",
          whatsappInviteLink: configData.whatsapp_invite_link || configData.whatsappInviteLink || "https://wa.me/yourwhatsapplink",
          discordCommunityLink: configData.discord_community_link || configData.discordCommunityLink || "https://discord.gg/yourcommunity"
        };

        console.log("📤 Sending config to frontend:", config);

        return res.status(200).json({
          success: true,
          message: "Configuration fetched successfully",
          config: config
        });

      } catch (apiError) {
        console.error("❌ n8n config fetch error:", apiError.message);
        console.error("❌ Error code:", apiError.code);
        console.error("❌ Has response:", !!apiError.response);
        
        // Network or connection errors
        if (!apiError.response || 
            apiError.code === 'ECONNREFUSED' || 
            apiError.code === 'ETIMEDOUT' ||
            apiError.code === 'ENOTFOUND' ||
            apiError.code === 'ECONNRESET' ||
            apiError.message?.includes('ECONNREFUSED') ||
            apiError.message?.includes('network')) {
          console.log("🔌 Network error - returning default config");
          return res.status(200).json({
            success: true,
            message: "Using default configuration (service unavailable)",
            config: {
              coursePrice: 4999,
              registrationDeadline: "2025-11-07",
              webinarTime: "2025-11-08T19:00:00",
              contactEmail: "webinar@pystack.com",
              whatsappInviteLink: "https://wa.me/yourwhatsapplink",
              discordCommunityLink: "https://discord.gg/yourcommunity"
            }
          });
        }

        // Return default config for other errors too
        return res.status(200).json({
          success: true,
          message: "Using default configuration",
          config: {
            coursePrice: 4999,
            registrationDeadline: "2025-11-07",
            webinarTime: "2025-11-08T19:00:00",
            contactEmail: "webinar@pystack.com",
            whatsappInviteLink: "https://wa.me/yourwhatsapplink",
            discordCommunityLink: "https://discord.gg/yourcommunity"
          }
        });
      }

    } catch (error) {
      console.error("❌ Admin config fetch error:", error);
      
      // Return default config even on error
      res.status(200).json({
        success: true,
        message: "Using default configuration",
        config: {
          coursePrice: 4999,
          registrationDeadline: "2025-11-07",
          webinarTime: "2025-11-08T19:00:00",
          contactEmail: "webinar@pystack.com",
          whatsappInviteLink: "https://wa.me/yourwhatsapplink",
          discordCommunityLink: "https://discord.gg/yourcommunity"
        }
      });
    }
  }
};

module.exports = configController;
