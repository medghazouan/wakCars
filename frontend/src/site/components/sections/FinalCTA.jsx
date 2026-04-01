import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import Button from '../ui/Button'

const FinalCTA = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.3 })

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-primary overflow-hidden"
    >
      {/* Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div className="container-wak relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Title */}
          <h2 className="text-display text-5xl md:text-6xl lg:text-7xl text-white mb-6">
            {t('cta.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/reservation">
              <Button
                variant="ghost"
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 border-none"
              >
                {t('cta.primary')}
              </Button>
            </Link>
            <Link to="/voitures">
              <Button
                variant="ghost"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                {t('cta.secondary')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FinalCTA
