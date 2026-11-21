import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

const work = [
  { id: '01', title: 'Forms of quiet', type: 'IDENTITY · DIGITAL', color: 'layout-lime', symbol: '◉' },
  { id: '02', title: 'Open landscape', type: 'CAMPAIGN · WEB', color: 'layout-lilac', symbol: '✳' },
  { id: '03', title: 'Soft machinery', type: 'ART DIRECTION · 3D', color: 'layout-peach', symbol: '⌘' },
]

export function SharedLayout() {
  const [selected, setSelected] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()
  const active = work.find((item) => item.id === selected)

  return <LayoutGroup>
    <section className="shared-layout-demo">
      <div className="shared-layout-top"><span>SELECTED PROJECTS / 2025</span><span>SELECT A PROJECT TO EXPAND</span></div>
      <AnimatePresence mode="wait">
        {active ? <motion.article key="detail" className={`layout-detail ${active.color}`} layoutId={`project-${active.id}`} transition={{ layout: { duration: reduceMotion ? 0 : .65, ease: [0.22, 1, .36, 1] } }}>
          <span className="layout-detail-id">PROJECT / {active.id}</span><button className="layout-close" onClick={() => setSelected(null)} aria-label="Back to all projects">× <span>ALL PROJECTS</span></button>
          <motion.div className="layout-detail-symbol" layoutId={`symbol-${active.id}`}>{active.symbol}</motion.div>
          <motion.span className="layout-detail-type" layoutId={`type-${active.id}`}>{active.type}</motion.span>
          <motion.h2 layoutId={`title-${active.id}`}>{active.title}</motion.h2>
          <p>A flexible identity and digital experience shaped around a single idea. Explore how the system moves across screens and moments.</p>
          <span className="layout-detail-arrow">EXPLORE CASE STUDY <b>↗</b></span>
        </motion.article> : <motion.div key="grid" className="layout-project-grid" initial={false}>
          {work.map((item) => <motion.button key={item.id} className={`layout-card ${item.color}`} layoutId={`project-${item.id}`} onClick={() => setSelected(item.id)} transition={{ layout: { duration: reduceMotion ? 0 : .65, ease: [0.22, 1, .36, 1] } }}>
            <span className="layout-card-id">PROJECT / {item.id}</span><motion.div className="layout-card-symbol" layoutId={`symbol-${item.id}`}>{item.symbol}</motion.div><motion.span className="layout-card-type" layoutId={`type-${item.id}`}>{item.type}</motion.span><motion.strong layoutId={`title-${item.id}`}>{item.title}</motion.strong><span className="layout-card-open">↗</span>
          </motion.button>)}
        </motion.div>}
      </AnimatePresence>
      <span className="shared-layout-hint">SHARED ELEMENTS · POSITION + SCALE</span>
    </section>
  </LayoutGroup>
}
