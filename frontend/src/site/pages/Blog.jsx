import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../hooks/useLanguage'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const Blog = () => {
  const { t, currentLanguage, getLocalizedField } = useLanguage()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', currentLanguage, page],
    queryFn: () => api.get('/blog', { params: { lang: currentLanguage, page, limit: 9 } }),
  })

  const posts = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <>
      <MetaTags
        title={t('blog.title')}
        description={t('blog.subtitle')}
        url="/blog"
      />

      <div className="pt-24 pb-16 bg-background-light min-h-screen">
        <div className="container-wak">
          <Breadcrumbs items={[{ label: t('blog.title'), href: '/blog' }]} />

          {/* Header */}
          <div className="mb-14 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
              <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
                {t('blog.title')}
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                {t('blog.subtitle')}
              </p>
            </motion.div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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

                    {/* Date */}
                    {post.published_at && (
                      <p className="text-text-secondary text-sm mb-2">
                        {new Date(post.published_at).toLocaleDateString(
                          currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </p>
                    )}

                    {/* Title */}
                    <h2 className="font-display font-bold text-xl text-text-primary group-hover:text-primary transition-colors mb-2">
                      {getLocalizedField(post, 'title')}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-text-secondary text-sm line-clamp-2 mb-4">
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </Button>
              <span className="flex items-center px-4 text-text-secondary">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Blog
