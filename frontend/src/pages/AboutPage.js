const AboutPage = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "Lead Python Developer",
      experience: "8+ years",
      specialties: ["Django", "Flask", "FastAPI", "PostgreSQL"],
    },
    {
      name: "Mike Chen",
      role: "Full Stack Engineer",
      experience: "6+ years",
      specialties: ["React", "Node.js", "Python", "AWS"],
    },
    {
      name: "Emily Rodriguez",
      role: "DevOps Specialist",
      experience: "5+ years",
      specialties: ["Docker", "Kubernetes", "CI/CD", "Cloud Architecture"],
    },
  ]

  return (
    <div className="min-h-screen section">
      <div className="container max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Python Full Stack</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're passionate about making Python full-stack development accessible to everyone. Our mission is to bridge
            the gap between backend and frontend development through practical, hands-on learning experiences.
          </p>
        </div>

        {/* Mission Section */}
        <div className="card mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Empowering Developers</h3>
              <p className="text-gray-400">
                We believe every developer should have the skills to build complete applications. Our comprehensive
                approach ensures you understand both the backend logic and frontend presentation layers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Practical Learning</h3>
              <p className="text-gray-400">
                Theory is important, but practice makes perfect. Our courses focus on building real projects that you
                can add to your portfolio and use in your career.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">5000+</div>
            <p className="text-gray-400">Students Taught</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">50+</div>
            <p className="text-gray-400">Webinars Delivered</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">95%</div>
            <p className="text-gray-400">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">4.9/5</div>
            <p className="text-gray-400">Average Rating</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Expert Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-purple-400 mb-2">{member.role}</p>
                <p className="text-sm text-gray-400 mb-4">{member.experience} experience</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.specialties.map((specialty, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="card">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="text-2xl mr-4">🎯</div>
              <div>
                <h3 className="font-semibold mb-2">Quality First</h3>
                <p className="text-gray-400">
                  We never compromise on the quality of our content. Every lesson is carefully crafted and tested to
                  ensure maximum learning value.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-2xl mr-4">🤝</div>
              <div>
                <h3 className="font-semibold mb-2">Community Driven</h3>
                <p className="text-gray-400">
                  Learning is better together. We foster a supportive community where students help each other grow and
                  succeed.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-2xl mr-4">🚀</div>
              <div>
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-gray-400">
                  We stay current with the latest technologies and best practices, ensuring our students learn relevant,
                  in-demand skills.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-2xl mr-4">💡</div>
              <div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-gray-400">
                  Education should be accessible to everyone. We offer free resources and affordable courses to remove
                  barriers to learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
