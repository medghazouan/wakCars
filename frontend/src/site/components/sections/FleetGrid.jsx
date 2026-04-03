import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCars } from '../../hooks/useCars'
import { useLanguage } from '../../hooks/useLanguage'
import { useInView } from '../../hooks/useInView'
import CarCard from '../ui/CarCard'
import { CarCardSkeleton } from '../ui/Skeleton'

const FleetGrid = () => {
  const { t } = useLanguage()
  const { data, isLoading, error } = useCars()
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const allCars = data?.data || []

  const displayCars = useMemo(() => {
    const byCategory = {}
    for (const car of allCars) {
      const key = car.category_id || car.category?.id || 'other'
      if (!byCategory[key]) byCategory[key] = []
      if (byCategory[key].length < 2) byCategory[key].push(car)
    }
    return Object.values(byCategory).flat()
  }, [allCars])

  return (
    <section ref={ref} className="section-padding bg-background-warm">
      <div className="container-wak">
        {/* Header */}
        <div className="mb-14 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
              {t('fleet.title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {t('fleet.subtitle')}
            </p>
          </motion.div>
          
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <CarCardSkeleton key={i} />)
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-text-secondary">{t('common.error')}</p>
            </div>
          ) : (
            displayCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))
          )}
        </div>

        {/* View All Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            to="/voitures"
            className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors duration-300"
          >
            {t('fleet.viewAll', 'Voir toute la flotte')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}

export default FleetGrid
