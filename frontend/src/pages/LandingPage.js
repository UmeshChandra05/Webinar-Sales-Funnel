import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LandingPage = () => {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Set webinar date to 7 days from now
    const webinarDate = new Date()
    webinarDate.setDate(webinarDate.getDate() + 7)
    webinarDate.setHours(19, 0, 0, 0) // 7 PM

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = webinarDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRegisterClick = () => {
    navigate("/register")
  }

  const features = [
    {
      icon: "🐍",
      title: "Python Basics to Advanced",
      description: "Master Python fundamentals and advanced concepts needed for full-stack development.",
    },
    {
      icon: "⚡",
      title: "Flask Backend Development",
      description: "Build robust backend APIs with Flask, including authentication and database integration.",
    },
    {
      icon: "🌐",
      title: "React Frontend Integration",
      description: "Create dynamic user interfaces and connect them seamlessly with your Python backend.",
    },
    {
      icon: "🔗",
      title: "Connecting APIs",
      description: "Learn how to design, build, and consume RESTful APIs for full-stack applications.",
    },
    {
      icon: "🚀",
      title: "Deploying Apps in 5 Days",
      description: "Deploy your full-stack applications to production with modern deployment strategies.",
    },
    {
      icon: "👥",
      title: "Live Hands-on Learning",
      description: "Interactive sessions with real-time coding and Q&A with industry experts.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container relative text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master Python Full Stack Development in Just <span className="gradient-text">5 Days</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Join our intensive webinar and learn backend + frontend integration hands-on.
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center mb-8">
            <div className="card bg-gray-900/50 backdrop-blur-sm border-purple-500/20">
              <p className="text-sm text-gray-400 mb-4">Webinar starts in:</p>
              <div className="flex gap-4 text-center">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-purple-400">{timeLeft.days}</span>
                  <span className="text-sm text-gray-400">Days</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-purple-400">{timeLeft.hours}</span>
                  <span className="text-sm text-gray-400">Hours</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-purple-400">{timeLeft.minutes}</span>
                  <span className="text-sm text-gray-400">Minutes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-purple-400">{timeLeft.seconds}</span>
                  <span className="text-sm text-gray-400">Seconds</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleRegisterClick}>
            💡 I'm Interested - Show Me Details
          </button>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="section bg-gray-900/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Learn</h2>
            <p className="text-xl text-gray-400">Everything you need to become a full-stack Python developer</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section gradient-bg">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who have already mastered full-stack development
          </p>
          <button className="btn btn-lg bg-white text-purple-600 hover:bg-gray-100" onClick={handleRegisterClick}>
            � Show Interest Now
          </button>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
