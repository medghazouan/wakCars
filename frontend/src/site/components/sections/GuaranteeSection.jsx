import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'

const PriceIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const CancelIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="m3 3 18 18" />
  </svg>
)

const WhatsappIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const PaymentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
)

const GuaranteeSection = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  const guarantees = [
    {
      icon: <PriceIcon />,
      title: t('guarantee.price.title'),
      description: t('guarantee.price.desc'),
    },
    {
      icon: <CancelIcon />,
      title: t('guarantee.cancel.title'),
      description: t('guarantee.cancel.desc'),
    },
    {
      icon: <WhatsappIcon />,
      title: t('guarantee.whatsapp.title'),
      description: t('guarantee.whatsapp.desc'),
    },
    {
      icon: <PaymentIcon />,
      title: t('guarantee.payment.title'),
      description: t('guarantee.payment.desc'),
    },
  ]

  return (
    <section ref={ref} className="section-padding bg-background-light">
      <div className="container-wak">
        {/* Header */}
        <div className="mb-14 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
              {t('guarantee.title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {t('guarantee.subtitle', 'Louez en toute tranquillité avec nos engagements de transparence totale.')}
            </p>
          </motion.div>
        </div>

        {/* Normal Grid - Modern Sharp Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((item, index) => (
            <motion.div
              key={index}
              className="group relative flex flex-col p-8 bg-white border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden min-h-[280px]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Modern subtle accent line on hover */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-light transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              {/* Subtle background glow */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              
              {/* Icon Container */}
              <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                {item.icon}
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-xl text-text-primary mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mt-auto">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GuaranteeSection
