import { Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Navigation from "./components/Navigation"
import AIChatWidget from "./components/AIChatWidget"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import PaymentPage from "./pages/PaymentPage"
import PaymentSuccessPage from "./pages/PaymentSuccessPage"
import PaymentFailedPage from "./pages/PaymentFailedPage"
import ThankYouPage from "./pages/ThankYouPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminSettingsPage from "./pages/AdminSettingsPage"
import NotFoundPage from "./pages/NotFoundPage"

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <div className="App">
        {!isAdminPath && <Navigation />}
        <main className={!isAdminPath ? "pt-16" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-success" 
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-failed" 
              element={
                <ProtectedRoute>
                  <PaymentFailedPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/thank-you" 
              element={
                <ProtectedRoute>
                  <ThankYouPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        
        {/* AI Chat Widget - Only on public pages */}
        {!isAdminPath && <AIChatWidget />}
      </div>
    </AuthProvider>
  )
}

export default App
