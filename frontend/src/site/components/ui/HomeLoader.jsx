import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import wakCarsLogo from '../../assets/images/wak-cars-bl.png'

const HomeLoader = ({ onComplete }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence onExitComplete={() => onComplete?.()}>
      {visible && (
        <motion.div
          key="home-loader"
          className="fixed inset-0 z-[99999] bg-[#1A1A1A] flex flex-col items-center justify-center gap-8"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={wakCarsLogo}
            alt="WAK Cars"
            className="w-48 md:w-56 h-auto object-contain"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />

          <div className="w-40 h-[2px] bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HomeLoader
