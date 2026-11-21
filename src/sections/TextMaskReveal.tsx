import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const lines = ['MAKE IT', 'MEAN', 'SOMETHING.']

export function TextMaskReveal() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section className="text-mask-scroll" ref={section}>
    <div className="text-mask-stage">
      <div className="text-mask-meta"><span>TYPE STUDY / 02</span><span>SCROLL TO REVEAL</span></div>
      <div className="text-mask-copy" aria-label="Make it mean something.">
        {lines.map((line, lineIndex) => <div className="text-mask-line" key={line}>{line.split('').map((character, charIndex) => <MaskedCharacter key={`${line}-${charIndex}`} character={character} index={lineIndex * 12 + charIndex} total={36} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}</div>)}
      </div>
      <div className="text-mask-foot"><span>CHARACTER-BY-CHARACTER · CLIPPED REVEAL</span><motion.i style={reduceMotion ? { scaleX: 1 } : { scaleX: scrollYProgress, transformOrigin: 'left' }}/></div>
    </div>
  </section>
}

function MaskedCharacter({ character, index, total, progress, reduceMotion }: { character: string; index: number; total: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index / total * .82
  const end = start + .16
  const y = useTransform(progress, [start, end], ['65%', '0%'])
  const opacity = useTransform(progress, [start, end], [.55, 1])
  return <span className="text-mask-cell"><motion.i style={reduceMotion ? { y: '0%', opacity: 1 } : { y, opacity }}>{character}</motion.i></span>
}
