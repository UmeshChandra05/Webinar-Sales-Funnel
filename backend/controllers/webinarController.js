const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const webinarController = {
  getWebinarInfo: async (req, res) => {
    try {
      // Calculate webinar date (7 days from now at 7 PM)
      const webinarDate = new Date()
      webinarDate.setDate(webinarDate.getDate() + 7)
      webinarDate.setHours(19, 0, 0, 0)

      const webinarInfo = {
        title: "Python Full Stack in 5 Days",
        date: webinarDate.toISOString(),
        duration: "2 hours",
        instructor: "Expert Python Developer",
        topics: [
          "Python Basics to Advanced",
          "Flask Backend Development",
          "React Frontend Integration",
          "Connecting APIs",
          "Deploying Apps in 5 Days",
          "Live Hands-on Learning",
        ],
        timezone: "UTC",
        registration_count: Math.floor(Math.random() * 500) + 1200, // Simulated count
      }

      res.status(200).json({
        success: true,
        data: webinarInfo,
      })
    } catch (error) {
      console.error("❌ Get webinar info error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to get webinar information",
      })
    }
  },
}

module.exports = webinarController
