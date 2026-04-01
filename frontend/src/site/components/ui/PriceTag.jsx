import { formatPrice } from '../../utils/formatPrice'
import { useLanguage } from '../../hooks/useLanguage'

const PriceTag = ({ 
  price, 
  currency = 'MAD', 
  period = '/jour',
  size = 'md',
  showFrom = false,
}) => {
  const { t } = useLanguage()
  
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className="flex items-baseline gap-1">
      {showFrom && (
        <span className="text-text-secondary text-sm">
          {t('car.priceFrom')}
        </span>
      )}
      <span className={`text-price ${sizes[size]}`}>
        {formatPrice(price)}
      </span>
      <span className="text-text-secondary text-sm">
        {currency}{period}
      </span>
    </div>
  )
}

export default PriceTag
