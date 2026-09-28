import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner message="Verifying Admin Clearance…" />

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
