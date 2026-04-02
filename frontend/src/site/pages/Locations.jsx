import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../hooks/useLanguage'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'

const MapPinIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const Locations = () => {
  const { t, getLocalizedField } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.get('/locations'),
  })

  const locations = data?.data || []

  return (
    <>
      <MetaTags
        title={t('locations.title')}
        description={t('locations.metaDesc')}
        url="/points-de-collecte"
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('nav.locations'), href: '/points-de-collecte' }]} />

          {/* Header */}
          <div className="mb-14 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
              <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                {t('locations.heading')}
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                {t('locations.subtitle')}
              </p>
            </motion.div>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 grid-flow-row-dense">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-none" />
              ))
            ) : (
              locations.map((location, index) => {
                const isAirport = !!location.is_airport
                const images = location.images || []
                const heroImage = images[0] || null

                return (
                  <motion.article
                    key={location.id}
                    className={`group relative border p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full ${
                      isAirport 
                        ? 'md:col-span-2 xl:col-span-2 border-primary/40 bg-gradient-to-br from-white to-primary/5 shadow-xl shadow-primary/10' 
                        : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-primary/10'
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
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

                    {/* Decorative background accents */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${heroImage ? 'z-[2]' : '-z-10'} transition-transform duration-700 group-hover:scale-[2.5] ${isAirport ? 'bg-primary/10' : 'bg-primary/5'}`} />
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary-light transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${heroImage ? 'z-[22]' : 'z-20'}`} />
                    
                    {/* Header Row: Icon & Badge */}
                    <div className={`flex justify-between items-start mb-8 ${heroImage ? 'relative z-[10]' : 'relative z-10'} w-full`}>
                      <div className={`w-16 h-16 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm relative ${isAirport ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/10 border'}`}>
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:animate-ping rounded-none" style={{ animationDuration: '2s' }} />
                        <MapPinIcon />
                      </div>
                      {isAirport && (
                        <Badge variant="airport" className="shadow-md scale-110 origin-right">
                          {t('locations.airport')}
                        </Badge>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className={`${heroImage ? 'relative z-[10]' : 'relative z-10'} flex-grow flex ${isAirport ? 'flex-col md:flex-row md:items-start gap-8' : 'flex-col'}`}>
                      <div className="flex-1 flex flex-col h-full">
                        {/* Name */}
                        <h2 className={`font-display font-bold text-text-primary mb-6 group-hover:text-primary transition-colors duration-300 ${isAirport ? 'text-3xl md:text-5xl tracking-tight' : 'text-2xl md:text-3xl'}`}>
                          {getLocalizedField(location, 'name')}
                        </h2>

                        {/* Address Block */}
                        <div className="flex items-start gap-4 text-text-secondary mb-8 flex-grow">
                          <svg className="w-5 h-5 mt-1 text-gray-300 flex-shrink-0 group-hover:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <div>
                            <span className="text-[11px] font-ui font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">
                              {t('locations.address')}
                            </span>
                            <p className={`${isAirport ? 'text-[17px]' : 'text-[15px]'} leading-relaxed text-gray-600 font-medium`}>
                              {getLocalizedField(location, 'address')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Airport Note Callout */}
                      {isAirport && (
                        <div className="md:w-[320px] flex-shrink-0 md:mt-0 mt-auto border-t md:border-t-0 md:border-l rtl:md:border-r rtl:md:border-l-0 border-gray-200/50 pt-6 md:pt-0 md:pl-8 rtl:md:pl-0 rtl:md:pr-8 flex flex-col justify-center">
                          <div className="relative flex flex-col gap-4 bg-orange-50 border border-orange-200 p-6 group-hover:bg-orange-100/50 transition-colors duration-300 shadow-inner">
                            <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 bottom-0 w-1 bg-orange-500" />
                            <div className="flex items-center gap-3 text-orange-600 font-bold uppercase tracking-wider text-xs">
                              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                              </svg>
                              Important
                            </div>
                            <p className="text-[15px] font-medium text-orange-900 leading-relaxed">
                              {t('locations.airportNote')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.article>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Locations
