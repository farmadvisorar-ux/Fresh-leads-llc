import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Auth pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Client pages
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Profile from './pages/Profile'

// Dedicated Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAddLead from './pages/admin/AdminAddLead'
import AdminLeadsList from './pages/admin/AdminLeadsList'
import AdminClients from './pages/admin/AdminClients'
import AdminLeadUpload from './pages/admin/AdminLeadUpload'
import AdminMessages from './pages/admin/AdminMessages'
import AdminAnnouncement from './pages/admin/AdminAnnouncement'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Client Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dedicated Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Client CRM Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Protected Dedicated Admin Operations Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="leads/new" element={<AdminAddLead />} />
          <Route path="leads" element={<AdminLeadsList />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="upload" element={<AdminLeadUpload />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="announce" element={<AdminAnnouncement />} />
          {/* Legacy route alias */}
          <Route path="users" element={<Navigate to="/admin/clients" replace />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
