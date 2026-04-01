import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollAnimation = (animationConfig = {}) => {
  const ref = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion || !ref.current) return

    const {
      from = { opacity: 0, y: 50 },
      to = { opacity: 1, y: 0 },
      trigger,
      start = 'top 85%',
      end = 'bottom 15%',
      scrub = false,
      markers = false,
      duration = 0.8,
      ease = 'power2.out',
      delay = 0,
    } = animationConfig

    const animation = gsap.fromTo(
      ref.current,
      from,
      {
        ...to,
        duration,
        ease,
        delay,
        scrollTrigger: {
          trigger: trigger || ref.current,
          start,
          end,
          scrub,
          markers,
        },
      }
    )

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [animationConfig])

  return ref
}

export const useStaggerAnimation = (containerRef, childSelector, animationConfig = {}) => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion || !containerRef.current) return

    const {
      from = { opacity: 0, y: 30 },
      to = { opacity: 1, y: 0 },
      stagger = 0.1,
      start = 'top 85%',
      duration = 0.6,
      ease = 'power2.out',
    } = animationConfig

    const children = containerRef.current.querySelectorAll(childSelector)

    const animation = gsap.fromTo(
      children,
      from,
      {
        ...to,
        duration,
        ease,
        stagger,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
        },
      }
    )

    return () => {
      animation.kill()
    }
  }, [containerRef, childSelector, animationConfig])
}

export default useScrollAnimation
