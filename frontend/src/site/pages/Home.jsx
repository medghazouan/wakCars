import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { generateAutoRentalSchema } from '../utils/seo.utils'
import MetaTags from '../components/seo/MetaTags'
import HomeLoader from '../components/ui/HomeLoader'
import HeroSection from '../components/sections/HeroSection'
import TrustBar from '../components/ui/TrustBar'
import CategoriesSection from '../components/sections/CategoriesSection'
import FleetGrid from '../components/sections/FleetGrid'
import StatsCounter from '../components/sections/StatsCounter'
import WhyWakCars from '../components/sections/WhyWakCars'
import PickupPoints from '../components/sections/PickupPoints'
import ReviewsSection from '../components/sections/ReviewsSection'
import GuaranteeSection from '../components/sections/GuaranteeSection'
import BlogTeaser from '../components/sections/BlogTeaser'
import FinalCTA from '../components/sections/FinalCTA'

const Home = () => {
  const { t } = useLanguage()
  const [showLoader, setShowLoader] = useState(() => {
    return !sessionStorage.getItem('wak_home_loaded')
  })
  const [contentReady, setContentReady] = useState(!showLoader)

  const handleLoaderComplete = () => {
    sessionStorage.setItem('wak_home_loaded', 'true')
    setShowLoader(false)
    setContentReady(true)
  }

  return (
    <>
      <MetaTags
        title={null}
        description={t('meta.description')}
        url="/"
        schema={generateAutoRentalSchema()}
      />

      {showLoader && <HomeLoader onComplete={handleLoaderComplete} />}

      <motion.div
        initial={!contentReady ? { opacity: 0 } : false}
        animate={contentReady ? { opacity: 1 } : false}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <HeroSection />
        <TrustBar />
        <CategoriesSection />
        <StatsCounter />
        <FleetGrid />
        <WhyWakCars />
        <GuaranteeSection />
        <PickupPoints />
        <ReviewsSection />
        <BlogTeaser />
        <FinalCTA />
      </motion.div>
    </>
  )
}

export default Home
