export const formatPrice = (price, locale = 'fr-MA') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export const formatPriceWithCurrency = (price, currency = 'MAD', locale = 'fr-MA') => {
  return `${formatPrice(price, locale)} ${currency}`
}

export default formatPrice
