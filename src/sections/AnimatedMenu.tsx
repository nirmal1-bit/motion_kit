import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

const links = ['Selected work', 'Studio notes', 'About the studio', 'Get in touch']

export function AnimatedMenu() {
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()

  return <div className="menu-demo">
    <header className="menu-demo-bar"><span className="menu-demo-logo">m / studio</span><span>CREATIVE PRACTICE · 2025</span><button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="menu-overlay">{open ? 'CLOSE' : 'MENU'} <i>{open ? '×' : '+'}</i></button></header>
    <div className="menu-demo-backdrop"><span>DESIGNING<br/>FOR WHAT’S<br/><em>NEXT.</em></span><div className="menu-demo-orbit"><i/><i/><b>m.</b></div><small>AN INDEPENDENT DIGITAL STUDIO<br/>BASED EVERYWHERE</small></div>
    <AnimatePresence>
      {open && <motion.nav id="menu-overlay" className="menu-overlay" aria-label="Studio navigation" initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={reduceMotion ? undefined : { clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduceMotion ? 0 : .65, ease: [0.76, 0, 0.24, 1] }}>
        <div className="menu-overlay-top"><span>NAVIGATION / 01—04</span><span>MAKE A LITTLE SPACE</span></div>
        <div className="menu-links">{links.map((link, index) => <motion.a key={link} href="#" onClick={(event) => { event.preventDefault(); setOpen(false) }} initial={reduceMotion ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : .15 + index * .08, duration: reduceMotion ? 0 : .5, ease: [0.22, 1, .36, 1] }}><span>0{index + 1}</span><strong>{link}</strong><i>↗</i></motion.a>)}</div>
        <div className="menu-overlay-footer"><span>INDEPENDENT BY NATURE · CONNECTED BY DESIGN</span><span>INSTAGRAM ↗ &nbsp;&nbsp; EMAIL ↗</span></div>
      </motion.nav>}
    </AnimatePresence>
    <div className="menu-demo-instruction">{open ? 'SELECT A LINK OR CLOSE THE MENU' : 'MENU CLOSED · OPEN IT AGAIN'} <span>↗</span></div>
  </div>
}
