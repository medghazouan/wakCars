import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { categoriesService } from '../../services/cars.service'
import { staggerContainer, fadeUp, fadeLeft, accentGrow } from '../../utils/motion'

const categoryImages = {
  citadine:   'https://res.cloudinary.com/dbsgzwmf6/image/upload/q_auto/f_auto/v1776075907/citadine_oc8bkl.jpg', // small, simple city car
  berline:     'https://images.unsplash.com/photo-1657459562745-77cc871421cf?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',    // sedan / berline
  'suv-4x4':       'https://res.cloudinary.com/dbsgzwmf6/image/upload/q_auto/f_auto/v1775841046/audi_qwqcur.jpg',  // off-road 4x4
  luxe:        'https://res.cloudinary.com/dbsgzwmf6/image/upload/q_auto/f_auto/v1775840844/porche_bcjsqp.jpg',  // luxury car
  utilitaire:  'https://res.cloudinary.com/dbsgzwmf6/image/upload/q_auto/f_auto/v1775840956/big_awmv1n.jpg',    // minivan
};

const CategoryCard = ({ category, getLocalizedField }) => {
  const name = getLocalizedField(category, 'name')
  const slug = category.slug
  console.log(slug)
  const image = categoryImages[slug]

  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/voitures?category=${slug}`}
        className="group relative block h-[420px] md:h-[500px] overflow-hidden"
      >
        {/* Background Image */}
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-all duration-500 group-hover:from-black/70 group-hover:via-black/20" />

        {/* Category Name - Top Left */}
        <div className="absolute top-8 left-8">
          <h3 className="text-white text-3xl md:text-4xl font-display font-bold drop-shadow-lg">
            {name}
          </h3>
        </div>

        {/* Arrow Button - Bottom Right */}
        <div className="absolute bottom-8 right-8">
          <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden">
            {/* Background square */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transition-all duration-500 group-hover:bg-primary group-hover:scale-110" />
            
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-primary border-l-[20px] border-l-transparent transition-all duration-300 opacity-0 group-hover:opacity-100" />
            
            {/* Arrow pointing top-right */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="relative z-10 text-white transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
            >
              <path 
                d="M7 17L17 7M17 7H8M17 7V16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Side accent line */}
        <div className="absolute top-0 left-0 w-1 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
      </Link>
    </motion.div>
  )
}

const CategoriesSection = () => {
  const { t, getLocalizedField } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  const categories = data?.data || []

  if (isLoading) {
    return (
      <section className="section-padding bg-background-light">
        <div className="container-wak">
          <div className="mb-12">
            <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[420px] md:h-[500px] bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section ref={ref} className="section-padding bg-background-light">
      <div className="container-wak">
        {/* Header */}
        <div className="mb-14 relative">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div
              className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block origin-top"
              variants={accentGrow}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            />
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
              {t('categories.title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {t('categories.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              getLocalizedField={getLocalizedField}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default CategoriesSection
