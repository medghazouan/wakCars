import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { generateBreadcrumbSchema } from '../../utils/seo.utils'
import { useLanguage } from '../../hooks/useLanguage'

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const Breadcrumbs = ({ items }) => {
  const { t } = useLanguage()
  const baseUrl = 'https://wakcars.ma'
  const schemaItems = items.map((item) => ({
    name: item.label,
    url: `${baseUrl}${item.href}`,
  }))

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema(schemaItems))}
        </script>
      </Helmet>

      <nav aria-label="Fil d'Ariane" className="py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-text-secondary">
                <ChevronIcon />
              </span>
              {index === items.length - 1 ? (
                <span className="text-text-primary font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default Breadcrumbs
