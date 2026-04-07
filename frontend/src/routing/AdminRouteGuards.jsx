import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@admin/hooks/useAuth'
import { adminPath } from '@admin/adminPaths'

export function FleetLegacyEditRedirect() {
  const { id } = useParams()
  return <Navigate to={adminPath(`/fleet/${id}`)} replace />
}

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={adminPath('/login')} replace />
  }
  return children
}
