import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { staggerContainer, fadeLeft, accentGrow, scaleUp } from '../../utils/motion'
import api from '../../services/api'
import Badge from '../ui/Badge'
import Skeleton from '../ui/Skeleton'

const MapPinIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const PickupPoints = () => {
  const { t, getLocalizedField } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.get('/locations'),
  })

  const locations = data?.data || []

  return (
    <section ref={ref} className="section-padding bg-background-light">
      <div className="container-wak">
        {/* Header - Reverted to original */}
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
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
              {t('locations.heading')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {t('locations.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Locations Creative Grid (Dynamic based on count without gaps) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[240px]"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={`skel-${i}`} className="h-full w-full col-span-1 md:col-span-1 lg:col-span-2" />
            ))
          ) : (
            locations.map((location, index) => {
              if (!location) return null;
              
              const isAirport = Boolean(location.is_airport);
              const images = location.images || [];
              const heroImage = images[0] || null;
              
              // Dynamic bento grid logic to perfectly fill a 6-column layout
              let gridClass = ""
              const total = locations.length
              
              if (total === 1) {
                gridClass = "lg:col-span-6"
              } else if (total === 2) {
                gridClass = "lg:col-span-3"
              } else if (total === 3) {
                gridClass = "lg:col-span-2"
              } else if (total === 4) {
                if (index === 0) gridClass = "lg:col-span-4"
                else if (index === 1) gridClass = "lg:col-span-2"
                else if (index === 2) gridClass = "lg:col-span-2"
                else gridClass = "lg:col-span-4"
              } else if (total === 5) {
                if (index < 2) gridClass = "lg:col-span-3"
                else gridClass = "lg:col-span-2"
              } else {
                if (index % 5 < 2) gridClass = "lg:col-span-3"
                else gridClass = "lg:col-span-2"
              }

              return (
                <motion.article
                  key={location.id || `loc-${index}`}
                  className={`group relative border p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full ${
                    isAirport 
                      ? 'bg-gradient-to-br from-white to-primary/5 shadow-xl shadow-primary/10 border-primary/40' 
                      : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-primary/10'
                  } ${gridClass}`}
                  variants={scaleUp}
                >
                  {/* Background Image */}
                  {heroImage && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <img
                          src={heroImage}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className={`absolute inset-0 z-[1] ${
                        isAirport
                          ? 'bg-gradient-to-t from-white/95 via-white/80 to-white/40'
                          : 'bg-gradient-to-t from-white/95 via-white/85 to-white/50'
                      }`} />
                    </>
                  )}

                  {/* Decorative background accents matching Locations page */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${heroImage ? 'z-[2]' : '-z-10'} transition-transform duration-700 group-hover:scale-[2.5] ${isAirport ? 'bg-primary/10' : 'bg-primary/5'}`} />
                  <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary-light transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${heroImage ? 'z-[22]' : 'z-20'}`} />
                  
                  {/* Header Row: Icon & Badge */}
                  <div className={`flex justify-between items-start mb-8 ${heroImage ? 'relative z-[10]' : 'relative z-10'} w-full`}>
                    <div className={`w-16 h-16 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm relative ${isAirport ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/10 border'}`}>
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:animate-ping rounded-none" style={{ animationDuration: '2s' }} />
                      <MapPinIcon />
                    </div>
                    
                    {/* Airport Badge */}
                    {isAirport && (
                      <Badge variant="airport" className="shadow-md scale-110 origin-right">
                        {t('locations.airport')}
                      </Badge>
                    )}
                  </div>

                  {/* Content Container (matching Locations.jsx structure) */}
                  <div className={`${heroImage ? 'relative z-[10]' : 'relative z-10'} flex-grow flex ${isAirport ? 'flex-col md:flex-row md:items-start gap-8' : 'flex-col'}`}>
                    <div className="flex-1 flex flex-col h-full">
                      {/* Name */}
                      <h2 className={`font-display font-bold text-text-primary mb-6 group-hover:text-primary transition-colors duration-300 ${isAirport ? 'text-3xl md:text-5xl tracking-tight' : 'text-2xl md:text-3xl'}`}>
                        {getLocalizedField(location, 'name')}
                      </h2>
                      
                      <p className={`text-text-secondary leading-relaxed ${isAirport ? 'text-lg max-w-xl' : 'text-base'}`}>
                        {getLocalizedField(location, 'address')}
                      </p>

                      {/* Airport Note */}
                      {isAirport && (
                        <p className="text-sm text-primary font-medium mt-6 flex items-center gap-2 bg-primary/5 inline-flex w-fit px-4 py-2 border border-primary/10">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          {t('locations.airportNote')}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default PickupPoints
