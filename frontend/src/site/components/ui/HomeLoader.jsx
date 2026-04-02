import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import wakCarsLogo from '../../assets/images/wak-cars-bl.png'

const HomeLoader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  const handleAnimationComplete = () => {
    if (!isVisible && onComplete) {
      onComplete()
    }
  }

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          key="home-loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#1A1A1A' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Animated background lines */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[1px] w-full"
                style={{
                  top: `${20 + i * 15}%`,
                  background: `linear-gradient(90deg, transparent, rgba(204,0,0,${0.1 + i * 0.05}), transparent)`,
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              />
            ))}
          </div>

          {/* Pulsing glow behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(204,0,0,0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo entrance */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <img
                src={wakCarsLogo}
                alt="WAK Cars"
                className="w-64 md:w-80 lg:w-96 h-auto object-contain"
              />
            </motion.div>

            {/* Loading bar */}
            <div className="w-48 md:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #CC0000, #FF1A1A, #CC0000)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            </div>

            {/* Tagline reveal */}
            <motion.p
              className="text-gray-500 font-ui text-xs uppercase tracking-[0.3em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Location de voiture à Marrakech
            </motion.p>
          </div>

          {/* Corner accents */}
          <motion.div
            className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-primary/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <motion.div
            className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-primary/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-primary/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
          <motion.div
            className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-primary/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HomeLoader
