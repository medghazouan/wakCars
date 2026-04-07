import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { fadeLeft, accentGrow, scaleUp, fadeUp } from '../utils/motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import api from '../services/api'
import MetaTags from '../components/seo/MetaTags'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const BlogPost = () => {
  const { slug } = useParams()
  const { t, currentLanguage, getLocalizedField } = useLanguage()

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog', slug, currentLanguage],
    queryFn: () => api.get(`/blog/${slug}`, { params: { lang: currentLanguage } }),
  })

  const { data: otherBlogsData } = useQuery({
    queryKey: ['blog', currentLanguage, 'recent'],
    queryFn: () => api.get('/blog', { params: { lang: currentLanguage, page: 1, limit: 10 } }),
  })

  if (isLoading) return <LoadingSpinner />
  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">{t('common.error')}</p>
          <Link to="/blog">
            <Button variant="secondary">{t('blog.title')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const post = data.data



  const otherPosts = otherBlogsData?.data?.filter(p => getLocalizedField(p, 'slug') !== getLocalizedField(post, 'slug')).slice(0, 6) || []

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: getLocalizedField(post, 'title'),
    description: getLocalizedField(post, 'excerpt'),
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'WAK Cars',
    },
    publisher: {
      '@type': 'Organization',
      name: 'WAK Cars',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wakcars.ma/logo.svg',
      },
    },
  }

  return (
    <>
      <MetaTags
        title={getLocalizedField(post, 'title')}
        description={getLocalizedField(post, 'excerpt')}
        image={post.cover_image}
        url={`/blog/${slug}`}
        type="article"
        schema={schema}
      />

      <div className="pt-24 pb-16 bg-background-light">
        <article className="container-wak">
          <Breadcrumbs
            items={[
              { label: t('blog.title'), href: '/blog' },
              { label: getLocalizedField(post, 'title'), href: `/blog/${slug}` },
            ]}
          />

          <div className="w-full mt-8">
            <div className="flex flex-col justify-start">
              {/* Header */}
              <motion.header
                className="mb-10 relative"
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                {/* Decorative line */}
                <motion.div
                  className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-full bg-primary rounded-full hidden md:block origin-top"
                  variants={accentGrow}
                  initial="hidden"
                  animate="visible"
                />

                {/* Category */}
                {post.category && (
                  <span className="inline-block bg-primary/10 text-primary text-xs font-ui font-semibold uppercase tracking-widest px-4 py-2 mb-6 rounded-sm">
                    {t(`blog.categoryMap.${post.category}`, { defaultValue: post.category })}
                  </span>
                )}

                {/* Title */}
                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6 leading-[1.15]">
                  {getLocalizedField(post, 'title')}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-6 text-gray-400 text-sm font-ui tracking-wide">
                  {post.published_at && (
                    <time dateTime={post.published_at} className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {new Date(post.published_at).toLocaleDateString(
                        currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )}
                    </time>
                  )}
                  <span className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    WAK Cars
                  </span>
                </div>
              </motion.header>

              {/* Cover Image */}
              {post.cover_image && (
                <motion.div
                  className="mb-12 relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 group"
                  variants={scaleUp}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                  <img
                    src={post.cover_image}
                    alt={getLocalizedField(post, 'title')}
                    className="w-full aspect-[21/9] lg:aspect-[3/1] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                className="blog-content-rich relative w-full"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <div dangerouslySetInnerHTML={{ __html: getLocalizedField(post, 'content') }} className="w-full" />
              </motion.div>
            </div>
          </div>

          {/* Other Blogs Section */}
          {otherPosts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-gray-100 relative">
              <div className="flex justify-between items-end mb-10 px-4 md:px-0">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                   {t('blog.recent', 'Articles Récents')}
                </h3>
                <Link to="/blog" className="text-primary hover:underline hidden md:flex items-center gap-2 font-ui uppercase tracking-wider text-sm font-semibold">
                  {t('blog.viewAll', 'Voir tout')} <span className="rtl:rotate-180"><ArrowIcon /></span>
                </Link>
              </div>
              
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="pb-12 px-4 md:px-0"
              >
                {otherPosts.map((otherPost) => (
                  <SwiperSlide key={otherPost.id} className="!h-auto">
                    <motion.article className="group bg-white h-full flex flex-col border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                      <Link to={`/blog/${getLocalizedField(otherPost, 'slug')}`} className="flex flex-col h-full">
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={otherPost.cover_image || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'}
                            alt={getLocalizedField(otherPost, 'title')}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {otherPost.category && (
                            <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary text-white text-[10px] font-ui uppercase tracking-wider px-2 py-1">
                              {t(`blog.categoryMap.${otherPost.category}`, { defaultValue: otherPost.category })}
                            </span>
                          )}
                        </div>

                        {/* Content block */}
                        <div className="p-6 flex flex-col flex-grow">
                          {otherPost.published_at && (
                            <p className="text-gray-400 text-xs tracking-wider uppercase mb-3">
                              {new Date(otherPost.published_at).toLocaleDateString(
                                currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR',
                                { day: 'numeric', month: 'long', year: 'numeric' }
                              )}
                            </p>
                          )}
                          <h4 className="font-display font-bold text-lg text-text-primary group-hover:text-primary transition-colors mb-3 line-clamp-2">
                            {getLocalizedField(otherPost, 'title')}
                          </h4>
                          <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-grow">
                            {getLocalizedField(otherPost, 'excerpt')}
                          </p>
                          <span className="inline-flex items-center gap-2 text-primary text-xs font-ui font-bold uppercase tracking-widest group-hover:gap-3 transition-all mt-auto">
                            {t('blog.readMore')}
                            <span className="rtl:rotate-180"><ArrowIcon /></span>
                          </span>
                        </div>
                      </Link>
                    </motion.article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </article>
      </div>
    </>
  )
}

export default BlogPost
