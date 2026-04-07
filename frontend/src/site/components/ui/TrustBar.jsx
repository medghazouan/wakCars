import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { staggerContainer, fadeUp } from '../../utils/motion'

const icons = {
  transparent: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  delivery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
      <polygon points="12 15 17 21 7 21 12 15" />
    </svg>
  ),
  support: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  recent: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  insurance: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
}

const TrustItem = ({ icon, title, description }) => (
  <motion.div 
    className="group flex items-center gap-4 py-6 px-4 hover:bg-white/[0.02] transition-colors rounded-xl cursor-default"
    variants={fadeUp}
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:border-primary group-hover:text-primary group-hover:shadow-[0_0_15px_rgba(204,0,0,0.3)] transition-all duration-300">
      {icon}
    </div>
    <div className="flex flex-col">
      <h3 className="text-white font-ui font-semibold text-[15px] leading-tight mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-[13px] leading-snug">
        {description}
      </p>
    </div>
  </motion.div>
)

const TrustBar = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const items = [
    { icon: icons.transparent, title: t('trust.transparent'), description: t('trust.transparentDesc') },
    { icon: icons.delivery, title: t('trust.delivery'), description: t('trust.deliveryDesc') },
    { icon: icons.support, title: t('trust.support'), description: t('trust.supportDesc') },
    { icon: icons.recent, title: t('trust.recent'), description: t('trust.recentDesc') },
    { icon: icons.insurance, title: t('trust.insurance'), description: t('trust.insuranceDesc') },
  ]

  return (
    <section className="bg-background-dark border-b border-white/5 relative z-10">
      <div className="container-wak" ref={ref}>
        {/* Responsive Grid Layout */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/5 py-2"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {items.map((item, index) => (
            <div key={index} className="py-2 lg:py-0">
              <TrustItem
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TrustBar
