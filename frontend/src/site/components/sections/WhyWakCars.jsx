import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { staggerContainer, fadeUp, fadeLeft, accentGrow, scaleUp } from '../../utils/motion'

const PriceIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v12M9 9h6M9 15h6"/>
  </svg>
)

const DeliveryIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
)

const SupportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
  </svg>
)

const WhyWakCars = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  const reasons = [
    {
      icon: <PriceIcon />,
      title: t('whyUs.reason1.title'),
      description: t('whyUs.reason1.desc'),
    },
    {
      icon: <DeliveryIcon />,
      title: t('whyUs.reason2.title'),
      description: t('whyUs.reason2.desc'),
    },
    {
      icon: <SupportIcon />,
      title: t('whyUs.reason3.title'),
      description: t('whyUs.reason3.desc'),
    },
  ]

  return (
    <section ref={ref} className="section-padding bg-background-dark relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="container-wak relative z-10">
        {/* Header */}
        <div className="mb-14 relative">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div
              className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block origin-top"
              variants={accentGrow}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            />
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 uppercase leading-[1.1]">
              {t('whyUs.title')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              {t('whyUs.subtitle', 'Découvrez les avantages exclusifs qui font de WAK CARS votre partenaire de confiance.')}
            </p>
          </motion.div>
        </div>

        {/* Creative Sharp-Corner Grid - Adjusted to fill space properly */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-1"
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {reasons.map((reason, index) => {
            return (
              <motion.div
                key={index}
                className="group relative bg-[#1c1c1c] border border-white/5 p-10 flex flex-col hover:bg-[#222] transition-colors duration-500 overflow-hidden min-h-[300px]"
                variants={scaleUp}
              >
                {/* Accent line on hover */}
                <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-primary-light transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                
                {/* Background glow on hover */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="text-primary mb-auto group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 relative z-10">
                  {reason.icon}
                </div>
                
                <div className="mt-8 relative z-10">
                  <h3 className="font-display font-bold text-white mb-4 group-hover:text-primary transition-colors text-2xl">
                    {reason.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base">
                    {reason.description}
                  </p>
                </div>

                {/* Decorative numbering */}
                <div className="absolute top-6 right-6 font-display font-black text-[120px] leading-none text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-500 pointer-events-none select-none">
                  0{index + 1}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default WhyWakCars
