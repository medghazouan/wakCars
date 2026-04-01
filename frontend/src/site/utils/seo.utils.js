export const generateMetaTags = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  locale = 'fr_MA',
  alternateLocale = 'ar_MA'
}) => {
  const siteName = 'WAK Cars'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  
  return {
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: locale },
      { property: 'og:locale:alternate', content: alternateLocale },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
  }
}

export const generateAutoRentalSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: 'WAK Cars',
  description: 'Location de voiture à Marrakech, Maroc. Prix transparents, livraison aéroport gratuite.',
  url: 'https://wakcars.ma',
  logo: 'https://wakcars.ma/logo.svg',
  image: 'https://wakcars.ma/og-image.jpg',
  telephone: '+212524123456',
  email: 'contact@wakcars.ma',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '47 Avenue Mohammed V, Guéliz',
    addressLocality: 'Marrakech',
    postalCode: '40000',
    addressCountry: 'MA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 31.6295,
    longitude: -7.9811,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '09:00',
      closes: '17:00',
    },
  ],
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '320',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://facebook.com/wakcars',
    'https://instagram.com/wakcars',
  ],
})

export const generateCarSchema = (car) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: `${car.brand} ${car.model}`,
  description: car.description_fr,
  image: car.image,
  vehicleConfiguration: car.transmission,
  fuelType: car.fuel_type,
  seatingCapacity: car.seats,
  numberOfDoors: car.doors,
  modelDate: car.year,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'MAD',
    price: car.price_per_day,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    availability: car.status === 'AVAILABLE' 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
  },
})

export const generateFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

export const generateBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})
