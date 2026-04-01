import { useLocation, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { formatPrice } from '../utils/formatPrice'
import { generateBookingWhatsAppLink } from '../utils/generateWhatsAppLink'
import MetaTags from '../components/seo/MetaTags'
import Button from '../components/ui/Button'

const CheckIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const BookingConfirm = () => {
  const { t } = useLanguage()
  const location = useLocation()
  const { reservation, car, total } = location.state || {}

  if (!reservation) {
    return <Navigate to="/reservation" replace />
  }

  const reference = `WAK-${reservation.id?.toString().padStart(4, '0')}`
  
  const whatsappLink = generateBookingWhatsAppLink({
    carName: `${car?.brand} ${car?.model}`,
    pickupDate: new Date(reservation.pickup_date).toLocaleDateString('fr-FR'),
    dropoffDate: new Date(reservation.dropoff_date).toLocaleDateString('fr-FR'),
    pickupLocation: 'Point de collecte',
    totalAmount: formatPrice(total),
    reference,
  })

  return (
    <>
      <MetaTags
        title={t('confirmation.title')}
        noIndex
      />

      <div className="pt-32 pb-24 bg-background-light min-h-screen flex items-center justify-center">
        <div className="container-wak px-4">
          <motion.div
            className="max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Main Receipt Card */}
            <div className="bg-white rounded-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
               {/* Red Top Accent */}
               <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

               <div className="p-8 md:p-12 lg:p-16">
                 {/* Success Header */}
                 <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                     <CheckIcon />
                   </div>
                   <h1 className="text-display text-4xl md:text-5xl text-text-primary mb-3">
                     {t('confirmation.title')}
                   </h1>
                   <p className="text-text-secondary text-lg max-w-md">
                     {t('confirmation.subtitle')}
                   </p>
                 </div>

                 {/* Information Grid Container */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    
                    {/* Left Col: Reference Box */}
                    <div className="bg-background-light p-8 rounded-sm border border-gray-100 flex flex-col justify-center h-full">
                      <p className="text-sm text-text-secondary uppercase tracking-widest font-bold mb-2">
                        {t('confirmation.reference')}
                      </p>
                      <p className="text-4xl font-display font-black text-primary tracking-wider">
                        {reference}
                      </p>
                    </div>

                    {/* Right Col: Details Summary */}
                    <div className="flex flex-col justify-center space-y-4 text-sm font-medium">
                       <div className="flex justify-between pb-3 border-b border-gray-100">
                         <span className="text-text-secondary uppercase tracking-wider text-[11px] font-bold">{t('confirmation.vehicle')}</span>
                         <span className="text-text-primary font-bold">{car?.brand} {car?.model}</span>
                       </div>
                       <div className="flex justify-between pb-3 border-b border-gray-100">
                         <span className="text-text-secondary uppercase tracking-wider text-[11px] font-bold">{t('confirmation.pickup')}</span>
                         <span className="text-text-primary text-right font-bold w-48">
                           {new Date(reservation.pickup_date).toLocaleDateString('fr-FR', {
                             day: 'numeric', month: 'long'
                           })}
                         </span>
                       </div>
                       <div className="flex justify-between pb-3 border-b border-gray-100">
                         <span className="text-text-secondary uppercase tracking-wider text-[11px] font-bold">{t('confirmation.dropoff')}</span>
                         <span className="text-text-primary text-right font-bold w-48">
                           {new Date(reservation.dropoff_date).toLocaleDateString('fr-FR', {
                             day: 'numeric', month: 'long'
                           })}
                         </span>
                       </div>
                       <div className="flex justify-between pt-2">
                         <span className="text-text-primary font-display font-black text-xl uppercase tracking-widest">
                           {t('booking.total')}
                         </span>
                         <span className="font-display font-black text-2xl text-primary">{formatPrice(total)} MAD</span>
                       </div>
                    </div>

                 </div>

                 {/* Actions */}
                 <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-3 bg-whatsapp text-white py-4 px-8 font-ui font-bold uppercase tracking-widest hover:bg-green-600 transition-colors rounded-sm shadow-md shadow-whatsapp/20 text-center"
                    >
                      <WhatsAppIcon />
                      {t('confirmation.whatsappConfirm')}
                    </a>
                    
                    <Link to="/" className="flex-1">
                      <Button variant="secondary" className="w-full py-4 h-full uppercase tracking-widest font-bold border-gray-200 hover:border-text-primary hover:bg-background-light text-text-primary">
                        {t('confirmation.backHome')}
                      </Button>
                    </Link>
                 </div>
                 
                 <p className="text-center text-text-secondary text-sm font-medium mt-6">
                   {t('confirmation.whatsappDesc')}
                 </p>

               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default BookingConfirm
