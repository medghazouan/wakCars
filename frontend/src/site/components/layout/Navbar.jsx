import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'
import wakCarsLogo from '../../assets/images/wak-cars-bl.png'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t, currentLanguage, toggleLanguage, isRTL } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/voitures', label: t('nav.fleet') },
    { to: '/points-de-collecte', label: t('nav.locations') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/contact', label: t('nav.contact') },
  ]

  const isHomePage = location.pathname === '/'
  const needsDarkBg = !isHomePage || isScrolled || isMobileMenuOpen

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          needsDarkBg
            ? 'bg-background-dark shadow-lg'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="container-wak">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 z-50"
              aria-label="WAK Cars - Accueil"
            >
              <img 
                src={wakCarsLogo} 
                alt="WAK Cars" 
                className="h-14 md:h-16 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-ui font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'text-primary'
                      : 'text-text-on-dark hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 text-sm font-ui font-semibold text-text-on-dark border border-white/20 hover:border-white/40 transition-colors"
                aria-label={`Switch to ${currentLanguage === 'fr' ? 'Arabic' : 'French'}`}
              >
                {currentLanguage === 'fr' ? 'عربي' : 'FR'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-text-on-dark transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-text-on-dark transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-text-on-dark transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background-dark lg:hidden"
            initial={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at top right)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 pt-20">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.15 + index * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    to={link.to}
                    className={`text-2xl font-display font-bold uppercase tracking-wider ${
                      location.pathname === link.to
                        ? 'text-primary'
                        : 'text-text-on-dark'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="flex flex-col items-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + navLinks.length * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <button
                  onClick={toggleLanguage}
                  className="px-6 py-3 text-lg font-ui font-semibold text-text-on-dark border border-white/20"
                >
                  {currentLanguage === 'fr' ? 'عربي' : 'Français'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
