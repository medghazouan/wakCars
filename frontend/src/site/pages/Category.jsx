import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCars, useCategories } from '../hooks/useCars'
import { useLanguage } from '../hooks/useLanguage'
import { fadeLeft, accentGrow, staggerContainer, fadeUp } from '../utils/motion'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import CarCard from '../components/ui/CarCard'
import { CarCardSkeleton } from '../components/ui/Skeleton'

const Category = () => {
  const { slug } = useParams()
  const { t, getLocalizedField } = useLanguage()

  const { data: carsData, isLoading } = useCars({ category_slug: slug })
  const { data: categoriesData } = useCategories()

  const cars = carsData?.data || []
  const categories = categoriesData?.data || []
  const category = categories.find((c) => c.slug === slug)

  const categoryName = category ? getLocalizedField(category, 'name') : slug
  const categoryDesc = category ? getLocalizedField(category, 'desc') : ''

  return (
    <>
      <MetaTags
        title={`${categoryName} - Location de Voiture`}
        description={categoryDesc || `Location de ${categoryName} à Marrakech`}
        url={`/voitures/categorie/${slug}`}
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs
            items={[
              { label: t('fleet.title'), href: '/voitures' },
              { label: categoryName, href: `/voitures/categorie/${slug}` },
            ]}
          />

          {/* Header */}
          <div className="mb-12 relative">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block origin-top"
                variants={accentGrow}
                initial="hidden"
                animate="visible"
              />
              <h1 className="text-display text-4xl md:text-5xl text-text-primary mb-4">
                {categoryName}
              </h1>
              {categoryDesc && (
                <p className="text-text-secondary text-lg max-w-2xl">{categoryDesc}</p>
              )}
            </motion.div>
          </div>

          {/* Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <CarCardSkeleton key={i} />)
            ) : cars.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-text-secondary">{t('common.error')}</p>
              </div>
            ) : (
              cars.map((car) => (
                <motion.div
                  key={car.id}
                  variants={fadeUp}
                >
                  <CarCard car={car} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Category
