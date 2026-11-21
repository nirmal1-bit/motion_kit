import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { SequenceModel } from './SequenceModel'

const chapters = [
  { title: 'The rings\ncome into view.', label: '01 / SATURN', tone: 'sequence-lime' },
  { title: 'Moons cross\nthe orbital plane.', label: '02 / ORBIT', tone: 'sequence-lilac' },
  { title: 'A quiet dance\naround the giant.', label: '03 / SYSTEM', tone: 'sequence-peach' },
]

export function ScrollImageSequence() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const active = useTransform(scrollYProgress, [0, .32, .36, .65, .69, 1], [0, 0, 1, 1, 2, 2])

  return <section className="sequence-scroll" ref={section}>
    <div className="sequence-stage">
      <div className="sequence-header"><span>THE SATURN SYSTEM / 01</span><span>SCROLL TO EXPLORE</span></div>
      <div className="sequence-copy">
        {chapters.map((chapter, index) => <Chapter key={chapter.label} chapter={chapter} index={index} active={active} reduceMotion={Boolean(reduceMotion)} />)}
      </div>
      <div className="sequence-visual">
        <div className="sequence-glow"/>
        <SequenceModel progress={scrollYProgress} reduceMotion={Boolean(reduceMotion)}/>
        <span className="sequence-visual-label">SATURN · RINGS · ORBITING MOONS</span>
      </div>
      <div className="sequence-footer"><span>SCROLL STORY · FRAME BY FRAME</span><motion.div><motion.i style={reduceMotion ? { scaleX: 1 } : { scaleX: scrollYProgress, transformOrigin: 'left' }}/></motion.div><span>03 CHAPTERS</span></div>
    </div>
  </section>
}

function Chapter({ chapter, index, active, reduceMotion }: { chapter: typeof chapters[number]; index: number; active: MotionValue<number>; reduceMotion: boolean }) {
  const opacity = useTransform(active, [index - .4, index, index + .4], [0, 1, 0])
  const y = useTransform(active, [index - .4, index, index + .4], [24, 0, -24])
  return <motion.div className="sequence-chapter" style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h2><i className={chapter.tone}/>
  </motion.div>
}
