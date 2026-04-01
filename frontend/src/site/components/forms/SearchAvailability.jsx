import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../../hooks/useLanguage'
import { getLocations } from '../../services/locations.service'
import Button from '../ui/Button'

const SearchAvailability = ({ className = '' }) => {
  const { t, getLocalizedField } = useLanguage()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    pickupDate: '',
    dropoffDate: '',
    pickupLocation: '',
  })

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  })

  const locations = locationsData?.data || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (formData.pickupDate) params.set('from', formData.pickupDate)
    if (formData.dropoffDate) params.set('to', formData.dropoffDate)
    if (formData.pickupLocation) params.set('location', formData.pickupLocation)
    navigate(`/voitures?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bg-white/10 backdrop-blur-md p-6 md:p-8 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pickup Date */}
        <div className="relative">
          <label 
            htmlFor="pickupDate" 
            className="block text-xs font-ui uppercase tracking-wider text-white/70 mb-2"
          >
            {t('booking.pickupDate')}
          </label>
          <input
            type="date"
            id="pickupDate"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            min={today}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-primary focus:outline-none"
            required
          />
        </div>

        {/* Dropoff Date */}
        <div className="relative">
          <label 
            htmlFor="dropoffDate" 
            className="block text-xs font-ui uppercase tracking-wider text-white/70 mb-2"
          >
            {t('booking.dropoffDate')}
          </label>
          <input
            type="date"
            id="dropoffDate"
            name="dropoffDate"
            value={formData.dropoffDate}
            onChange={handleChange}
            min={formData.pickupDate || today}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-primary focus:outline-none"
            required
          />
        </div>

        {/* Pickup Location */}
        <div className="relative">
          <label 
            htmlFor="pickupLocation" 
            className="block text-xs font-ui uppercase tracking-wider text-white/70 mb-2"
          >
            {t('booking.pickupLocation')}
          </label>
          <select
            id="pickupLocation"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white focus:border-primary focus:outline-none appearance-none cursor-pointer"
          >
            <option value="" className="text-background-dark">{t('selectLocation')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="text-background-dark">
                {getLocalizedField(loc, 'name')}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
          >
            {t('hero.cta')}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default SearchAvailability
