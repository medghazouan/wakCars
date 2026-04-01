import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useCreateReservation } from '../hooks/useReservation'
import { normalizeBookingSource } from '../utils/bookingSource'
import { useCars } from '../hooks/useCars'
import { useLanguage } from '../hooks/useLanguage'
import { formatPrice } from '../utils/formatPrice'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

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

const bookingSchema = z.object({
  car_id: z.number().min(1),
  pickup_date: z.string().min(1, 'Date requise'),
  dropoff_date: z.string().min(1, 'Date requise'),
  pickup_location_id: z.number().min(1, 'Point requis'),
  dropoff_location_id: z.number().min(1, 'Point requis'),
  has_gps: z.boolean().default(false),
  has_child_seat: z.boolean().default(false),
  guest_first_name: z.string().min(2, 'Prénom requis'),
  guest_last_name: z.string().min(2, 'Nom requis'),
  guest_email: z.string().email().optional().or(z.literal('')),
  guest_phone: z.string().min(10, 'Téléphone WhatsApp requis'),
})

const Booking = () => {
  const { t, getLocalizedField, currentLanguage } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [sameLocation, setSameLocation] = useState(true)

  const carId = searchParams.get('car')
  const createReservation = useCreateReservation()

  const { data: carData } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => api.get(`/cars/${carId}`),
    enabled: !!carId,
  })

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.get('/locations'),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
  })

  const { data: carsData } = useCars()
  const allCars = carsData?.data || []

  const locations = locationsData?.data || []
  const settings = settingsData?.data || {}

  const gpsPrice = parseFloat(settings.gps_daily_price) || 50
  const childSeatPrice = parseFloat(settings.child_seat_daily_price) || 30

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      car_id: parseInt(carId) || 0,
      has_gps: false,
      has_child_seat: false,
    },
  })

  const watchedValues = watch()
  const watchedCarId = watchedValues.car_id ? parseInt(watchedValues.car_id) : parseInt(carId)
  const car = allCars.find(c => c.id === watchedCarId) || carData?.data

  useEffect(() => {
    if (sameLocation && watchedValues.pickup_location_id) {
      setValue('dropoff_location_id', watchedValues.pickup_location_id)
    }
  }, [sameLocation, watchedValues.pickup_location_id, setValue])

  useEffect(() => {
    if (!carId) {
      navigate('/voitures', { replace: true })
    } else if (watchedValues.car_id === 0) {
      setValue('car_id', parseInt(carId))
    }
  }, [carId, navigate, setValue, watchedValues.car_id])

  const calculateDays = () => {
    if (!watchedValues.pickup_date || !watchedValues.dropoff_date) return 0
    const pickup = new Date(watchedValues.pickup_date)
    const dropoff = new Date(watchedValues.dropoff_date)
    const diff = dropoff - pickup
    if (isNaN(diff)) return 0
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const calculateTotal = () => {
    if (!car || !car.price_per_day) return 0
    const days = calculateDays()
    if (!days) return 0
    let total = Number(car.price_per_day) * days
    const validGpsPrice = isNaN(Number(gpsPrice)) ? 50 : Number(gpsPrice)
    const validChildPrice = isNaN(Number(childSeatPrice)) ? 30 : Number(childSeatPrice)
    if (watchedValues.has_gps) total += validGpsPrice * days
    if (watchedValues.has_child_seat) total += validChildPrice * days
    return isNaN(total) ? 0 : total
  }

  const days = calculateDays()
  const total = calculateTotal()

  const onSubmit = async (data) => {
    try {
      const result = await createReservation.mutateAsync({
        ...data,
        pickup_date: new Date(data.pickup_date).toISOString(),
        dropoff_date: new Date(data.dropoff_date).toISOString(),
        booking_source: normalizeBookingSource(searchParams.get('source')),
      })
      navigate('/reservation/confirmation', {
        state: {
          reservation: result.data,
          car,
          total,
        },
      })
    } catch (error) {
      console.error('Reservation error:', error)
    }
  }

  const steps = [
    { num: 1, label: t('booking.step1') },
    { num: 2, label: t('booking.step2') },
    { num: 3, label: t('booking.step3') },
  ]

  return (
    <>
      <MetaTags
        title={t('booking.title')}
        description={t('booking.metaDesc')}
        url="/reservation"
        noIndex
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('booking.title'), href: '/reservation' }]} />

          <div className="max-w-7xl ml-0 lg:mx-auto">
            {/* Header */}
            <div className="mb-14 relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                  {t('booking.heading')}
                </h1>
              </motion.div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-12 h-full">
              <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-stretch h-full">
                 
                {/* Left Sidebar: Vertical Steps Tracker */}
                <div className="hidden xl:flex flex-col w-64 shrink-0 sticky top-28 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-sm h-fit">
                   <h3 className="font-display font-bold text-lg mb-6 text-text-primary tracking-wide">{t('booking.progress')}</h3>
                   <div className="flex flex-col gap-6 relative">
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>
                      {steps.map((s, i) => (
                        <div key={s.num} className="flex items-start gap-4 z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                              step > s.num ? 'bg-primary text-white' : step === s.num ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {step > s.num ? <CheckIcon className="w-4 h-4" /> : s.num}
                          </div>
                          <div className="pt-1.5">
                             <span className={`text-sm font-medium block ${step >= s.num ? 'text-primary' : 'text-gray-500'}`}>
                               {s.label}
                             </span>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Mobile Horizontal Steps Indicator (Fallback) */}
                <div className="flex xl:hidden items-center justify-center gap-4 w-full mb-8">
                  {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center">
                      <div
                        className={`w-10 h-10 flex items-center justify-center font-bold rounded-full ${
                          step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step > s.num ? <CheckIcon className="w-5 h-5" /> : s.num}
                      </div>
                      <span className={`ml-2 text-sm hidden sm:inline ${step >= s.num ? 'text-primary' : 'text-gray-500'}`}>
                        {s.label}
                      </span>
                      {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 sm:mx-4 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Main Form */}
                <div className="flex-1 w-full bg-white border border-gray-100 p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Dates & Location */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <h2 className="font-display font-bold text-xl mb-6">
                          {t('booking.step1')}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <Input
                            type="date"
                            label={t('booking.pickupDate')}
                            {...register('pickup_date')}
                            error={errors.pickup_date?.message}
                          />
                          <Input
                            type="date"
                            label={t('booking.dropoffDate')}
                            {...register('dropoff_date')}
                            error={errors.dropoff_date?.message}
                          />
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm text-text-secondary mb-2">
                            {t('booking.pickupLocation')}
                          </label>
                          <select
                            {...register('pickup_location_id', { valueAsNumber: true })}
                            className="w-full p-3 border border-gray-200 focus:border-primary focus:outline-none"
                          >
                            <option value="">-- Sélectionner --</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {getLocalizedField(loc, 'name')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-3 mt-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameLocation}
                            onChange={(e) => setSameLocation(e.target.checked)}
                            className="w-5 h-5 accent-primary"
                          />
                          <span className="text-text-secondary">
                            {t('booking.sameLocation')}
                          </span>
                        </label>

                        {!sameLocation && (
                          <div className="mt-4">
                            <label className="block text-sm text-text-secondary mb-2">
                              {t('booking.dropoffLocation')}
                            </label>
                            <select
                              {...register('dropoff_location_id', { valueAsNumber: true })}
                              className="w-full p-3 border border-gray-200 focus:border-primary focus:outline-none"
                            >
                              <option value="">-- Sélectionner --</option>
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {getLocalizedField(loc, 'name')}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="mt-8">
                          <Button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={!watchedValues.pickup_date || !watchedValues.dropoff_date || !watchedValues.pickup_location_id || (!watchedValues.car_id && !carId)}
                            className="w-full"
                          >
                            {t('booking.next')}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Options */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <h2 className="font-display font-bold text-xl mb-6">
                          {t('booking.options')}
                        </h2>

                        <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 border border-gray-200 cursor-pointer hover:border-primary">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                {...register('has_gps')}
                                className="w-5 h-5 accent-primary"
                              />
                              <div>
                                <p className="font-medium">{t('booking.gps')}</p>
                                <p className="text-sm text-text-secondary">
                                  {gpsPrice} {t('common.mad')} {t('booking.perDayExtra')}
                                </p>
                              </div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 border border-gray-200 cursor-pointer hover:border-primary">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                {...register('has_child_seat')}
                                className="w-5 h-5 accent-primary"
                              />
                              <div>
                                <p className="font-medium">{t('booking.childSeat')}</p>
                                <p className="text-sm text-text-secondary">
                                  {childSeatPrice} {t('common.mad')} {t('booking.perDayExtra')}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="flex gap-4 mt-8">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep(1)}
                            className="flex-1"
                          >
                            {t('booking.back')}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setStep(3)}
                            className="flex-1"
                          >
                            {t('booking.next')}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Contact Info */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <h2 className="font-display font-bold text-xl mb-6">
                          {t('booking.step3')}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <Input
                            label={t('booking.firstName')}
                            {...register('guest_first_name')}
                            error={errors.guest_first_name?.message}
                          />
                          <Input
                            label={t('booking.lastName')}
                            {...register('guest_last_name')}
                            error={errors.guest_last_name?.message}
                          />
                        </div>

                        <div className="mt-6">
                          <Input
                            type="tel"
                            label={t('booking.phone')}
                            {...register('guest_phone')}
                            error={errors.guest_phone?.message}
                          />
                        </div>

                        <div className="mt-6">
                          <Input
                            type="email"
                            label={t('booking.email')}
                            {...register('guest_email')}
                            error={errors.guest_email?.message}
                          />
                        </div>

                        <div className="flex gap-4 mt-8">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep(2)}
                            className="flex-1"
                          >
                            {t('booking.back')}
                          </Button>
                          <Button
                            type="submit"
                            loading={createReservation.isPending}
                            className="flex-1"
                          >
                            {createReservation.isPending ? t('booking.processing') : t('booking.confirm')}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Summary Sidebar (Soft & Light) */}
                <div className="w-full xl:w-[420px] shrink-0 bg-white text-text-primary p-6 md:p-8 flex flex-col lg:sticky lg:top-28 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-sm self-stretch justify-center transition-all duration-500">
                  {car && days === 0 ? (
                    <motion.div 
                      key="car-details"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full"
                    >
                       <div className="aspect-[4/3] bg-background-light border border-gray-100 p-4 mb-6 relative group flex items-center justify-center rounded-sm">
                          <img 
                            src={car.image || car.primary_image || '/placeholder-car.jpg'} 
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-contain mix-blend-multiply" 
                          />
                          <div className="absolute top-4 right-4 px-3 py-1 bg-white/60 backdrop-blur-md text-text-primary text-xs font-bold font-ui rounded">
                            {car.year}
                          </div>
                          {car.category_name_fr && (
                             <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-bold font-ui rounded uppercase tracking-wider">
                                {currentLanguage === 'ar' ? (car.category_name_ar || car.category_name_fr) : car.category_name_fr}
                             </div>
                          )}
                       </div>

                       <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter mb-4 leading-none text-text-primary">
                         {car.brand} <span className="font-light text-gray-400">{car.model}</span>
                       </h2>

                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-2">
                          <div className="flex items-center gap-1.5 text-text-secondary">
                             <span className="text-primary"><GearIcon /></span>
                             <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                               {car.transmission === 'AUTOMATIC' ? t('car.automatic') : t('car.manual')}
                             </span>
                          </div>
                          <div className="w-1 h-1 bg-gray-300 rounded-full" />
                          <div className="flex items-center gap-1.5 text-text-secondary">
                             <span className="text-primary"><FuelIcon /></span>
                             <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                                {t(`car.${car.fuel_type?.toLowerCase()}`)}
                             </span>
                          </div>
                          <div className="w-1 h-1 bg-gray-300 rounded-full" />
                          <div className="flex items-center gap-1.5 text-text-secondary">
                             <span className="text-primary"><SeatIcon /></span>
                             <span className="text-[11px] font-bold uppercase tracking-widest font-ui">
                                {car.seats} {t('fleet.seats')}
                             </span>
                          </div>
                       </div>
                    </motion.div>
                  ) : null}

                  {days > 0 && (
                    <motion.div 
                      key="receipt-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full h-full flex flex-col justify-center py-4"
                    >
                      <div className="mb-10 text-center">
                         <h3 className="font-display font-black text-3xl uppercase tracking-wider text-text-primary mb-2">
                           {t('booking.summary')}
                         </h3>
                         <p className="text-text-secondary font-bold text-lg">{car?.brand} {car?.model}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-base font-bold text-text-secondary pb-4 border-b border-gray-100">
                          <span className="uppercase tracking-widest text-[11px]">{t('booking.days')}</span>
                          <span className="text-text-primary">{days} {t('booking.days')}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-text-secondary pb-4 border-b border-gray-100">
                          <span className="uppercase tracking-widest text-[11px]">{t('booking.basePrice')}</span>
                          <span className="text-text-primary">{formatPrice(car?.price_per_day * days)} {t('common.mad')}</span>
                        </div>
                        {watchedValues.has_gps && (
                          <div className="flex justify-between text-base font-bold text-text-secondary pb-4 border-b border-gray-100">
                            <span className="uppercase tracking-widest text-[11px]">{t('booking.gps')}</span>
                            <span className="text-text-primary">{formatPrice(gpsPrice * days)} {t('common.mad')}</span>
                          </div>
                        )}
                        {watchedValues.has_child_seat && (
                          <div className="flex justify-between text-base font-bold text-text-secondary pb-4 border-b border-gray-100">
                            <span className="uppercase tracking-widest text-[11px]">{t('booking.childSeat')}</span>
                            <span className="text-text-primary">{formatPrice(childSeatPrice * days)} {t('common.mad')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between font-black text-3xl pt-8 mt-4 border-t-2 border-primary/20">
                        <span className="font-display uppercase tracking-widest text-text-primary">{t('booking.total')}</span>
                        <span className="text-primary font-ui">{formatPrice(total)} {t('common.mad')}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Booking
