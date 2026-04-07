import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../hooks/useLanguage'
import { staggerContainer, fadeUp } from '../../utils/motion'
import Button from '../ui/Button'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = () => {
  const { t, isRTL } = useLanguage()
  const heroRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.to('.hero-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(overlayRef.current, {
        opacity: 0.9,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=50%',
          scrub: true,
        },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const titleWords = t('hero.title').split(' ')

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-background-dark"
    >
      {/* Background Image */}
      <div className="hero-bg absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          alt="Voiture de luxe sur route marocaine"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Gradient Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/70 to-transparent"
      />

      {/* Content */}
      <div className="relative h-full container-wak flex items-center pt-20">
        <motion.div
          className="max-w-3xl"
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline */}
          <motion.p
            className="text-primary font-semibold text-sm md:text-base uppercase tracking-widest mb-4"
            variants={fadeUp}
          >
            {t('hero.tagline')}
          </motion.p>

          {/* Animated Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-text-on-dark mb-6 leading-tight">
            {titleWords.map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-4"
                initial={{ opacity: 0, y: 60, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  delay: 0.3 + index * 0.08,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {index === titleWords.length - 1 ? (
                  <span className="text-primary">{word}</span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-xl mb-10 leading-relaxed"
            variants={fadeUp}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            variants={fadeUp}
          >
            <Link to="/voitures">
              <Button variant="primary" size="lg" className="text-base px-8 py-4">
                {t('hero.cta')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg" className="text-base px-8 py-4">
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5"
          animate={{ borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/60 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
