import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { staggerContainer, fadeUp, fadeLeft, accentGrow } from '../../utils/motion'
import api from '../../services/api'
import Skeleton from '../ui/Skeleton'
import Button from '../ui/Button'

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const BlogTeaser = () => {
  const { t, currentLanguage, getLocalizedField } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  const { data, isLoading } = useQuery({
    queryKey: ['blog', 'teaser', currentLanguage],
    queryFn: () => api.get('/blog', { params: { limit: 3, lang: currentLanguage } }),
  })

  const posts = data?.data || []

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
              {t('blog.title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {t('blog.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Posts Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton variant="image" className="mb-4" />
                <Skeleton variant="title" className="mb-2" />
                <Skeleton className="w-3/4" />
              </div>
            ))
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="group"
                variants={fadeUp}
              >
                <Link to={`/blog/${getLocalizedField(post, 'slug')}`}>
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden mb-4">
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'}
                      alt={getLocalizedField(post, 'title')}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {post.category && (
                      <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary text-white text-xs font-ui uppercase tracking-wider px-3 py-1">
                        {t(`blog.categoryMap.${post.category}`, { defaultValue: post.category })}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-primary transition-colors mb-2">
                    {getLocalizedField(post, 'title')}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                    {getLocalizedField(post, 'excerpt')}
                  </p>

                  {/* Read More */}
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-ui font-semibold uppercase tracking-wider group-hover:gap-3 transition-all">
                    {t('blog.readMore')}
                    <span className="rtl:rotate-180"><ArrowIcon /></span>
                  </span>
                </Link>
              </motion.article>
            ))
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link to="/blog">
            <Button variant="secondary">
              {t('blog.title')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default BlogTeaser
