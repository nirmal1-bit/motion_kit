import { CopyPromptButton, templates } from './ScrollTemplates'

export const animationCategories = ['all', 'basic', 'framer-motion', 'gsap', 'threejs', 'mixed'] as const
export type AnimationCategory = typeof animationCategories[number]

const categoryDetails: Record<AnimationCategory, { label: string; title: string; description: string }> = {
  all: { label: 'EVERYTHING IN THE KIT', title: 'The animation library.', description: 'Browse the full collection, grouped by the tools and techniques behind each interaction.' },
  basic: { label: 'NO EXTRA LIBRARY', title: 'Basic motion.', description: 'Small CSS driven interaction states for hover, press, focus, and selection.' },
  'framer-motion': { label: 'FRAMER MOTION', title: 'Interface and scroll motion.', description: 'Spring transitions, layout changes, gestures, and scroll-linked sequences.' },
  gsap: { label: 'GSAP', title: 'Timeline animation.', description: 'Repeatable timelines, sequencing, and carefully tuned easing.' },
  threejs: { label: 'THREE.JS · WEBGL', title: 'Three.js animations.', description: 'Interactive 3D objects, shader effects, particles, and scroll-driven scenes.' },
  mixed: { label: 'COMBINED TECHNIQUES', title: 'Mixed stack experiments.', description: 'Patterns that combine scroll motion, 3D transforms, shaders, or multiple animation tools.' },
}

const groups: Record<AnimationCategory, string[]> = {
  all: templates.map((item) => item.id),
  basic: ['basic'],
  'framer-motion': ['momentum', 'text-mask', 'panels', 'story', 'layout', 'loader', 'svg-draw', 'magnetic', 'menu', 'image-hover', 'transition', 'text', 'zoom'],
  gsap: ['gsap'],
  threejs: ['infinite-carousel', 'image-tube', 'gesture-assembly', 'material-continuity', 'pendulum-study', 'linked-kinetic-chain', 'fracture-reassembly', 'soft-body-jelly', 'paper-fold', 'cloth-drape', 'rigid-body-drop', 'mechanical-sequence', 'xray-cutaway', '3d-2d-handoff', 'exploded-assembly', 'user-steered-camera', 'typography-camera-move', 'scale-shift-journey', 'day-night-transition', 'map-route-journey', 'architectural-flythrough', 'topdown-reveal', 'camera-roll', 'orbit-editorial', 'portal-worlds', 'diorama-parallax', 'first-person-walk', 'camera-story', 'three-scene', 'particles', 'configurator', 'lens', 'morph', 'sequence'],
  mixed: ['webgl-transition', 'fold', 'rail', 'parallax', 'orbit'],
}

export function AnimationLibrary({ category, onCategoryChange, onOpen }: { category: AnimationCategory; onCategoryChange: (category: AnimationCategory) => void; onOpen: (id: string) => void }) {
  const detail = categoryDetails[category]
  const items = templates.filter((item) => groups[category].includes(item.id))
  return <main className="animation-library">
    <header className="site-header wrap"><a className="wordmark" href="#top"><span className="logo-mark">m</span><span>motion / kit</span></a><nav><a href="#animations/basic">Basic</a><a href="#animations/framer-motion">Framer</a><a href="#animations/gsap">GSAP</a><a href="#animations/threejs">Three.js</a></nav><a className="header-link" href="#top">Back to home <span>↗</span></a></header>
    <section className="library-intro wrap"><div className="eyebrow">MOTION KIT / ANIMATION INDEX</div><h1>{detail.title}</h1><p>{detail.description}</p><div className="library-count"><span>{String(items.length).padStart(2, '0')} PATTERNS</span><span>SELECT A CARD TO EXPLORE ↘</span></div></section>
    <div className="library-browser wrap"><aside className="library-categories"><span className="library-filter-label">BROWSE BY</span>{animationCategories.map((item) => <button key={item} className={item === category ? 'active' : ''} onClick={() => onCategoryChange(item)}><span>{categoryDetails[item].label}</span><b>{String(groups[item].length).padStart(2, '0')}</b></button>)}</aside><section className="library-results" aria-label={`${detail.title} patterns`}><div className="library-results-head"><span>{detail.label}</span><span>{items.length} RESULTS</span></div><div className="library-grid">{items.map((item, index) => <article className={`library-card ${item.color}`} key={item.id}><div className="library-card-top"><i>{item.number}</i><b>{item.id === templates[0]?.id ? 'NEW ↗' : '✳'}</b></div><span className="template-tech">{item.technique}</span><strong>{item.name}</strong><small>{item.description}</small><div className="library-card-actions"><button className="library-card-open" onClick={() => onOpen(item.id)}>Open animation <span>↗</span></button><CopyPromptButton template={item} compact/></div><span className={`library-card-art art-${index % 4}`} aria-hidden="true"><i/><i/><i/></span></article>)}</div></section></div>
    <footer className="library-footer wrap"><a className="wordmark" href="#top"><span className="logo-mark">m</span><span>motion / kit</span></a><span>REACT · CSS · FRAMER MOTION · GSAP · THREE.JS</span></footer>
  </main>
}
