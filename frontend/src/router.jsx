import { createBrowserRouter, Navigate } from 'react-router-dom'
import { FleetLegacyEditRedirect, ProtectedRoute } from './routing/AdminRouteGuards'
import {
  About,
  Blog,
  BlogPost,
  Booking,
  BookingConfirm,
  CarDetail,
  Category,
  Contact,
  FAQ,
  Fleet,
  Home,
  Locations,
  NotFound,
  Privacy,
  Terms,
} from './routing/publicSiteLazyPages'

import SiteLayout from './site/SiteLayout'
import LoginPage from '@admin/pages/auth/LoginPage'
import AdminLayout from '@admin/components/layout/AdminLayout'
import DashboardPage from '@admin/pages/dashboard/DashboardPage'
import FleetListPage from '@admin/pages/fleet/FleetListPage'
import FleetFormPage from '@admin/pages/fleet/FleetFormPage'
import ReservationsListPage from '@admin/pages/reservations/ReservationsListPage'
import ReservationFormPage from '@admin/pages/reservations/ReservationFormPage'
import InsuranceListPage from '@admin/pages/insurance/InsuranceListPage'
import InsuranceFormPage from '@admin/pages/insurance/InsuranceFormPage'
import TechnicalReviewsListPage from '@admin/pages/technical-reviews/TechnicalReviewsListPage'
import TechnicalVisitsFormPage from '@admin/pages/technical-reviews/TechnicalVisitsFormPage'
import CustomersListPage from '@admin/pages/customers/CustomersListPage'
import PaymentsListPage from '@admin/pages/payments/PaymentsListPage'
import DamagesListPage from '@admin/pages/damages/DamagesListPage'
import BlogListPage from '@admin/pages/blog/BlogListPage'
import FaqsListPage from '@admin/pages/faqs/FaqsListPage'
import SettingsPage from '@admin/pages/settings/SettingsPage'
import ReportsPage from '@admin/pages/reports/ReportsPage'
import AdminNotFound from '@admin/pages/AdminNotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'voitures', element: <Fleet /> },
      { path: 'voitures/:slug', element: <CarDetail /> },
      { path: 'voitures/categorie/:slug', element: <Category /> },
      { path: 'reservation', element: <Booking /> },
      { path: 'reservation/confirmation', element: <BookingConfirm /> },
      { path: 'points-de-collecte', element: <Locations /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'a-propos', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'conditions', element: <Terms /> },
      { path: 'confidentialite', element: <Privacy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'fleet', element: <FleetListPage /> },
          { path: 'fleet/new', element: <FleetFormPage /> },
          { path: 'fleet/:id/edit', element: <FleetLegacyEditRedirect /> },
          { path: 'fleet/:id', element: <FleetFormPage /> },
          { path: 'reservations', element: <ReservationsListPage /> },
          { path: 'reservations/new', element: <ReservationFormPage /> },
          { path: 'reservations/:id/edit', element: <ReservationFormPage /> },
          { path: 'insurance', element: <InsuranceListPage /> },
          { path: 'insurance/new', element: <InsuranceFormPage /> },
          { path: 'insurance/:id/edit', element: <InsuranceFormPage /> },
          { path: 'technical-reviews', element: <TechnicalReviewsListPage /> },
          { path: 'technical-reviews/new', element: <TechnicalVisitsFormPage /> },
          { path: 'technical-reviews/:id/edit', element: <TechnicalVisitsFormPage /> },
          { path: 'customers', element: <CustomersListPage /> },
          { path: 'payments', element: <PaymentsListPage /> },
          { path: 'damages', element: <DamagesListPage /> },
          { path: 'blog', element: <BlogListPage /> },
          { path: 'faqs', element: <FaqsListPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: '*', element: <AdminNotFound /> },
        ],
      },
    ],
  },
])
