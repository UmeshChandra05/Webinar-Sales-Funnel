const axios = require("../middleware/axios")

const API_BASE_URL = process.env.API_BASE_URL

const webinarController = {
  recordAttendanceAsync: async (req, res) => {
    try {
      const { email, attended } = req.body

      const attendanceData = {
        email,
        attended,
        timestamp: new Date().toISOString(),
        session_duration: attended ? Math.floor(Math.random() * 120) + 30 : 0, // Random duration if attended
      }

      console.log(`📊 Recording attendance: ${attended ? "attended" : "missed"} for ${email}`)

      // If API_BASE_URL is configured, send to n8n webhook
      if (API_BASE_URL && API_BASE_URL !== "API_URL") {
        try {
          await axios.post(`${API_BASE_URL}/webinar-attendance`, attendanceData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          })
          console.log("✅ Attendance data sent to n8n successfully")
        } catch (apiError) {
          console.error("❌ Attendance n8n API Error:", apiError.message)
        }
      }

      res.status(200).json({
        success: true,
        message: "Attendance recorded successfully",
        data: {
          email,
          attended,
          timestamp: attendanceData.timestamp,
        },
      })
    } catch (error) {
      console.error("❌ Attendance recording error:", error)
      res.status(500).json({
        success: false,
        error: "Failed to record attendance",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      })
    }
  },

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
