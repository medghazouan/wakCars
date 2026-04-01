import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../hooks/useLanguage'

const MetaTags = ({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  schema,
}) => {
  const { currentLanguage } = useLanguage()
  const siteName = 'WAK Cars'
  const baseUrl = 'https://wakcars.ma'
  const fullTitle = title ? `${title} | ${siteName}` : `Location Voiture Marrakech — ${siteName} | Tarifs Transparents`
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const ogImage = image || `${baseUrl}/og-image.jpg`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLanguage === 'ar' ? 'ar_MA' : 'fr_MA'} />
      <meta property="og:locale:alternate" content={currentLanguage === 'ar' ? 'fr_MA' : 'ar_MA'} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="fr" href={`${baseUrl}${url || ''}`} />
      <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar${url || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${url || ''}`} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}

export default MetaTags
