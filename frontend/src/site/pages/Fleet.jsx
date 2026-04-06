import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCars, useCategories } from '../hooks/useCars'
import { useLanguage } from '../hooks/useLanguage'
import { fadeLeft, accentGrow, staggerContainer, fadeUp } from '../utils/motion'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import CarCard from '../components/ui/CarCard'
import { CarCardSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'

const Fleet = () => {
  const { t, getLocalizedField } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    transmission: searchParams.get('transmission') || '',
    fuel: searchParams.get('fuel') || '',
    seats: searchParams.get('seats') || '',
    sort: searchParams.get('sort') || 'price_asc',
  })

  const { data: carsData, isLoading: carsLoading } = useCars({
    category_slug: filters.category || undefined,
    transmission: filters.transmission || undefined,
  })

  const { data: categoriesData } = useCategories()

  const cars = carsData?.data || []
  const categories = categoriesData?.data || []

  const sortedCars = useMemo(() => {
    let sorted = [...cars]
    
    // Client-side filtering for properties not handled by API
    if (filters.fuel) {
      sorted = sorted.filter(c => c.fuel_type === filters.fuel)
    }
    
    if (filters.seats) {
      sorted = sorted.filter(c => c.seats >= parseInt(filters.seats))
    }

    // Client-side sorting
    if (filters.sort === 'price_asc') {
      sorted.sort((a, b) => a.price_per_day - b.price_per_day)
    } else if (filters.sort === 'price_desc') {
      sorted.sort((a, b) => b.price_per_day - a.price_per_day)
    }
    
    return sorted
  }, [cars, filters.fuel, filters.seats, filters.sort])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  return (
    <>
      <MetaTags
        title={t('fleet.title')}
        description={t('fleet.subtitle')}
        url="/voitures"
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('fleet.title'), href: '/voitures' }]} />

          {/* Header */}
          <div className="mb-14 relative">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block origin-top"
                variants={accentGrow}
                initial="hidden"
                animate="visible"
              />
              <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                {t('fleet.heading')}
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                {t('fleet.intro')}
              </p>
            </motion.div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-8">
            
            {/* Split Left: Filters Vertical Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[100px] z-10">
              <motion.div 
                className="bg-white/95 backdrop-blur-xl shadow-2xl shadow-primary/5 border border-gray-100 p-5 md:p-6"
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                {/* Filter Label */}
                <div className="flex w-full items-center gap-4 text-sm font-ui font-bold uppercase tracking-widest text-primary border-b border-gray-100 pb-5 mb-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                  </div>
                  <span>{t('fleet.filterTitle')}</span>
                </div>

                {/* Filter Selects Stack */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4">
                  {/* Category */}
                  <div className="relative group col-span-2 sm:col-span-1 lg:col-span-1">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full appearance-none bg-gray-50/50 border-2 border-transparent hover:border-primary/20 focus:border-primary focus:bg-white text-text-primary px-4 py-3.5 pr-8 rtl:pr-4 rtl:pl-8 text-[13px] md:text-sm font-medium transition-all duration-300 outline-none cursor-pointer rounded-xl"
                    >
                      <option value="">{t('fleet.filterAll')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {getLocalizedField(cat, 'name')}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </div>

                  {/* Transmission */}
                  <div className="relative group">
                    <select
                      value={filters.transmission}
                      onChange={(e) => handleFilterChange('transmission', e.target.value)}
                      className="w-full appearance-none bg-gray-50/50 border-2 border-transparent hover:border-primary/20 focus:border-primary focus:bg-white text-text-primary px-4 py-3.5 pr-8 rtl:pr-4 rtl:pl-8 text-[13px] md:text-sm font-medium transition-all duration-300 outline-none cursor-pointer rounded-xl"
                    >
                      <option value="">{t('fleet.filterTransmission')}</option>
                      <option value="MANUAL">{t('fleet.filterManual')}</option>
                      <option value="AUTOMATIC">{t('fleet.filterAutomatic')}</option>
                    </select>
                    <svg className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </div>

                  {/* Fuel */}
                  <div className="relative group">
                    <select
                      value={filters.fuel}
                      onChange={(e) => handleFilterChange('fuel', e.target.value)}
                      className="w-full appearance-none bg-gray-50/50 border-2 border-transparent hover:border-primary/20 focus:border-primary focus:bg-white text-text-primary px-4 py-3.5 pr-8 rtl:pr-4 rtl:pl-8 text-[13px] md:text-sm font-medium transition-all duration-300 outline-none cursor-pointer rounded-xl"
                    >
                      <option value="">{t('fleet.filterFuel')}</option>
                      <option value="DIESEL">{t('car.diesel')}</option>
                      <option value="ESSENCE">{t('car.essence')}</option>
                      <option value="HYBRID">{t('car.hybrid')}</option>
                      <option value="ELECTRIC">{t('car.electric')}</option>
                    </select>
                    <svg className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </div>

                  {/* Seats */}
                  <div className="relative group">
                    <select
                      value={filters.seats}
                      onChange={(e) => handleFilterChange('seats', e.target.value)}
                      className="w-full appearance-none bg-gray-50/50 border-2 border-transparent hover:border-primary/20 focus:border-primary focus:bg-white text-text-primary px-4 py-3.5 pr-8 rtl:pr-4 rtl:pl-8 text-[13px] md:text-sm font-medium transition-all duration-300 outline-none cursor-pointer rounded-xl"
                    >
                      <option value="">{t('fleet.filterSeats')}</option>
                      <option value="4">4+ {t('fleet.seats')}</option>
                      <option value="5">5+ {t('fleet.seats')}</option>
                      <option value="7">7+ {t('fleet.seats')}</option>
                    </select>
                    <svg className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </div>

                  {/* Sort */}
                  <div className="relative group col-span-2 sm:col-span-1 lg:col-span-1 lg:mt-4">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full appearance-none bg-primary/5 text-primary border-2 border-primary/10 hover:border-primary/30 focus:border-primary px-4 py-3.5 pr-8 rtl:pr-4 rtl:pl-8 text-[13px] md:text-base font-black transition-all duration-300 outline-none cursor-pointer rounded-xl tracking-wide uppercase"
                    >
                      <option value="price_asc">{t('fleet.sortPriceAsc')}</option>
                      <option value="price_desc">{t('fleet.sortPriceDesc')}</option>
                    </select>
                    <svg className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Split Right: Cards Grid */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {carsLoading ? (
                  Array(6).fill(0).map((_, i) => <CarCardSkeleton key={i} />)
                ) : sortedCars.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl">
                    <p className="text-text-secondary text-lg mb-6">{t('common.error')}</p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setFilters({ category: '', transmission: '', fuel: '', seats: '', sort: 'price_asc' })
                        setSearchParams({})
                      }}
                    >
                      {t('common.retry')}
                    </Button>
                  </div>
                ) : (
                  sortedCars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min((index % 6) * 0.08, 0.4), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <CarCard car={car} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Fleet
