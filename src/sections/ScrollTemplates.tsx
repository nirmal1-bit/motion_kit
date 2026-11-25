import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { PageTransition } from './PageTransition'
import { ImageHoverReveal } from './ImageHoverReveal'
import { AnimatedMenu } from './AnimatedMenu'
import { MagneticCursor } from './MagneticCursor'
import { SvgLineDrawing } from './SvgLineDrawing'
import { LoaderToHero } from './LoaderToHero'
import { SharedLayout } from './SharedLayout'
import { ScrollImageSequence } from './ScrollImageSequence'
import { PinnedStory } from './PinnedStory'
import { StickyPanels } from './StickyPanels'
import { TextMaskReveal } from './TextMaskReveal'
import { DraggableMomentum } from './DraggableMomentum'
import { ScrollMorph } from './ScrollMorph'
import { WebGLTransition } from './WebGLTransition'
import { RefractionLens } from './RefractionLens'
import { ProductConfigurator } from './ProductConfigurator'
import { ParticleField } from './ParticleField'
import { GsapScene } from './GsapScene'
import { ThreeScene } from './ThreeScene'
import { BasicMotion } from './BasicMotion'
import { CameraPathStory } from './CameraPathStory'
import { FirstPersonWalk } from './FirstPersonWalk'
import { DioramaParallax } from './DioramaParallax'
import { PortalWorlds } from './PortalWorlds'
import { OrbitEditorial } from './OrbitEditorial'
import { CameraRollTransition } from './CameraRollTransition'
import { TopDownReveal } from './TopDownReveal'
import { ArchitecturalFlythrough } from './ArchitecturalFlythrough'
import { MapRouteJourney } from './MapRouteJourney'
import { DayNightTransition } from './DayNightTransition'
import { ScaleShiftJourney } from './ScaleShiftJourney'
import { TypographyCameraMove } from './TypographyCameraMove'
import { UserSteeredCamera } from './UserSteeredCamera'
import { ExplodedAssembly } from './ExplodedAssembly'

const foldCards = [
  { kicker: 'SCROLL PATTERN / 01', title: 'Stack, then unfold.', detail: 'A pinned card stack that releases one layer at a time.', color: 'fold-card-green' },
  { kicker: 'SCROLL PATTERN / 02', title: 'Let it move sideways.', detail: 'A horizontal sequence tied directly to the page scroll.', color: 'fold-card-lilac' },
  { kicker: 'SCROLL PATTERN / 03', title: 'Add a little depth.', detail: 'Layered objects drift at different speeds for a parallax feel.', color: 'fold-card-peach' },
]

function FoldCard({ card, index, progress, reduceMotion }: { card: typeof foldCards[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index * 0.27
  const opacity = useTransform(progress, [Math.max(0, start - 0.12), start + 0.04, Math.min(1, start + 0.38), Math.min(1, start + 0.48)], [0, 1, 1, index === foldCards.length - 1 ? 1 : 0])
  const y = useTransform(progress, [Math.max(0, start - 0.12), start + 0.04, Math.min(1, start + 0.38)], [70, 0, -410])
  const rotateX = useTransform(progress, [start + 0.14, Math.min(1, start + 0.4)], [0, index % 2 ? 72 : -72])
  const scale = useTransform(progress, [start, Math.min(1, start + 0.18)], [0.94, 1])
  const springY = useSpring(y, { stiffness: 100, damping: 26 })
  return <motion.article className={`fold-card ${card.color}`} style={{ y: reduceMotion ? 0 : springY, rotateX: reduceMotion ? 0 : rotateX, opacity, scale, zIndex: foldCards.length - index, transformPerspective: 1000 }}>
    <span className="fold-kicker">{card.kicker}</span><div><span className="fold-mark">0{index + 1}</span><h3>{card.title}</h3><p>{card.detail}</p></div><span className="fold-bottom">SCROLL-DRIVEN · {index + 1} / 03</span>
  </motion.article>
}

function FoldStack() {
  const section = useRef<HTMLDivElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <div className="fold-scroll" ref={section}>
    <div className="fold-sticky"><div className="fold-stage-label"><span>PINNED STACK</span><span>KEEP SCROLLING ↓</span></div>
      <div className="fold-deck">{foldCards.map((card, index) => <FoldCard key={card.kicker} card={card} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}</div>
      <div className="fold-progress"><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div>
    </div>
  </div>
}

function HorizontalRail() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-48%'])
  const slides = ['One continuous\nscroll story.', 'A little sideways\nmomentum.', 'A fresh frame\non every scroll.']
  return <div className="rail-scroll" ref={ref}><div className="rail-sticky"><div className="rail-track"><motion.div className="rail-inner" style={{ x }}>{slides.map((slide, index) => <article className={`rail-card rail-${index + 1}`} key={slide}><span>HORIZONTAL / 0{index + 1}</span><h3>{slide.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h3><b>↗</b></article>)}</motion.div></div><div className="rail-meta"><span>SCROLL TO MOVE THE RAIL</span><span>01 — 03</span></div></div></div>
}

const revealWords = ['Make', 'every', 'scroll', 'count.']
function WordReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return <div className="word-scroll" ref={ref}><div className="word-sticky"><div className="word-copy">{revealWords.map((word, index) => <Word key={word} word={word} index={index} progress={scrollYProgress}/>)}</div><span className="word-caption">KINETIC TYPE · SCROLL SCRUBBED</span><motion.i className="word-progress" style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}/></div></div>
}
function Word({ word, index, progress }: { word: string; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const start = index * .18
  const opacity = useTransform(progress, [start, start + .16], [.12, 1])
  const y = useTransform(progress, [start, start + .16], [40, 0])
  const blur = useTransform(progress, [start, start + .16], ['8px', '0px'])
  return <motion.span style={{ opacity, y, filter: blur }}>{word}<i>{word}</i></motion.span>
}

function ZoomReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, .72, 1], [.58, 1.15, 1.5])
  const clipPath = useTransform(scrollYProgress, [0, .65, 1], ['circle(12% at 50% 50%)', 'circle(48% at 50% 50%)', 'circle(76% at 50% 50%)'])
  const labelY = useTransform(scrollYProgress, [0, .5], [35, 0])
  return <div className="zoom-scroll" ref={ref}><div className="zoom-sticky"><div className="zoom-backdrop"><span>KEEP GOING</span><i>↓</i></div><motion.div className="zoom-aperture" style={{ scale, clipPath }}><div className="zoom-art"><span>FORM / 01</span><b>Beyond<br/>the <em>frame.</em></b><i>SCROLL TO REVEAL</i><div/></div></motion.div><motion.div className="zoom-label" style={{ y: labelY }}><span>SCROLL TRANSITION</span><strong>A closer look.</strong></motion.div></div></div>
}

function OrbitGallery() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return <div className="orbit-scroll" ref={ref}><div className="orbit-sticky"><div className="orbit-center">SCROLL<br/>TO ROTATE</div>{['Shape one.', 'Shape two.', 'Shape three.'].map((name, index) => <OrbitCard key={name} name={name} index={index} progress={scrollYProgress}/>)}</div></div>
}
function OrbitCard({ name, index, progress }: { name: string; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const input = [0, .33, .66, 1]
  const xValues = [[0, 0, -520, -850], [500, 380, 0, -500], [900, 700, 380, 0]][index]
  const opValues = [[1, 1, 0, 0], [0, .25, 1, 0], [0, 0, .25, 1]][index]
  const x = useTransform(progress, input, xValues)
  const rotate = useTransform(progress, input, index === 0 ? [0, 0, -15, -20] : index === 1 ? [15, 12, 0, -15] : [20, 15, 12, 0])
  const scale = useTransform(progress, input, index === 0 ? [1, 1, .7, .6] : index === 1 ? [.7, .8, 1, .7] : [.6, .7, .8, 1])
  const opacity = useTransform(progress, input, opValues)
  return <motion.article className={`orbit-card orbit-card-${index + 1}`} style={{ x, rotate, scale, opacity, zIndex: 3 - index }}><span>ORBIT / 0{index + 1}</span><b>{name}</b><i>✳</i></motion.article>
}

// Keep the newest implementation first; library and filtered category views preserve this order.
export const templates = [
  { id: 'exploded-assembly', number: '52', name: 'Exploded product assembly', description: 'Scroll to separate a product into labeled components, inspect each part, and reassemble it with a control.', technique: 'THREE.JS · ASSEMBLY / SCROLL', color: 'template-row-peach' },
  { id: 'user-steered-camera', number: '51', name: 'User-steered camera with scroll guardrails', description: 'Look around within bounded angles, then release or scroll to ease back onto the authored camera path.', technique: 'THREE.JS · FREE LOOK / SCROLL', color: 'template-row-lilac' },
  { id: 'typography-camera-move', number: '39', name: 'Camera move through typography', description: 'Fly through four giant extruded letters and arrive at the next editorial frame.', technique: 'THREE.JS · TYPE / CAMERA', color: 'template-row-green' },
  { id: 'scale-shift-journey', number: '40', name: 'Scale-shift journey', description: 'Pull back from a mineral surface to reveal the same stone in a pavilion and highland landscape.', technique: 'THREE.JS · SCALE / SCENE', color: 'template-row-peach' },
  { id: 'day-night-transition', number: '41', name: 'Day-to-night world transition', description: 'Watch one city street move from high sun through blue hour into a softly lit night.', technique: 'THREE.JS · LIGHT / ATMOSPHERE', color: 'template-row-lilac' },
  { id: 'map-route-journey', number: '42', name: '3D map route journey', description: 'Follow a glowing trail across raised highland terrain as the camera drops from map view to the lookout.', technique: 'THREE.JS · TERRAIN / CAMERA', color: 'template-row-green' },
  { id: 'architectural-flythrough', number: '43', name: 'Architectural fly-through', description: 'Follow a guided camera through a stone gallery, pausing at works before opening into a quiet courtyard.', technique: 'THREE.JS · ARCHITECTURE / CAMERA', color: 'template-row-peach' },
  { id: 'topdown-reveal', number: '44', name: 'Top-down to ground-level reveal', description: 'Lower the camera from a map-like plan into the streets and buildings below.', technique: 'THREE.JS · CAMERA DESCENT', color: 'template-row-green' },
  { id: 'camera-roll', number: '45', name: 'Camera roll into a new section', description: 'A scroll-driven camera roll and dolly carries the story through a threshold into a new world.', technique: 'THREE.JS · ROLL / DOLLY', color: 'template-row-peach' },
  { id: 'orbit-editorial', number: '46', name: 'Camera orbit around editorial copy', description: 'A camera circles a sculptural form as three editorial chapters move through depth.', technique: 'THREE.JS · CAMERA / TYPE', color: 'template-row-green' },
  { id: 'portal-worlds', number: '47', name: 'Portal between worlds', description: 'Scroll through a glowing threshold as the world, palette, and light change around you.', technique: 'THREE.JS · PORTAL / SCROLL', color: 'template-row-lilac' },
  { id: 'diorama-parallax', number: '48', name: 'Diorama parallax', description: 'Pointer movement shifts a miniature landscape at different depths for a layered parallax effect.', technique: 'THREE.JS · DEPTH / POINTER', color: 'template-row-peach' },
  { id: 'first-person-walk', number: '49', name: 'First-person scene walk', description: 'Explore a small portfolio gallery, then inspect projects as you approach them.', technique: 'THREE.JS · FIRST PERSON', color: 'template-row-green' },
  { id: 'camera-story', number: '50', name: 'Continuous camera-path story', description: 'Scrub a camera along one continuous path through three connected 3D chapters.', technique: 'THREE.JS · SCROLL CAMERA', color: 'template-row-lilac' },
  { id: 'three-scene', number: '26', name: 'Interactive 3D sculpture', description: 'Orbit a softly lit procedural sculpture in a real-time Three.js canvas.', technique: 'THREE.JS · ORBIT CONTROLS', color: 'template-row-lilac' },
  { id: 'gsap', number: '25', name: 'GSAP timeline loop', description: 'A scoped timeline loops a shape transformation and a moving signal.', technique: 'GSAP · TIMELINE / EASING', color: 'template-row-green' },
  { id: 'basic', number: '24', name: 'Basic interaction states', description: 'A small set of hover, press, and selected states built with CSS.', technique: 'CSS · HOVER / PRESS', color: 'template-row-peach' },
  { id: 'particles', number: '23', name: 'Cursor-reactive particle field', description: 'GPU particles flow away from the pointer and settle back into a field.', technique: 'WEBGL · PARTICLES / CURSOR', color: 'template-row-lilac' },
  { id: 'configurator', number: '22', name: '3D product configurator', description: 'Orbit a task lamp, inspect its parts, and change its material finish.', technique: 'THREE.JS · PRODUCT / HOTSPOTS', color: 'template-row-green' },
  { id: 'lens', number: '21', name: 'Refraction lens', description: 'A pointer-following glass orb refracts a layered optical study.', technique: 'THREE.JS · GLASS / POINTER', color: 'template-row-peach' },
  { id: 'webgl-transition', number: '20', name: 'WebGL image transition', description: 'Shader displacement blends between three image studies as you scroll.', technique: 'WEBGL · SCROLL TRANSITION', color: 'template-row-lilac' },
  { id: 'morph', number: '19', name: 'Scroll-driven 3D morph', description: 'A procedural sculpture changes from stone to bloom to vessel as you scroll.', technique: 'THREE.JS · MORPHING FORM', color: 'template-row-peach' },
  { id: 'momentum', number: '18', name: 'Draggable momentum', description: 'A direct-manipulation object carries release speed into a spring settle.', technique: 'DRAG · VELOCITY · SNAP', color: 'template-row-green' },
  { id: 'text-mask', number: '17', name: 'Text mask reveal', description: 'Oversized characters rise through a clipped mask as you scroll.', technique: 'SCROLL · KINETIC TYPE', color: 'template-row-peach' },
  { id: 'panels', number: '16', name: 'Sticky side-by-side panels', description: 'Content advances in one column while a companion visual stays pinned.', technique: 'STICKY · SPLIT STORY', color: 'template-row-green' },
  { id: 'story', number: '15', name: 'Pinned story chapters', description: 'A pinned editorial scene advances through three scroll-linked chapters.', technique: 'SCROLL · STORYTELLING', color: 'template-row-lilac' },
  { id: 'sequence', number: '14', name: 'Scroll image sequence', description: 'A pinned product story moves through three visual chapters as you scroll.', technique: 'PINNED · FRAME SEQUENCE', color: 'template-row-peach' },
  { id: 'layout', number: '13', name: 'Shared layout transition', description: 'A selected project card expands into a detail view and returns to the grid.', technique: 'LAYOUT · SHARED ELEMENT', color: 'template-row-green' },
  { id: 'loader', number: '12', name: 'Loader to hero', description: 'A progress screen hands off into a fully revealed landing hero.', technique: 'INTRO · HANDOFF', color: 'template-row-peach' },
  { id: 'svg-draw', number: '11', name: 'SVG line drawing', description: 'A vector illustration is traced as its section enters and leaves view.', technique: 'SCROLL · PATH DRAW', color: 'template-row-lilac' },
  { id: 'magnetic', number: '10', name: 'Magnetic cursor', description: 'A soft pointer follower and magnetic call to action respond to movement.', technique: 'POINTER · MAGNETIC', color: 'template-row-green' },
  { id: 'menu', number: '09', name: 'Animated menu', description: 'A full-screen navigation panel opens with staggered links.', technique: 'NAVIGATION · STAGGER', color: 'template-row-peach' },
  { id: 'image-hover', number: '08', name: 'Image hover reveal', description: 'A project list reveals a visual on hover, focus, or tap.', technique: 'HOVER · IMAGE REVEAL', color: 'template-row-lilac' },
  { id: 'transition', number: '07', name: 'Page transition', description: 'A directional mask carries the viewer from one page state to the next.', technique: 'NAVIGATION · MASK WIPE', color: 'template-row-green' },
  { id: 'fold', number: '01', name: 'Fold & reveal', description: 'A pinned stack tips away card by card as the viewer scrolls.', technique: 'PINNED · 3D FOLD', color: 'template-row-green' },
  { id: 'rail', number: '02', name: 'Scroll-scrubbed rail', description: 'Vertical page movement drives a horizontal sequence of cards.', technique: 'STICKY · HORIZONTAL', color: 'template-row-lilac' },
  { id: 'parallax', number: '03', name: 'Layered parallax', description: 'Foreground and background drift at different rates for depth.', technique: 'LAYERS · DEPTH', color: 'template-row-peach' },
  { id: 'text', number: '04', name: 'Kinetic type reveal', description: 'Words sharpen and rise into focus one beat at a time.', technique: 'TYPOGRAPHY · REVEAL', color: 'template-row-green' },
  { id: 'zoom', number: '05', name: 'Scroll zoom transition', description: 'A circular mask expands into a full-bleed visual reveal.', technique: 'PINNED · CLIP REVEAL', color: 'template-row-lilac' },
  { id: 'orbit', number: '06', name: 'Orbiting card gallery', description: 'Scroll moves a sequence of cards around a central focal point.', technique: '3D SPACE · CARD ORBIT', color: 'template-row-peach' },
]

function makeRecreationPrompt(template: (typeof templates)[number]) {
  return `Recreate the “${template.name}” animation from the animation_template library in the current product codebase.

Reference: In the animation_template project, open the animation library entry “${template.name}” (id: ${template.id}) and inspect its rendered full-screen demo and source implementation in src/sections/ScrollTemplates.tsx and any component imported for this entry. Treat that implementation as the source of truth.

Effect: ${template.description}
Technique: ${template.technique}

Match the reference closely: preserve the composition, layers, scroll trigger/pinning behavior, motion direction, transform ranges, timing/easing, typography hierarchy, colors, spacing, and progress indicators. Reuse the same animation logic and values where practical. Replace only product-specific copy, images, and colors needed to fit the host product; keep the visual structure and animation behavior intact.

Implement it as a self-contained, reusable React + TypeScript component that fits the host project's existing stack and conventions. Keep the animation tied to scroll progress where shown, avoid scroll hijacking, support touch-sized layouts, and respect prefers-reduced-motion with a stable non-animated presentation. Include any required styles, clean up listeners/animation contexts, and make the result usable in a real product page. Do not substitute a generic fade/slide for the demonstrated effect.

Before finishing, compare the result side by side with the reference demo and tune it until the behavior and composition match.`
}

export function CopyPromptButton({ template, compact = false }: { template: (typeof templates)[number]; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(makeRecreationPrompt(template))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return <motion.button className={compact ? 'copy-prompt compact' : 'copy-prompt'} onClick={copy} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: .96 }} transition={{ type: 'spring', stiffness: 360, damping: 20 }} aria-label={`Copy recreation prompt for ${template.name}`}>
    <span className="copy-prompt-icon">{copied ? '✓' : '⧉'}</span><span>{copied ? 'Prompt copied' : compact ? 'Copy prompt' : 'Copy recreation prompt'}</span><span className="copy-prompt-arrow">{copied ? '' : '↗'}</span>
  </motion.button>
}

export function ScrollTemplates({ onOpen }: { onOpen: (id: string) => void }) {
  const featured = templates
  return <section className="scroll-templates" id="scroll-animations">
    <div className="scroll-intro wrap"><div className="eyebrow">ANIMATION LIBRARY</div><h2>Find the motion<br/><em>that fits your stack.</em></h2><p>Browse focused examples by tool, from simple interface states to scroll-driven 3D scenes.</p><a className="primary-link" href="#animations/all">Browse all animations <span>↗</span></a></div>
    <div className="template-list wrap">{featured.map((template) => <motion.article className={`template-row ${template.color}`} key={template.id} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}><span className="template-row-number">{template.number}</span><span className="template-row-copy"><span className="template-tech">{template.technique}</span><strong>{template.name}</strong><small>{template.description}</small></span><motion.span className="template-row-art" aria-hidden="true" whileHover={{ rotate: 8, scale: 1.08 }}><i/><i/><i/></motion.span><span className="template-row-actions"><motion.button className="template-row-action" onClick={() => onOpen(template.id)} whileHover={{ x: 4 }} whileTap={{ scale: .96 }}>Open reveal <b>↗</b></motion.button><CopyPromptButton template={template} compact/></span></motion.article>)}</div>
  </section>
}

function ParallaxFull() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const backY = useTransform(scrollYProgress, [0, 1], [0, -150])
  const frontY = useTransform(scrollYProgress, [0, 1], [130, -240])
  const frontRotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  return <div className="parallax-full-scroll" ref={ref}><div className="parallax-full-sticky"><motion.div className="parallax-full-back" style={{ y: backY }}><span>DEPTH THROUGH MOVEMENT</span><i/><i/></motion.div><motion.div className="parallax-full-object" style={{ y: frontY, rotate: frontRotate }}><span>FOREGROUND / 02</span><b>Change<br/>the point<br/><em>of view.</em></b><i>↗</i></motion.div><span className="parallax-full-caption">BACKGROUND LAYER / 01</span></div></div>
}

export function ScrollTemplateDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const template = templates.find((item) => item.id === id) ?? templates[0]
  const { scrollYProgress: pageProgress } = useScroll()
  const visual = id === 'exploded-assembly' ? <ExplodedAssembly/> : id === 'user-steered-camera' ? <UserSteeredCamera/> : id === 'typography-camera-move' ? <TypographyCameraMove/> : id === 'scale-shift-journey' ? <ScaleShiftJourney/> : id === 'day-night-transition' ? <DayNightTransition/> : id === 'map-route-journey' ? <MapRouteJourney/> : id === 'architectural-flythrough' ? <ArchitecturalFlythrough/> : id === 'topdown-reveal' ? <TopDownReveal/> : id === 'camera-roll' ? <CameraRollTransition/> : id === 'orbit-editorial' ? <OrbitEditorial/> : id === 'portal-worlds' ? <PortalWorlds/> : id === 'diorama-parallax' ? <DioramaParallax/> : id === 'first-person-walk' ? <FirstPersonWalk/> : id === 'camera-story' ? <CameraPathStory/> : id === 'basic' ? <BasicMotion/> : id === 'three-scene' ? <ThreeScene/> : id === 'gsap' ? <GsapScene/> : id === 'particles' ? <ParticleField/> : id === 'configurator' ? <ProductConfigurator/> : id === 'lens' ? <RefractionLens/> : id === 'webgl-transition' ? <WebGLTransition/> : id === 'morph' ? <ScrollMorph/> : id === 'momentum' ? <DraggableMomentum/> : id === 'text-mask' ? <TextMaskReveal/> : id === 'panels' ? <StickyPanels/> : id === 'story' ? <PinnedStory/> : id === 'sequence' ? <ScrollImageSequence/> : id === 'layout' ? <SharedLayout/> : id === 'loader' ? <LoaderToHero/> : id === 'svg-draw' ? <SvgLineDrawing/> : id === 'magnetic' ? <MagneticCursor/> : id === 'menu' ? <AnimatedMenu/> : id === 'image-hover' ? <ImageHoverReveal/> : id === 'transition' ? <PageTransition/> : id === 'fold' ? <FoldStack/> : id === 'rail' ? <HorizontalRail/> : id === 'parallax' ? <ParallaxFull/> : id === 'text' ? <WordReveal/> : id === 'zoom' ? <ZoomReveal/> : <OrbitGallery/>
  return <main className={`scroll-detail-page detail-${id}`}>
    <div className="detail-fullstage">{visual}</div>
    <button className="immersive-back" onClick={onBack}><span>←</span> BACK TO ANIMATION LIBRARY</button>
    <CopyPromptButton template={template}/>
    <div className="immersive-title"><span>{template.number} / {template.technique}</span><h1>{template.name}</h1></div>
    <div className="immersive-scroll-hint"><span>SCROLL TO EXPERIENCE</span><b>↓</b></div>
    <div className="immersive-progress"><motion.i style={{ scaleX: pageProgress, transformOrigin: 'left' }}/></div>
  </main>
}
