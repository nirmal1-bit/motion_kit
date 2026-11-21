import { Canvas } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Environment } from '@react-three/drei'
import { ScrollMorphModel } from './ScrollMorphModel'

const chapters = [
  { title: 'A raw form.', label: '01 / STONE', detail: 'A quiet starting point, shaped by time.' },
  { title: 'A form in bloom.', label: '02 / BLOOM', detail: 'The surface opens into a sculptural rhythm.' },
  { title: 'A vessel takes shape.', label: '03 / VESSEL', detail: 'The final form settles into something made to hold.' },
]

export function ScrollMorph() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const active = useTransform(scrollYProgress, [0, .32, .36, .65, .69, 1], [0, 0, 1, 1, 2, 2])

  return <section ref={section} className="scroll-morph">
    <div className="scroll-morph-stage">
      <div className="morph-header"><span>FORM STUDY / 01</span><span>SCROLL TO TRANSFORM</span></div>
      <div className="morph-model"><div className="morph-halo"/><Canvas camera={{ position: [0, 0, 3.7], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}><hemisphereLight args={['#fff1d7', '#3c3558', 1.25]}/><ambientLight intensity={.28}/><directionalLight position={[-3, 5, 4]} intensity={4.5} color="#fff1d6"/><pointLight position={[3, -2, 2]} intensity={22} color="#a8caff"/><pointLight position={[-3, -1, -2]} intensity={13} color="#ffab71"/><ScrollMorphModel progress={scrollYProgress} reduceMotion={reduceMotion}/><Environment preset="studio"/></Canvas></div>
      <div className="morph-chapters">{chapters.map((chapter, index) => <MorphChapter key={chapter.label} chapter={chapter} index={index} active={active} reduceMotion={reduceMotion}/>)}</div>
      <div className="morph-footer"><span>PROCEDURAL MORPH · THREE.JS</span><div><motion.i style={reduceMotion ? { scaleX: 1 } : { scaleX: scrollYProgress, transformOrigin: 'left' }}/></div><span>03 FORMS</span></div>
    </div>
  </section>
}

function MorphChapter({ chapter, index, active, reduceMotion }: { chapter: typeof chapters[number]; index: number; active: MotionValue<number>; reduceMotion: boolean }) {
  const opacity = useTransform(active, [index - .4, index, index + .4], [0, 1, index === chapters.length - 1 ? 1 : 0])
  const y = useTransform(active, [index - .4, index], [20, 0])
  return <motion.article className="morph-chapter" style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}><span>{chapter.label}</span><h2>{chapter.title}</h2><p>{chapter.detail}</p></motion.article>
}
