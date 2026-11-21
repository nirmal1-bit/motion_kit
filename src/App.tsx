import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SwipeStack, type StackItem } from './components/SwipeStack'
import { ThreeScene } from './sections/ThreeScene'
import { GsapScene } from './sections/GsapScene'
import { ScrollTemplateDetail, ScrollTemplates } from './sections/ScrollTemplates'
import { AnimationLibrary, animationCategories, type AnimationCategory } from './sections/AnimationLibrary'

const stackItems: StackItem[] = [
  { index: 'PATTERN / 01', label: '01 — INTRODUCE', title: 'Lead with a moment.', description: 'Use a strong visual and a short message to give the page its first impression.', color: 'stack-lime' },
  { index: 'PATTERN / 02', label: '02 — EXPLAIN', title: 'Make ideas tangible.', description: 'Give each feature its own space, then reveal it with a calm scroll entrance.', color: 'stack-lilac' },
  { index: 'PATTERN / 03', label: '03 — INVITE', title: 'Let people explore.', description: 'Small gestures make the interface feel direct, responsive, and memorable.', color: 'stack-coral' },
]
const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } }

function MotionGrid() {
  const [selected, setSelected] = useState(0)
  const reduceMotion = useReducedMotion()
  const tiles = [
    { number: '01', name: 'Reveal', note: 'Scroll into view', color: 'tile-green' },
    { number: '02', name: 'Respond', note: 'Hover and press', color: 'tile-orange' },
    { number: '03', name: 'Transition', note: 'Switch a state', color: 'tile-violet' },
  ]
  return <div className="motion-grid">{tiles.map((tile, index) => <motion.button key={tile.number} className={`motion-tile ${tile.color} ${selected === index ? 'chosen' : ''}`} onClick={() => setSelected(index)} whileHover={reduceMotion ? undefined : { y: -7, rotate: index % 2 ? 1 : -1 }} whileTap={reduceMotion ? undefined : { scale: .97 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}><span className="tile-number">{tile.number} / MOTION</span><motion.span className="tile-symbol" animate={selected === index && !reduceMotion ? { rotate: 45, scale: [1, 1.12, 1] } : { rotate: 0 }} transition={{ duration: .45 }}>✳</motion.span><span className="tile-name">{tile.name}</span><span className="tile-note">{tile.note}</span></motion.button>)}</div>
}

export default function App() {
  const reduceMotion = useReducedMotion()
  const readRoute = () => ({ templateId: window.location.hash.startsWith('#scroll/') ? window.location.hash.slice('#scroll/'.length) : '', libraryCategory: window.location.hash.startsWith('#animations/') ? window.location.hash.slice('#animations/'.length) : '' })
  const [route, setRoute] = useState(readRoute)
  const [returnHash, setReturnHash] = useState('#animations/all')
  const templateId = route.templateId
  useEffect(() => {
    const syncRoute = () => setRoute(readRoute())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])
  const openTemplate = (id: string) => { if (window.location.hash.startsWith('#animations/')) setReturnHash(window.location.hash); else setReturnHash('#animations/all'); window.location.hash = `scroll/${id}`; window.scrollTo({ top: 0 }) }
  const closeTemplate = () => { window.location.hash = returnHash.slice(1); window.scrollTo({ top: 0 }) }
  const category = animationCategories.includes(route.libraryCategory as AnimationCategory) ? route.libraryCategory as AnimationCategory : 'all'
  const changeCategory = (next: AnimationCategory) => { window.location.hash = `animations/${next}`; window.scrollTo({ top: 0 }) }
  if (templateId) return <ScrollTemplateDetail id={templateId} onBack={closeTemplate}/>
  if (route.libraryCategory) return <AnimationLibrary category={category} onCategoryChange={changeCategory} onOpen={openTemplate}/>
  return <main>
    <header className="site-header wrap"><a className="wordmark" href="#top"><span className="logo-mark">m</span><span>motion / kit</span></a><nav><a href="#patterns">Patterns</a><a href="#play">Playground</a><a href="#scroll-animations">Animation library</a><a href="#animations/threejs">Three.js</a></nav><a className="header-link" href="#animations/all">Explore animations <span>↘</span></a></header>
    <section className="hero wrap" id="top"><div className="hero-copy"><div className="eyebrow"><i/> A PRODUCT-READY ANIMATION STARTER</div><motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}><h1>Make room<br />for <em>movement.</em></h1><p>A flexible starting point for expressive product websites. Swap the content, keep the motion, make it yours.</p><a className="primary-link" href="#patterns">Browse motion patterns <span>↓</span></a></motion.div><div className="hero-index">MOTION SYSTEM <span>001 — 003</span></div></div><div className="hero-visual"><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><motion.div className="hero-shape" animate={reduceMotion ? undefined : { y: [0, -11, 0], rotate: [0, 7, 0], borderRadius: ['38% 62% 54% 46%', '55% 45% 38% 62%', '38% 62% 54% 46%'] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}><span>m.</span></motion.div><span className="hero-caption">A LITTLE DEPTH GOES A LONG WAY</span><motion.span className="hero-sticker" animate={reduceMotion ? undefined : { rotate: [8, 15, 8] }} transition={{ duration: 5, repeat: Infinity }}>DESIGNED TO<br/>BE REMIXED ✳</motion.span></div></section>
    <div className="ticker"><div>SCROLL REVEALS <i>✳</i> HOVER STATES <i>✳</i> DRAG GESTURES <i>✳</i> DEPTH & PARALLAX <i>✳</i> SCROLL REVEALS <i>✳</i> HOVER STATES <i>✳</i></div></div>
    <section className="patterns wrap" id="patterns"><motion.div className="section-heading" {...reveal}><div><div className="eyebrow">A SMALL MOTION TOOLKIT</div><h2>Patterns with<br/><em>room to grow.</em></h2></div><p>Each interaction is a reusable building block. Change the copy and palette to fit the product you’re making.</p></motion.div><MotionGrid/></section>
    <section className="play-section" id="play"><div className="wrap play-inner"><motion.div className="section-heading" {...reveal}><div><div className="eyebrow">GESTURE / STATE / RESPONSE</div><h2>A card stack<br/><em>you can feel.</em></h2></div><p>Drag, tap, or use the next control. This card pattern works for onboarding, features, learning, and more.</p></motion.div><SwipeStack items={stackItems}/></div></section>
    <ScrollTemplates onOpen={openTemplate}/>
    <section className="timeline-section wrap"><motion.div className="section-heading" {...reveal}><div><div className="eyebrow">TIMELINE / REPEAT / EASE</div><h2>Motion with<br/><em>intention.</em></h2></div><p>Use an orchestrated timeline for sequences that need a clear beginning, middle, and end.</p></motion.div><GsapScene/></section>
    <section className="scene-section wrap" id="scene"><motion.div className="scene-copy" {...reveal}><div className="eyebrow">A CANVAS FOR THE PRODUCT</div><h2>Bring a little<br/><em>dimension.</em></h2><p>A lightweight 3D accent can give a page a focal point without taking over the story. Drag the object to explore.</p><span className="scene-label">THREE.JS · INTERACTIVE OBJECT</span></motion.div><div className="scene-frame"><ThreeScene/></div></section>
    <section className="closing"><motion.div className="closing-inner wrap" {...reveal}><span className="closing-star">✳</span><div className="eyebrow">YOUR PRODUCT, YOUR STORY</div><h2>Start with motion.<br/><em>Make it yours.</em></h2><a href="#top">Back to the top ↑</a><span className="closing-code">REPLACE CONTENT · TUNE THE TOKENS · SHIP THE FEELING</span></motion.div></section>
    <footer className="site-footer wrap"><a className="wordmark" href="#top"><span className="logo-mark">m</span><span>motion / kit</span></a><span>Reusable animation patterns for the web.</span><span>REACT · TS · GSAP · THREE · MOTION</span></footer>
  </main>
}
