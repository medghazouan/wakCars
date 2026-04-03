import { lazy } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@admin/hooks/useAuth'
import { adminPath } from '@admin/adminPaths'

import SiteLayout from './site/SiteLayout'
import LoginPage from '@admin/pages/auth/LoginPage'
import AdminLayout from '@admin/components/layout/AdminLayout'
import DashboardPage from '@admin/pages/dashboard/DashboardPage'
import FleetListPage from '@admin/pages/fleet/FleetListPage'
import FleetFormPage from '@admin/pages/fleet/FleetFormPage'
import CategoriesListPage from '@admin/pages/categories/CategoriesListPage'
import CategoryFormPage from '@admin/pages/categories/CategoryFormPage'
import LocationsListPage from '@admin/pages/locations/LocationsListPage'
import LocationFormPage from '@admin/pages/locations/LocationFormPage'
import ReservationsListPage from '@admin/pages/reservations/ReservationsListPage'
import ReservationFormPage from '@admin/pages/reservations/ReservationFormPage'
import InsuranceListPage from '@admin/pages/insurance/InsuranceListPage'
import InsuranceFormPage from '@admin/pages/insurance/InsuranceFormPage'
import TechnicalReviewsListPage from '@admin/pages/technical-reviews/TechnicalReviewsListPage'
import TechnicalVisitsFormPage from '@admin/pages/technical-reviews/TechnicalVisitsFormPage'
import CustomersListPage from '@admin/pages/customers/CustomersListPage'
import PaymentsListPage from '@admin/pages/payments/PaymentsListPage'
import DamagesListPage from '@admin/pages/damages/DamagesListPage'
import DamageFormPage from '@admin/pages/damages/DamageFormPage'
import BlogListPage from '@admin/pages/blog/BlogListPage'
import BlogFormPage from '@admin/pages/blog/BlogFormPage'
import FaqsListPage from '@admin/pages/faqs/FaqsListPage'
import FaqFormPage from '@admin/pages/faqs/FaqFormPage'
import SettingsPage from '@admin/pages/settings/SettingsPage'
import ReportsPage from '@admin/pages/reports/ReportsPage'
import AdminNotFound from '@admin/pages/AdminNotFound'

const Home = lazy(() => import('./site/pages/Home'))
const Fleet = lazy(() => import('./site/pages/Fleet'))
const CarDetail = lazy(() => import('./site/pages/CarDetail'))
const Category = lazy(() => import('./site/pages/Category'))
const Booking = lazy(() => import('./site/pages/Booking'))
const BookingConfirm = lazy(() => import('./site/pages/BookingConfirm'))
const Locations = lazy(() => import('./site/pages/Locations'))
const FAQ = lazy(() => import('./site/pages/FAQ'))
const Blog = lazy(() => import('./site/pages/Blog'))
const BlogPost = lazy(() => import('./site/pages/BlogPost'))
const About = lazy(() => import('./site/pages/About'))
const Contact = lazy(() => import('./site/pages/Contact'))
const Terms = lazy(() => import('./site/pages/Terms'))
const Privacy = lazy(() => import('./site/pages/Privacy'))
const NotFound = lazy(() => import('./site/pages/NotFound'))

function FleetLegacyEditRedirect() {
  const { id } = useParams()
  return <Navigate to={adminPath(`/fleet/${id}`)} replace />
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={adminPath('/login')} replace />
  }
  return children
}

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
          { path: 'categories', element: <CategoriesListPage /> },
          { path: 'categories/new', element: <CategoryFormPage /> },
          { path: 'categories/:id', element: <CategoryFormPage /> },
          { path: 'locations', element: <LocationsListPage /> },
          { path: 'locations/new', element: <LocationFormPage /> },
          { path: 'locations/:id', element: <LocationFormPage /> },
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
          { path: 'damages/new', element: <DamageFormPage /> },
          { path: 'damages/:id/edit', element: <DamageFormPage /> },
          { path: 'blog', element: <BlogListPage /> },
          { path: 'blog/new', element: <BlogFormPage /> },
          { path: 'blog/:id/edit', element: <BlogFormPage /> },
          { path: 'faqs', element: <FaqsListPage /> },
          { path: 'faqs/new', element: <FaqFormPage /> },
          { path: 'faqs/:id/edit', element: <FaqFormPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: '*', element: <AdminNotFound /> },
        ],
      },
    ],
  },
])
