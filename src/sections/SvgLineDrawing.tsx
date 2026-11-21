import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function SvgLineDrawing() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const draw = useTransform(scrollYProgress, (value) => reduceMotion ? 1 : Math.max(0, Math.min(1, value / .78)))

  return <section className="svg-drawing-scroll" ref={section}><div className="svg-drawing-demo">
    <div className="svg-drawing-head"><span>AN IDEA TAKES SHAPE / 01</span><span>SCROLL TO DRAW</span></div>
    <div className="svg-drawing-layout">
      <div className="svg-drawing-copy"><span className="svg-drawing-index">A / PROCESS</span><h2>From a line<br/>to a <em>world.</em></h2><p>A simple path can carry an idea from its first mark to a finished form. Scroll through the section to trace the drawing.</p><div className="svg-drawing-steps"><span>01 <i>THE ORBIT</i></span><span>02 <i>THE SIGNAL</i></span><span>03 <i>THE FORM</i></span></div></div>
      <div className="svg-drawing-canvas">
        <svg viewBox="0 0 600 600" role="img" aria-label="An animated line drawing of an orbiting, blossoming form">
          <motion.circle cx="300" cy="300" r="185" fill="none" stroke="#b9c69d" strokeWidth="1" style={{ pathLength: draw }} />
          <motion.path d="M300 95 C420 160 465 245 300 300 C135 355 180 440 300 505" fill="none" stroke="#788c4b" strokeWidth="2" strokeLinecap="round" style={{ pathLength: draw }} />
          <motion.path d="M300 300 C230 235 223 170 300 125 C377 170 370 235 300 300 C365 230 430 223 475 300 C430 377 365 370 300 300 C370 365 377 430 300 475 C223 430 230 365 300 300 C235 370 170 377 125 300 C170 223 235 230 300 300Z" fill="none" stroke="#b67557" strokeWidth="2" strokeLinejoin="round" style={{ pathLength: draw }} />
          <motion.circle cx="300" cy="300" r="12" fill="#d7f36c" stroke="#788c4b" strokeWidth="2" style={{ scale: draw }} />
          <motion.circle cx="300" cy="115" r="5" fill="#b67557" style={{ scale: draw }} />
        </svg>
        <span className="svg-canvas-caption">A STUDY IN CONTINUOUS FORM</span>
      </div>
    </div>
    <motion.div className="svg-drawing-progress" style={{ scaleX: draw, transformOrigin: 'left' }}/>
  </div></section>
}
