import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/layout/WhatsAppButton'
import CustomCursor from './components/layout/CustomCursor'
import ScrollProgress from './components/layout/ScrollProgress'
import PageTransition from './components/layout/PageTransition'
import LoadingSpinner from './components/ui/LoadingSpinner'

export default function SiteLayout() {
  const location = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language

    if (i18n.language === 'ar') {
      const link = document.createElement('link')
      link.href =
        'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@700;800&family=Noto+Sans+Arabic:wght@400;500&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [i18n.language])

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
            <PageTransition>
              <Outlet key={location.pathname} />
            </PageTransition>
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  )
}
