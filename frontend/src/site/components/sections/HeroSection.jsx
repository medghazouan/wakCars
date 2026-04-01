import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../hooks/useLanguage'
import Button from '../ui/Button'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = () => {
  const { t, isRTL } = useLanguage()
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Parallax background (removed pinning to fix scroll gap)
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

      // Fade overlay on scroll
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
        <div className="max-w-3xl">
          {/* Tagline */}
          <motion.p
            className="text-primary font-semibold text-sm md:text-base uppercase tracking-widest mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t('hero.tagline')}
          </motion.p>

          {/* Animated Title */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-text-on-dark mb-6 leading-tight"
          >
            {titleWords.map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
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
        </div>
      </div>
    </section>
  )
}

export default HeroSection
