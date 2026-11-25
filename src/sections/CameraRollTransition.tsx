import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Color, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { Mesh, PointLight } from 'three'

const chapters = [
  { label: 'SCENE 01 / THE OLD FRAME', title: 'Stay with\nthe familiar.', detail: 'A quiet room holds its shape. The next view is already in reach.' },
  { label: 'TRANSITION / LET GO', title: 'Turn into\nthe unknown.', detail: 'The camera rolls through the threshold as the world changes around it.' },
  { label: 'SCENE 02 / A NEW FRAME', title: 'A new\nhorizon.', detail: 'The motion settles. A new landscape opens ahead.' },
]

const smooth = (from: number, to: number, value: number) => {
  const t = MathUtils.clamp((value - from) / (to - from), 0, 1)
  return t * t * (3 - 2 * t)
}

function RollCamera({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const warm = useMemo(() => new Color('#d4b18a'), [])
  const cool = useMemo(() => new Color('#101d27'), [])
  const mixed = useMemo(() => new Color(), [])
  const warmLight = useRef<PointLight>(null)
  const coolLight = useRef<PointLight>(null)
  const target = useRef(new Vector3())
  useFrame(({ camera, scene }) => {
    const t = progress.get()
    const transition = smooth(0.32, 0.75, t)
    const roll = reduceMotion ? 0 : transition * Math.PI * 2
    const x = reduceMotion ? 0 : Math.sin(t * Math.PI * 1.2) * 0.24
    const z = 10 - 27 * t
    camera.position.set(x, 1.65 + (reduceMotion ? 0 : Math.sin(t * Math.PI) * 0.18), z)
    target.current.set(x * 0.35, 1.5, z - 6.5)
    camera.lookAt(target.current)
    camera.rotateZ(roll)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 42 + (reduceMotion ? 0 : Math.sin(transition * Math.PI) * 5)
      camera.updateProjectionMatrix()
    }
    mixed.lerpColors(warm, cool, transition)
    if (scene.background instanceof Color) scene.background.copy(mixed)
    else scene.background = mixed
    if (scene.fog) scene.fog.color.copy(mixed)
    if (warmLight.current) warmLight.current.intensity = 2.8 * (1 - transition)
    if (coolLight.current) coolLight.current.intensity = 2.9 * transition
  })
  return <>
    <fog attach="fog" args={['#d4b18a', 17, 44]} />
    <ambientLight intensity={0.9} />
    <directionalLight position={[-5, 8, 4]} intensity={1.8} color="#fff0d8" />
    <pointLight ref={warmLight} position={[-3, 5, 3]} color="#f4a968" intensity={2.8} distance={36} />
    <pointLight ref={coolLight} position={[2, 5, -28]} color="#82d4dd" intensity={0} distance={42} />
  </>
}

function Threshold({ progress }: { progress: MotionValue<number> }) {
  const outer = useRef<Mesh>(null)
  const inner = useRef<Mesh>(null)
  const warm = useMemo(() => new Color('#f4b56d'), [])
  const cool = useMemo(() => new Color('#80e1e5'), [])
  const mixed = useMemo(() => new Color(), [])
  useFrame(() => {
    const t = progress.get()
    const transition = smooth(0.32, 0.75, t)
    const color = mixed.lerpColors(warm, cool, transition)
    if (outer.current) {
      outer.current.rotation.y = Math.sin(t * Math.PI * 2) * 0.1
      ;(outer.current.material as import('three').MeshStandardMaterial).color.copy(color)
    }
    if (inner.current) (inner.current.material as import('three').MeshStandardMaterial).color.copy(color)
  })
  return <group position={[0, 1.55, -4.5]}>
    <mesh ref={outer}><torusGeometry args={[2.05, 0.12, 20, 96]} /><meshStandardMaterial color="#f4b56d" emissive="#d98743" emissiveIntensity={2.3} roughness={0.24} metalness={0.42} /></mesh>
    <mesh ref={inner}><torusGeometry args={[1.78, 0.025, 12, 96]} /><meshStandardMaterial color="#f4b56d" emissive="#f4c77e" emissiveIntensity={1.7} /></mesh>
    <mesh position={[0, 0, -0.45]} rotation={[0.2, 0, 0]}><torusGeometry args={[1.43, 0.035, 12, 72]} /><meshStandardMaterial color="#f2dfbd" emissive="#d9a26b" emissiveIntensity={0.85} transparent opacity={0.8} /></mesh>
    <pointLight position={[0, 0, 0.5]} color="#ffc47e" intensity={36} distance={9} />
  </group>
}

function TransitionWorld({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  return <>
    <RollCamera progress={progress} reduceMotion={reduceMotion} />
    <mesh position={[0, -1.1, 3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[22, 21]} /><meshStandardMaterial color="#c6a580" roughness={0.94} /></mesh>
    <group>
      <mesh position={[-4.5, 2, -1.2]}><boxGeometry args={[0.25, 5.2, 0.32]} /><meshStandardMaterial color="#7e6d5e" roughness={0.78} /></mesh>
      <mesh position={[4.5, 2, -1.2]}><boxGeometry args={[0.25, 5.2, 0.32]} /><meshStandardMaterial color="#7e6d5e" roughness={0.78} /></mesh>
      <mesh position={[0, 4.55, -1.2]}><boxGeometry args={[9.2, 0.24, 0.32]} /><meshStandardMaterial color="#927b66" roughness={0.78} /></mesh>
      <mesh position={[-2.8, 0.55, 1.5]} rotation={[0, 0, 0.08]}><dodecahedronGeometry args={[1.2, 0]} /><meshStandardMaterial color="#ab8969" roughness={0.65} /></mesh>
      <mesh position={[2.6, 0.15, 0]}><icosahedronGeometry args={[0.85, 1]} /><meshStandardMaterial color="#d3a876" roughness={0.32} metalness={0.18} /></mesh>
      <mesh position={[0, 0.95, 0.2]}><torusKnotGeometry args={[0.52, 0.16, 88, 16, 2, 3]} /><meshStandardMaterial color="#b47f5b" metalness={0.46} roughness={0.3} /></mesh>
    </group>
    <group>
      <mesh position={[0, 0.7, -24]}><dodecahedronGeometry args={[1.65, 1]} /><meshPhysicalMaterial color="#67b5bb" roughness={0.26} metalness={0.32} clearcoat={0.84} emissive="#164754" emissiveIntensity={0.42} /></mesh>
      <mesh position={[0, 0.7, -24]} rotation={[0.4, 0.2, 0.3]}><torusGeometry args={[2.55, 0.04, 12, 96]} /><meshStandardMaterial color="#a4e1db" emissive="#4bb7c5" emissiveIntensity={1.25} /></mesh>
      <mesh position={[-4.5, 1.45, -27]}><coneGeometry args={[1.5, 5.4, 7]} /><meshStandardMaterial color="#36575a" roughness={0.86} /></mesh>
      <mesh position={[4.3, 1.05, -30]}><coneGeometry args={[1.9, 4.2, 7]} /><meshStandardMaterial color="#416562" roughness={0.88} /></mesh>
      <mesh position={[0, -1.1, -29]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[22, 36]} /><meshStandardMaterial color="#172b33" roughness={0.82} /></mesh>
      <mesh position={[-2.5, 0.25, -22]}><sphereGeometry args={[0.55, 24, 24]} /><meshStandardMaterial color="#8bc5b7" emissive="#367f81" emissiveIntensity={0.32} roughness={0.34} /></mesh>
    </group>
    <Threshold progress={progress} />
  </>
}

function RollChapter({ index, activeChapter, reduceMotion }: { index: number; activeChapter: number; reduceMotion: boolean }) {
  const active = activeChapter === index
  const chapter = chapters[index]
  return <motion.article className={`roll-chapter roll-chapter-${index}`} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 20, z: active ? 0 : -95, rotateY: active ? 0 : -6 }} transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function CameraRollTransition() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.36 ? 0 : value < 0.7 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="roll-transition-scroll">
    <div className="roll-transition-stage">
      <Canvas className="roll-transition-canvas" camera={{ position: [0, 1.65, 10], fov: 42 }} dpr={[1, 1.5]}><TransitionWorld progress={scrollYProgress} reduceMotion={reduceMotion} /></Canvas>
      <div className="roll-transition-shade" />
      <header className="roll-transition-head"><span>FRAME / REFRAME</span><span>{activeChapter === 0 ? 'SCROLL TO BEGIN' : activeChapter === 1 ? 'ROLLING THROUGH' : 'SETTLED INTO THE NEXT SCENE'}</span></header>
      <div className="roll-transition-copy">{chapters.map((_, index) => <RollChapter key={index} index={index} activeChapter={activeChapter} reduceMotion={reduceMotion} />)}</div>
      <footer className="roll-transition-foot"><span>CAMERA ROLL · DOLLY · PALETTE SHIFT</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>KEEP SCROLLING ↓</span></footer>
    </div>
  </section>
}
