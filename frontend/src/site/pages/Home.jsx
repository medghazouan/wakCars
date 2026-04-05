import { useState } from 'react'
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
  const [showLoader, setShowLoader] = useState(true)

  const handleLoaderComplete = () => {
    setShowLoader(false)
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

      <div>
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
      </div>
    </>
  )
}

export default Home
