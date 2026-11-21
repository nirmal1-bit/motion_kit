import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const panels = [
  { title: 'A signal\nin the noise.', body: 'Start with a clear point of view. Give the idea a visual language people can recognize and remember.', step: '01 / SIGNAL', palette: 'panel-signal', mark: '↗' },
  { title: 'A system\nthat responds.', body: 'Build a flexible system that adapts across formats, products, and the moments in between.', step: '02 / SYSTEM', palette: 'panel-system', mark: '✳' },
  { title: 'A story\nthat stays.', body: 'Bring each part together into one coherent experience, from first impression to the last detail.', step: '03 / STORY', palette: 'panel-story', mark: '◌' },
]

export function StickyPanels() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return <section className="sticky-panels" ref={ref}>
    <div className="sticky-panels-stage">
      <div className="sticky-panels-head"><span>THREE PARTS OF A WHOLE</span><span>KEEP SCROLLING</span></div>
      <div className="sticky-panel-copy">{panels.map((panel, index) => <PanelCopy key={panel.step} panel={panel} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}</div>
      <div className="sticky-panel-visual">{panels.map((panel, index) => <PanelVisual key={panel.step} panel={panel} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}</div>
      <div className="sticky-panels-foot"><span>STICKY VISUAL · CHANGING CONTENT</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}/></div><span>01 — 03</span></div>
    </div>
  </section>
}

function PanelCopy({ panel, index, progress, reduceMotion }: { panel: typeof panels[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index / panels.length
  const end = (index + 1) / panels.length
  const opacity = useTransform(progress, [Math.max(0, start - .1), start, end - .06, end], [0, 1, 1, index === panels.length - 1 ? 1 : 0])
  const x = useTransform(progress, [start, Math.min(1, start + .1)], [25, 0])
  return <motion.article className="sticky-panel-chapter" style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, x: reduceMotion ? 0 : x }}>
    <span>{panel.step}</span><h2>{panel.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h2><p>{panel.body}</p><b>0{index + 1}</b>
  </motion.article>
}

function PanelVisual({ panel, index, progress, reduceMotion }: { panel: typeof panels[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index / panels.length
  const opacity = useTransform(progress, [Math.max(0, start - .08), start, Math.min(1, start + .28), Math.min(1, start + .38)], [0, 1, 1, index === panels.length - 1 ? 1 : 0])
  const scale = useTransform(progress, [start, Math.min(1, start + .25)], [.95, 1])
  return <motion.div className={`sticky-panel-art ${panel.palette}`} style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, scale: reduceMotion ? 1 : scale }}>
    <span>{panel.step}</span><div className="panel-art-mark"><i/><i/><b>{panel.mark}</b></div><strong>{panel.title.replace('\n', ' ')}</strong>
  </motion.div>
}
