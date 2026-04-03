import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from './Badge'
import PriceTag from './PriceTag'
import { useLanguage } from '../../hooks/useLanguage'

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

const CarCard = ({ car }) => {
  const { t, getLocalizedField, currentLanguage } = useLanguage()

  const categoryName = currentLanguage === 'ar'
    ? (car.category_name_ar || car.category?.name_ar || car.category_name_fr || car.category?.name_fr || car.category)
    : (car.category_name_fr || car.category?.name_fr || car.category);

  const isLuxury = car.category_slug === 'luxe' || car.category?.slug === 'luxe'
  
  return (
    <Link to={`/voitures/${car.slug}`}>
      <motion.article
        className="group relative bg-white border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full"
        whileHover={{ y: -8 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent z-10" />
          
          <img
            src={car.images?.[0]?.url || car.image || car.primary_image || '/placeholder-car.jpg'}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Top Badges */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
            {categoryName && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                isLuxury 
                  ? 'bg-accent-gold/90 text-white shadow-lg shadow-accent-gold/20' 
                  : 'bg-white/90 text-text-primary shadow-sm'
              }`}>
                {categoryName}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-text-secondary text-xs font-medium shadow-sm">
              {car.year}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Title Area */}
          <div className="mb-6">
            <h3 className="font-display font-black text-2xl text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {car.brand} <span className="font-light text-text-secondary">{car.model}</span>
            </h3>
          </div>

          {/* Specs Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 mt-auto">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="text-primary opacity-80 group-hover:opacity-100 transition-opacity"><GearIcon /></span>
              <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                {car.transmission === 'AUTOMATIC' ? t('car.automatic') : t('car.manual')}
              </span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="text-primary opacity-80 group-hover:opacity-100 transition-opacity"><FuelIcon /></span>
              <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                {t(`car.${car.fuel_type?.toLowerCase()}`)}
              </span>
            </div>
            
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="text-primary opacity-80 group-hover:opacity-100 transition-opacity"><SeatIcon /></span>
              <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                {car.seats} {t('fleet.seats')}
              </span>
            </div>
          </div>

          {/* Footer / Price */}
          <div className="pt-5 border-t border-gray-100 flex items-end justify-between">
            <div>
              <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">{t('car.pricePerDay')}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-text-primary leading-none">
                  {car.price_per_day}
                </span>
                <span className="text-sm text-text-secondary font-medium font-ui">{t('common.mad', 'MAD')}</span>
              </div>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 rtl:rotate-180">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

export default CarCard
