import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { staggerContainer, fadeUp } from '../utils/motion'
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
            variants={staggerContainer(0.12)}
            initial="hidden"
            animate="visible"
          >
            {/* 404 */}
            <motion.h1
              className="text-[150px] md:text-[200px] font-display font-black text-primary leading-none mb-4"
              variants={fadeUp}
            >
              404
            </motion.h1>

            {/* Title */}
            <motion.h2
              className="text-display text-3xl md:text-4xl text-text-on-dark mb-4"
              variants={fadeUp}
            >
              {t('notFound.title')}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-gray-400 text-lg max-w-md mx-auto mb-10"
              variants={fadeUp}
            >
              {t('notFound.subtitle')}
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp}>
              <Link to="/">
                <Button variant="primary" size="lg">
                  {t('notFound.backHome')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound
