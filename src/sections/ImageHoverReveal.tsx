import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

const projects = [
  { title: 'Soft geometry', type: 'ART DIRECTION · 2025', tone: 'image-art-lime', mark: '01' },
  { title: 'Objects in orbit', type: 'DIGITAL OBJECTS · 2024', tone: 'image-art-lilac', mark: '02' },
  { title: 'A slower current', type: 'IDENTITY · 2024', tone: 'image-art-peach', mark: '03' },
]

export function ImageHoverReveal() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()

  return <section className="image-reveal-demo">
    <div className="image-reveal-heading"><span>SELECTED WORK · 2024—25</span><span>HOVER OR FOCUS A PROJECT</span></div>
    <div className="image-reveal-layout">
      <div className="image-reveal-list" onMouseLeave={() => setActive(0)}>
        {projects.map((project, index) => <button key={project.title} className={`image-project ${active === index ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
          <span>{project.mark}</span><strong>{project.title}</strong><b>↗</b>
        </button>)}
      </div>
      <div className="image-reveal-window" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} className={`image-art ${projects[active].tone}`} initial={reduceMotion ? false : { opacity: 0, scale: .92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 1.04 }} transition={{ duration: reduceMotion ? 0 : .45, ease: [0.22, 1, .36, 1] }}>
            <span className="image-art-index">{projects[active].mark} / 03</span><div className="image-art-object"><i/><i/><b>✳</b></div><span className="image-art-title">{projects[active].title}</span>
          </motion.div>
        </AnimatePresence>
        <span className="image-reveal-counter">IMAGE REVEAL · 0{active + 1}</span>
      </div>
    </div>
  </section>
}
