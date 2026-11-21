import { motion, useReducedMotion } from 'framer-motion'

export function MotionCard() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="motion-card-wrap">
      <motion.div
        className="motion-card"
        whileHover={reduceMotion ? undefined : { y: -8, rotate: -2, scale: 1.025 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      >
        <span className="card-index">01 / HOVER</span>
        <div className="card-shape"><span>✳</span></div>
        <div className="card-bottom"><strong>Soft interaction</strong><span>Framer Motion <b>↗</b></span></div>
      </motion.div>
      <div className="demo-caption"><span className="caption-dot" /> Move your cursor over the card <span className="caption-line" /></div>
    </div>
  )
}
