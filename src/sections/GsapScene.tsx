import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

gsap.registerPlugin(useGSAP)

export function GsapScene() {
  const container = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useGSAP(() => {
    if (reduceMotion) return
    gsap.fromTo('.gsap-shape',
      { rotate: -45, scale: 0.7, borderRadius: '42%' },
      { rotate: 315, scale: 1, borderRadius: '18%', duration: 2.6, ease: 'elastic.out(1, 0.55)', repeat: -1, yoyo: true },
    )
    gsap.to('.gsap-dot', { x: 180, duration: 1.8, ease: 'power2.inOut', repeat: -1, yoyo: true })
  }, { scope: container, dependencies: [reduceMotion] })

  return (
    <div className="gsap-scene" ref={container}>
      <div className="gsap-shape"><span>G</span></div>
      <div className="gsap-track"><i className="gsap-dot" /></div>
      <div className="scene-label"><strong>Timeline energy</strong><span>GSAP · scoped with useGSAP()</span></div>
    </div>
  )
}
