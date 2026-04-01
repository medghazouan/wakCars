import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFeaturedCars } from '../../hooks/useCars'
import { useLanguage } from '../../hooks/useLanguage'
import { useInView } from '../../hooks/useInView'
import CarCard from '../ui/CarCard'
import { CarCardSkeleton } from '../ui/Skeleton'
import Button from '../ui/Button'

const FleetGrid = () => {
  const { t } = useLanguage()
  const { data, isLoading, error } = useFeaturedCars()
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const cars = data?.data || []

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
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/voitures"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white border border-gray-200 text-text-primary font-ui font-semibold uppercase tracking-wider text-sm hover:border-primary hover:text-primary transition-colors"
            >
              {t('fleet.viewAll')}
            </Link>
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
            cars.map((car, index) => (
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

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link to="/voitures">
            <Button variant="secondary" size="lg">
              {t('hero.cta')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FleetGrid
