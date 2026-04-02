import { motion } from 'framer-motion'
import { useInView } from '../../hooks/useInView'
import { useLanguage } from '../../hooks/useLanguage'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const StarIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)



const ReviewsSection = () => {
  const { t } = useLanguage()
  const { ref, isInView } = useInView({ threshold: 0.2 })

  // Use optional chaining/fallback in case returnObjects is not supported or not loaded yet
  const reviewsList = t('reviews.items', { returnObjects: true }) || []
  const reviews = Array.isArray(reviewsList) ? reviewsList : []

  return (
    <section ref={ref} className="section-padding bg-background-warm">
      <div className="container-wak">
        {/* Header */}
        <div className="mb-14 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 -left-6 rtl:left-auto rtl:-right-6 w-1 h-3/4 bg-primary rounded-full hidden md:block" />
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 uppercase leading-[1.1]">
              {t('reviews.title')}
            </h2>
            <div className="flex items-center gap-2 text-primary mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= 4.8} />
              ))}
              <span className="text-text-secondary text-sm ml-2 font-medium">
                4.8/5 · {t('reviews.rating', { count: '320' })}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Reviews Swiper */}
        <div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={32}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            loop={true}
            className="!pb-0"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={review.id || index} className="h-auto">
                <motion.article
                  className="bg-white p-8 h-full flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 text-primary mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= (review.rating || 5)} />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-text-primary mb-6 leading-relaxed flex-grow">
                    &quot;{review.text}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {review.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-ui font-semibold text-text-primary">
                        {review.name}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {review.country}
                      </p>
                    </div>
                  </div>
                </motion.article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

export default ReviewsSection
