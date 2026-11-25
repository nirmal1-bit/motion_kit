import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Color, MathUtils, Vector3 } from 'three'
import type { Group, PointLight } from 'three'

const chapters = [
  { label: '01 / FORM', title: 'The shape\nof stillness.', detail: 'A single object holds the frame while the point of view begins to move.' },
  { label: '02 / SPACE', title: 'Every angle\nchanges it.', detail: 'Distance and light turn a familiar silhouette into something new.' },
  { label: '03 / PERSPECTIVE', title: 'A closer\nway to see.', detail: 'The story resolves from a view that only movement could reveal.' },
]

function OrbitCamera({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const target = useRef(new Vector3())
  useFrame(({ camera }) => {
    const t = progress.get()
    const angle = t * Math.PI * 1.65
    const orbitY = reduceMotion ? 0 : Math.sin(angle * 1.4) * 0.55
    camera.position.set(2.1 + Math.sin(angle) * 8.8, 2.1 + orbitY, Math.cos(angle) * 8.8)
    target.current.set(2.1, 1.15, 0)
    camera.lookAt(target.current)
  })
  return null
}

function Sculpture({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<Group>(null)
  const halo = useRef<Group>(null)
  const goldLight = useRef<PointLight>(null)
  const blueLight = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    const t = progress.get()
    const blend = MathUtils.clamp(t, 0, 1)
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.09
    if (halo.current) halo.current.rotation.z = Math.sin(clock.elapsedTime * 0.16) * 0.12
    if (goldLight.current) goldLight.current.intensity = 26 * (1 - blend * 0.75)
    if (blueLight.current) blueLight.current.intensity = 8 + blend * 23
  })
  return <group position={[2.1, 0, 0]}>
    <group ref={group} position={[0, 1.1, 0]}>
      <mesh><torusKnotGeometry args={[1.12, 0.29, 180, 28, 2, 5]} /><meshPhysicalMaterial color="#8e9cc4" roughness={0.24} metalness={0.72} clearcoat={0.92} clearcoatRoughness={0.16} /></mesh>
      <mesh position={[0.08, 0.05, 0.06]} rotation={[0.4, 0.25, 0]}><torusGeometry args={[1.8, 0.018, 8, 128]} /><meshStandardMaterial color="#e8c498" emissive="#b57a52" emissiveIntensity={0.62} metalness={0.6} /></mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0.25, 0.4]}><torusGeometry args={[2.18, 0.012, 8, 128]} /><meshStandardMaterial color="#b9c9dc" metalness={0.5} roughness={0.35} /></mesh>
      <mesh position={[1.95, 0.35, 0]}><sphereGeometry args={[0.16, 24, 24]} /><meshStandardMaterial color="#ffe3ad" emissive="#f6b75e" emissiveIntensity={1.5} /></mesh>
      <mesh position={[-1.75, -0.52, 0.2]}><sphereGeometry args={[0.1, 20, 20]} /><meshStandardMaterial color="#c8e6ff" emissive="#80b5e9" emissiveIntensity={1.4} /></mesh>
    </group>
    <group ref={halo} position={[0, 0.1, -0.2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.75, 0.018, 8, 128]} /><meshBasicMaterial color="#7f8ca3" transparent opacity={0.45} /></mesh>
      <mesh rotation={[0.2, 0, 0.25]}><torusGeometry args={[3.35, 0.012, 8, 128]} /><meshBasicMaterial color="#c99f78" transparent opacity={0.32} /></mesh>
    </group>
    <mesh position={[0, -0.38, 0]}><cylinderGeometry args={[1.8, 2.05, 0.48, 64]} /><meshStandardMaterial color="#313945" roughness={0.38} metalness={0.56} /></mesh>
    <mesh position={[0, -0.67, 0]}><cylinderGeometry args={[2.1, 2.15, 0.1, 64]} /><meshStandardMaterial color="#88909b" roughness={0.32} metalness={0.64} /></mesh>
    <pointLight ref={goldLight} position={[-3, 4, 3]} color="#f2a767" intensity={26} distance={13} />
    <pointLight ref={blueLight} position={[3, 2, -3]} color="#80b8f2" intensity={8} distance={14} />
  </group>
}

function OrbitScene({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const floorColor = useMemo(() => new Color('#1b202b'), [])
  const floorTo = useMemo(() => new Color('#131b26'), [])
  const floor = useRef<import('three').MeshStandardMaterial>(null)
  useFrame(() => {
    const t = progress.get()
    if (floor.current) floor.current.color.copy(floorColor).lerp(floorTo, t)
  })
  return <>
    <color attach="background" args={['#151922']} />
    <fog attach="fog" args={['#151922', 13, 34]} />
    <ambientLight intensity={0.52} />
    <hemisphereLight args={['#d4d9e1', '#252a35', 0.8]} />
    <directionalLight position={[-5, 8, 6]} intensity={1.8} color="#f7e8d6" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.76, 0]}>
      <planeGeometry args={[100, 100]} /><meshStandardMaterial ref={floor} color="#1b202b" roughness={0.85} metalness={0.12} />
    </mesh>
    <mesh position={[2.1, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.5, 2.53, 100]} /><meshBasicMaterial color="#c89a74" transparent opacity={0.5} /></mesh>
    <Sculpture progress={progress} />
    <OrbitCamera progress={progress} reduceMotion={reduceMotion} />
  </>
}

function EditorialChapter({ index, activeChapter, reduceMotion }: { index: number; activeChapter: number; reduceMotion: boolean }) {
  const active = activeChapter === index
  const chapter = chapters[index]
  return <motion.article className={`orbit-editorial-chapter orbit-editorial-${index}`} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 22, z: active ? 0 : -110, rotateY: active ? 0 : -7 }} transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function OrbitEditorial() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.36 ? 0 : value < 0.69 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="orbit-editorial-scroll">
    <div className="orbit-editorial-stage">
      <Canvas className="orbit-editorial-canvas" camera={{ position: [2.1, 2.1, 8.8], fov: 42 }} dpr={[1, 1.5]}><OrbitScene progress={scrollYProgress} reduceMotion={reduceMotion} /></Canvas>
      <div className="orbit-editorial-shade" />
      <header className="orbit-editorial-head"><span>OBJECT / POINT OF VIEW</span><span>SCROLL TO ORBIT</span></header>
      <div className="orbit-editorial-copy">{chapters.map((_, index) => <EditorialChapter key={index} index={index} activeChapter={activeChapter} reduceMotion={reduceMotion} />)}</div>
      <footer className="orbit-editorial-foot"><span>ONE FORM · MANY PERSPECTIVES</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>KEEP SCROLLING ↓</span></footer>
    </div>
  </section>
}
