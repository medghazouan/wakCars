import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { useCarBySlug } from '../hooks/useCars'
import { useLanguage } from '../hooks/useLanguage'
import { generateCarSchema } from '../utils/seo.utils'
import { scaleUp, fadeUp, fadeLeft, fadeRight, staggerContainer } from '../utils/motion'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PriceTag from '../components/ui/PriceTag'
import CarCard from '../components/ui/CarCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const FuelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16"/>
    <path d="M17 10h1a2 2 0 012 2v6a2 2 0 01-2 2h-1"/>
    <path d="M6 12h6"/>
  </svg>
)

const SeatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const CarDetail = () => {
  const { slug } = useParams()
  const { t, getLocalizedField } = useLanguage()
  const { data, isLoading, error } = useCarBySlug(slug)

  if (isLoading) return <LoadingSpinner />
  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{t('common.error')}</p>
      </div>
    )
  }

  const car = data.data
  const similarCars = data.similar || []
  const images = car.images || [{ url: car.primary_image || '/placeholder-car.jpg' }]

  const specs = [
    { label: t('car.transmission'), value: car.transmission === 'AUTOMATIC' ? t('car.automatic') : t('car.manual') },
    { label: t('car.fuel'), value: t(`car.${car.fuel_type?.toLowerCase()}`) },
    { label: t('car.seats'), value: car.seats },
    { label: t('car.doors'), value: car.doors },
    { label: t('car.year'), value: car.year },
    { label: t('car.deposit'), value: `${car.deposit_amount} ${t('common.mad')}` },
  ]

  return (
    <>
      <MetaTags
        title={`Louer ${car.brand} ${car.model} Marrakech`}
        description={getLocalizedField(car, 'description')}
        image={images[0]?.url}
        url={`/voitures/${slug}`}
        schema={generateCarSchema(car)}
      />

      <div className="pt-24 pb-16 bg-background-light">
        <div className="container-wak">
          <Breadcrumbs
            items={[
              { label: t('fleet.title'), href: '/voitures' },
              { label: `${car.brand} ${car.model}`, href: `/voitures/${slug}` },
            ]}
          />

          <div className="flex flex-col xl:flex-row gap-12 mt-8">
            {/* LEFT MAIN COL: Hero Image & Info */}
            <div className="flex-1 w-full relative z-10">
               <motion.div 
                 variants={scaleUp}
                 initial="hidden"
                 animate="visible"
                 className="aspect-[4/3] lg:aspect-[21/9] bg-white border border-gray-100 shadow-2xl overflow-hidden relative group"
               >
                  <img src={images[0]?.url} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {car.category && (
                     <div className={`absolute top-6 left-6 px-4 py-1.5 text-white text-xs font-bold font-ui rounded uppercase tracking-widest shadow-lg ${
                       car.category?.slug === 'luxe' ? 'bg-accent-gold' : 'bg-primary'
                     }`}>
                        {getLocalizedField(car.category, 'name')}
                     </div>
                  )}
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-background-light text-text-primary text-xs font-bold font-ui rounded tracking-widest shadow-lg">
                    {car.year}
                  </div>
               </motion.div>

               <div className="mt-12 max-w-4xl">
                  <h1 className="text-display text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 text-text-primary">
                    {car.brand} <span className="text-gray-400 font-light block mt-2">{car.model}</span>
                  </h1>

                  {/* Inline Specs Row (Matching CarCard Minimalist Style) */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-10 pb-10 border-b border-gray-200">
                     <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-primary"><GearIcon /></span>
                        <span className="text-sm font-bold uppercase tracking-widest font-ui">
                           {car.transmission === 'AUTOMATIC' ? t('car.automatic') : t('car.manual')}
                        </span>
                     </div>
                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                     <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-primary"><FuelIcon /></span>
                        <span className="text-sm font-bold uppercase tracking-widest font-ui">
                           {t(`car.${car.fuel_type?.toLowerCase()}`)}
                        </span>
                     </div>
                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                     <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-primary"><SeatIcon /></span>
                        <span className="text-sm font-bold uppercase tracking-widest font-ui">
                           {car.seats} {t('fleet.seats')}
                        </span>
                     </div>
                  </div>

                  {/* Description Section */}
                  <div className="prose prose-lg prose-gray max-w-none">
                     <h2 className="font-display font-medium tracking-wide uppercase text-xl mb-4 text-text-primary">
                       {t('car.description')}
                     </h2>
                     <p className="text-text-secondary leading-relaxed text-lg">
                        {getLocalizedField(car, 'description')}
                     </p>
                  </div>
               </div>
            </div>

            {/* RIGHT SIDEBAR: Sticky Pricing Panel (Soft & Light) */}
            <div className="w-full xl:w-[420px] relative z-20">
               <div className="bg-white text-text-primary p-8 xl:p-10 sticky top-28 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-sm">
                  <h3 className="font-display font-bold text-text-secondary uppercase tracking-widest mb-3 text-xs">
                     {t('booking.basePrice')}
                  </h3>
                  <div className="mb-8 flex items-baseline">
                     <span className="text-5xl lg:text-6xl font-black font-display tracking-tighter text-text-primary">{car.price_per_day}</span>
                     <span className="text-xl text-primary font-black ml-2 rtl:mr-2 rtl:ml-0">{t('common.mad')}</span>
                     <span className="text-sm text-text-secondary ml-1 rtl:mr-1 rtl:ml-0 font-medium">{t('fleet.perDay')}</span>
                  </div>

                  <Link to={`/reservation?car=${car.id}`} className="block w-full">
                     <Button variant="primary" size="lg" className="w-full py-4 text-lg bg-primary hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                        {t('car.bookNow')}
                     </Button>
                  </Link>

                  <div className="mt-8 pt-8 border-t border-gray-100 text-sm text-text-secondary space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="uppercase tracking-wider text-[11px] font-bold">{t('booking.deposit')}</span> 
                       <span className="text-text-primary font-ui font-bold">{car.deposit_amount} {t('common.mad')}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="uppercase tracking-wider text-[11px] font-bold">{t('booking.cancellation')}</span> 
                       <span className="text-green-600 font-ui font-bold">{t('booking.freeCancellation')}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="uppercase tracking-wider text-[11px] font-bold">{t('booking.insurance')}</span> 
                       <span className="text-text-primary font-ui font-bold">{t('booking.fullInsurance')}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Similar Cars */}
          {similarCars.length > 0 && (
            <section className="mt-20">
              <motion.h2
                className="text-display text-3xl text-text-primary mb-8"
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                {t('car.similar')}
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                variants={staggerContainer(0.1)}
                initial="hidden"
                animate="visible"
              >
                {similarCars.slice(0, 3).map((similar) => (
                  <motion.div key={similar.id} variants={fadeUp}>
                    <CarCard car={similar} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

export default CarDetail
