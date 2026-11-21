import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'

export function MagneticCursor() {
  const area = useRef<HTMLDivElement>(null)
  const [inside, setInside] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 170, damping: 22, mass: .45 })
  const springY = useSpring(pointerY, { stiffness: 170, damping: 22, mass: .45 })
  const buttonX = useSpring(0, { stiffness: 220, damping: 18 })
  const buttonY = useSpring(0, { stiffness: 220, damping: 18 })

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = area.current?.getBoundingClientRect()
    if (!bounds) return
    pointerX.set(event.clientX - bounds.left)
    pointerY.set(event.clientY - bounds.top)
  }
  const magnet = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    buttonX.set((event.clientX - (bounds.left + bounds.width / 2)) * .22)
    buttonY.set((event.clientY - (bounds.top + bounds.height / 2)) * .22)
  }
  const release = () => { buttonX.set(0); buttonY.set(0) }

  return <div className="magnetic-demo" ref={area} onPointerMove={move} onPointerEnter={() => setInside(true)} onPointerLeave={() => { setInside(false); setHovering(false); release() }}>
    <div className="magnetic-copy"><span className="magnetic-eyebrow">POINTER / RESPONSE / FEEL</span><h2>Follow<br/>the <em>feeling.</em></h2><p>Move your pointer across the canvas. The cursor trails softly, while the button leans in to meet you.</p><motion.a href="#" className="magnetic-cta" style={{ x: buttonX, y: buttonY }} onPointerMove={magnet} onPointerLeave={release} onFocus={() => setHovering(true)} onBlur={() => setHovering(false)} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onClick={(event) => event.preventDefault()}>Come closer <b>↗</b></motion.a></div>
    <div className="magnetic-art"><div className="magnetic-rings"><i/><i/><i/></div><span>MAGNETIC FIELD<br/>INTERACTION STUDY</span><b>m.</b></div>
    {inside && !reduceMotion && <motion.div className="magnetic-cursor" style={{ x: springX, y: springY }} animate={{ scale: hovering ? 1.45 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}><span>{hovering ? 'OPEN' : 'MOVE'}</span></motion.div>}
    <span className="magnetic-note">FINE POINTER INTERACTION · TOUCH USERS CAN TAP</span>
  </div>
}
