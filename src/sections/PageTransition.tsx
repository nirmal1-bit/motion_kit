import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useState } from 'react'

const scenes = [
  { name: 'A quieter kind of energy.', tag: 'STUDIO / 01', color: '#d7f36c', accent: '#768b3d' },
  { name: 'Ideas in another light.', tag: 'STUDIO / 02', color: '#dedbed', accent: '#827aa4' },
  { name: 'Made to move forward.', tag: 'STUDIO / 03', color: '#f0d8c8', accent: '#a66e53' },
]

export function PageTransition() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const scene = scenes[active]

  const advance = () => setActive((current) => (current + 1) % scenes.length)

  return <div className="transition-demo" style={{ '--transition-accent': scene.accent } as CSSProperties}>
    <AnimatePresence mode="wait" initial={false}>
      <motion.article key={active} className="transition-scene" style={{ backgroundColor: scene.color }}
        initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0 round 5px)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0 round 5px)' }}
        exit={reduceMotion ? undefined : { opacity: 0, clipPath: 'inset(0 0 0 100% round 5px)' }}
        transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.76, 0, 0.24, 1] }}>
        <span className="transition-kicker">{scene.tag} · PAGE TRANSITION</span>
        <div className="transition-art"><i/><i/><b>m<span>.</span></b></div>
        <h2>{scene.name}</h2>
        <span className="transition-count">0{active + 1} / 0{scenes.length}</span>
      </motion.article>
    </AnimatePresence>
    <button className="transition-next" onClick={advance} aria-label="Go to next page">Explore the next page <span>↗</span></button>
    <p className="transition-caption">Click to transition between pages</p>
  </div>
}
