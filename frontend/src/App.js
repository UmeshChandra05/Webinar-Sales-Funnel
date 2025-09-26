import { Routes, Route, useLocation } from "react-router-dom"
import Navigation from "./components/Navigation"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"
import LandingPage from "./pages/LandingPage"
import RegisterPage from "./pages/RegisterPage"
import PaymentPage from "./pages/PaymentPage"
import PaymentSuccessPage from "./pages/PaymentSuccessPage"
import PaymentFailedPage from "./pages/PaymentFailedPage"
import ThankYouPage from "./pages/ThankYouPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import NotFoundPage from "./pages/NotFoundPage"

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminPath && <Navigation />}
      <main className={!isAdminPath ? "pt-16" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
