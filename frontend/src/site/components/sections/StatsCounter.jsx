import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'

const CountUp = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const { ref, isInView } = useInView({ threshold: 0.5 })

  useEffect(() => {
    if (!isInView) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const StatsCounter = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  const stats = [
    { value: 15, suffix: '+', label: t('stats.cars') },
    { value: 2500, suffix: '+', label: t('stats.customers') },
    { value: 8, suffix: '', label: t('stats.years') },
    { value: 4.8, suffix: '/5', label: t('stats.rating'), isDecimal: true },
  ]

  return (
    <section ref={ref} className="bg-background-dark py-24 relative overflow-hidden">
      {/* Background accents matching Why Us section */}
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="container-wak relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-primary mb-2">
                {stat.isDecimal ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <CountUp end={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-text-on-dark text-sm font-ui uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsCounter
