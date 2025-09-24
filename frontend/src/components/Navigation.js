import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-wrapper">
          
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <div className="logo-icon">
              <span className="logo-emoji">🐍</span>
              <div className="logo-indicator"></div>
            </div>
            <div className="logo-text">
              <span className="brand-name">PyStack</span>
              <span className="brand-tagline">Full Stack Webinar</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`nav-link ${isActive("/about") ? "nav-link-active" : ""}`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`nav-link ${isActive("/contact") ? "nav-link-active" : ""}`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="nav-cta-desktop">
            <Link to="/register" className="cta-button">
              <span>💡 I'm Interested</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7 7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="nav-mobile-toggle"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Toggle menu</span>
            <div className="hamburger">
              <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-1-open' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-2-open' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-3-open' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`nav-mobile ${isMenuOpen ? 'nav-mobile-open' : ''}`}>
          <div className="nav-mobile-content">
            <Link
              to="/"
              onClick={closeMenu}
              className={`nav-mobile-link ${isActive("/") ? "nav-mobile-link-active" : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Home
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className={`nav-mobile-link ${isActive("/about") ? "nav-mobile-link-active" : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9,9h5a3 3 0 1 1 0 6h-5m0-6v6"/>
              </svg>
              About
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className={`nav-mobile-link ${isActive("/contact") ? "nav-mobile-link-active" : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </Link>
            
            <div className="nav-mobile-cta">
              <Link to="/register" onClick={closeMenu} className="cta-button-mobile">
                💡 Show Interest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
