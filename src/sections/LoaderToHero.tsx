import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function LoaderToHero() {
  const [complete, setComplete] = useState(false)
  const [run, setRun] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setComplete(true)
      return
    }
    setComplete(false)
    const timer = window.setTimeout(() => setComplete(true), 1850)
    return () => window.clearTimeout(timer)
  }, [run, reduceMotion])

  return <div className="loader-hero-demo">
    <AnimatePresence>
      {!complete && <motion.div key={`loader-${run}`} className="loader-screen" initial={{ opacity: 1 }} exit={{ y: '-100%' }} transition={{ duration: .8, ease: [0.76, 0, 0.24, 1] }}>
        <div className="loader-top"><span>FORM / FIELD</span><span>INDEPENDENT CREATIVE STUDIO</span></div>
        <div className="loader-center"><motion.div className="loader-mark" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>✳</motion.div><span>MAKING SPACE FOR WHAT’S NEXT</span></div>
        <div className="loader-bottom"><span>LOADING EXPERIENCE</span><motion.div className="loader-track"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.55, ease: [0.76, 0, 0.24, 1] }}/></motion.div><span>100%</span></div>
      </motion.div>}
    </AnimatePresence>
    <div className="loader-hero-content">
      <div className="loader-hero-nav"><span>FORM / FIELD</span><span>SELECTED WORK&nbsp;&nbsp; ABOUT&nbsp;&nbsp; CONTACT</span></div>
      <div className="loader-hero-main"><div><motion.span className="loader-hero-eyebrow" initial={false} animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={{ duration: .5, delay: .2 }}>CREATIVE STUDIO · AVAILABLE WORLDWIDE</motion.span><motion.h2 initial={false} animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }} transition={{ duration: .65, delay: .28 }}>A new shape<br/>for <em>what’s next.</em></motion.h2><motion.p initial={false} animate={complete ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }} transition={{ duration: .5, delay: .45 }}>We build identities and digital experiences with room to move.</motion.p></div><motion.div className="loader-hero-art" initial={false} animate={complete ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: .82, rotate: -10 }} transition={{ duration: .9, delay: .25, ease: [0.22, 1, .36, 1] }}><i/><i/><b>f.</b></motion.div></div>
      <div className="loader-hero-footer"><span>SCROLL TO EXPLORE ↓</span><span>STRATEGY · DESIGN · DEVELOPMENT</span></div>
    </div>
    <button className="loader-replay" onClick={() => setRun((value) => value + 1)}>REPLAY INTRO <span>↻</span></button>
  </div>
}
