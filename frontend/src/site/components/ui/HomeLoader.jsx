import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import wakCarsLogo from '../../assets/images/wak-cars-bl.png'

const DURATION = 3000

const SpeedometerArc = ({ progress }) => {
  const r = 90
  const cx = 100
  const cy = 100
  const startAngle = 135
  const endAngle = 405
  const totalArc = endAngle - startAngle

  const tickCount = 30
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const angle = startAngle + (totalArc / tickCount) * i
    const rad = (angle * Math.PI) / 180
    const isMajor = i % 5 === 0
    const innerR = isMajor ? r - 14 : r - 8
    return {
      x1: cx + Math.cos(rad) * innerR,
      y1: cy + Math.sin(rad) * innerR,
      x2: cx + Math.cos(rad) * r,
      y2: cy + Math.sin(rad) * r,
      isMajor,
      lit: i / tickCount <= progress,
    }
  })

  const needleAngle = startAngle + totalArc * progress
  const needleRad = (needleAngle * Math.PI) / 180
  const needleLen = r - 22

  return (
    <svg viewBox="0 0 200 200" className="w-52 h-52 md:w-64 md:h-64">
      {/* Outer ring glow */}
      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(204,0,0,0.06)" strokeWidth="8" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.lit ? '#CC0000' : 'rgba(255,255,255,0.12)'}
          strokeWidth={t.isMajor ? 2.5 : 1}
          strokeLinecap="round"
          style={{ transition: 'stroke 0.15s ease' }}
        />
      ))}

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(needleRad) * needleLen}
        y2={cy + Math.sin(needleRad) * needleLen}
        stroke="#CC0000"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(204,0,0,0.6))' }}
      />
      {/* Needle center dot */}
      <circle cx={cx} cy={cy} r="4" fill="#CC0000" />
      <circle cx={cx} cy={cy} r="2" fill="#1A1A1A" />
    </svg>
  )
}

const HomeLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState('loading')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    let raf
    const tick = () => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / DURATION, 1)
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      setProgress(eased)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setPhase('exit'), 200)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleExitComplete = () => {
    onComplete?.()
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {phase !== 'done' && (
        <div key="home-loader" className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Left door */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{ background: 'linear-gradient(135deg, #111 0%, #1A1A1A 100%)' }}
            animate={phase === 'exit' ? { x: '-100%' } : { x: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => { if (phase === 'exit') setPhase('done') }}
          >
            {/* Subtle road line pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute w-[2px] bg-white" style={{ height: '40px', right: '0', top: `${10 + i * 12}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Right door */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{ background: 'linear-gradient(-135deg, #111 0%, #1A1A1A 100%)' }}
            animate={phase === 'exit' ? { x: '100%' } : { x: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute w-[2px] bg-white" style={{ height: '40px', left: '0', top: `${10 + i * 12}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Center seam line */}
          <motion.div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/5"
            animate={phase === 'exit' ? { opacity: 0, scaleY: 0 } : { opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Center content */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none"
            animate={phase === 'exit' ? { scale: 1.1, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
          >
            {/* Speedometer */}
            <div className="relative flex items-center justify-center">
              <SpeedometerArc progress={progress} />

              {/* Logo in center of gauge */}
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <img
                  src={wakCarsLogo}
                  alt="WAK Cars"
                  className="w-20 md:w-24 h-auto object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </motion.div>
            </div>

            {/* Progress percentage */}
            <motion.div
              className="flex items-baseline gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-display text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">
                {Math.round(progress * 100)}
              </span>
              <span className="text-primary font-bold text-lg">%</span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-white/30 font-ui text-[10px] uppercase tracking-[0.4em]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              L'excellence automobile
            </motion.p>
          </motion.div>

          {/* Corner accents */}
          <motion.div
            className="absolute top-6 left-6 w-6 h-6 border-l border-t border-primary/20"
            initial={{ opacity: 0 }}
            animate={phase === 'exit' ? { opacity: 0, x: -20 } : { opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          />
          <motion.div
            className="absolute top-6 right-6 w-6 h-6 border-r border-t border-primary/20"
            initial={{ opacity: 0 }}
            animate={phase === 'exit' ? { opacity: 0, x: 20 } : { opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-6 h-6 border-l border-b border-primary/20"
            initial={{ opacity: 0 }}
            animate={phase === 'exit' ? { opacity: 0, x: -20 } : { opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-6 right-6 w-6 h-6 border-r border-b border-primary/20"
            initial={{ opacity: 0 }}
            animate={phase === 'exit' ? { opacity: 0, x: 20 } : { opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}

export default HomeLoader
