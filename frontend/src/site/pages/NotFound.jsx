import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import MetaTags from '../components/seo/MetaTags'
import Button from '../components/ui/Button'

const NotFound = () => {
  const { t } = useLanguage()

  return (
    <>
      <MetaTags
        title={t('notFound.title')}
        noIndex
      />

      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="container-wak text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 */}
            <h1 className="text-[150px] md:text-[200px] font-display font-black text-primary leading-none mb-4">
              404
            </h1>

            {/* Title */}
            <h2 className="text-display text-3xl md:text-4xl text-text-on-dark mb-4">
              {t('notFound.title')}
            </h2>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
              {t('notFound.subtitle')}
            </p>

            {/* CTA */}
            <Link to="/">
              <Button variant="primary" size="lg">
                {t('notFound.backHome')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound
