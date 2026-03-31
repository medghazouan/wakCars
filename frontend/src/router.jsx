import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import LoginPage from '@/pages/auth/LoginPage'
import AdminLayout from '@/components/layout/AdminLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import FleetListPage from '@/pages/fleet/FleetListPage'
import FleetFormPage from '@/pages/fleet/FleetFormPage'

function FleetLegacyEditRedirect() {
  const { id } = useParams()
  return <Navigate to={`/fleet/${id}`} replace />
}
import ReservationsListPage from '@/pages/reservations/ReservationsListPage'
import ReservationFormPage from '@/pages/reservations/ReservationFormPage'
import InsuranceListPage from '@/pages/insurance/InsuranceListPage'
import TechnicalReviewsListPage from '@/pages/technical-reviews/TechnicalReviewsListPage'
import CustomersListPage from '@/pages/customers/CustomersListPage'
import PaymentsListPage from '@/pages/payments/PaymentsListPage'
import DamagesListPage from '@/pages/damages/DamagesListPage'
import BlogListPage from '@/pages/blog/BlogListPage'
import FaqsListPage from '@/pages/faqs/FaqsListPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import ReportsPage from '@/pages/reports/ReportsPage'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'fleet', element: <FleetListPage /> },
      { path: 'fleet/new', element: <FleetFormPage /> },
      { path: 'fleet/:id/edit', element: <FleetLegacyEditRedirect /> },
      { path: 'fleet/:id', element: <FleetFormPage /> },
      { path: 'reservations', element: <ReservationsListPage /> },
      { path: 'reservations/new', element: <ReservationFormPage /> },
      { path: 'reservations/:id/edit', element: <ReservationFormPage /> },
      { path: 'insurance', element: <InsuranceListPage /> },
      { path: 'technical-reviews', element: <TechnicalReviewsListPage /> },
      { path: 'customers', element: <CustomersListPage /> },
      { path: 'payments', element: <PaymentsListPage /> },
      { path: 'damages', element: <DamagesListPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'faqs', element: <FaqsListPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: '*', element: <div className="p-8">404 - Page Not Found</div> },
    ],
  },
])
