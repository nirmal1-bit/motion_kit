import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { BufferGeometry, CatmullRomCurve3, Color, Line, LineBasicMaterial, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { PointLight } from 'three'

const chapters = [
  { label: 'PLAN / 01', title: 'A place seen\nfrom above.', detail: 'A quiet grid of streets, blocks, and paths begins to reveal its shape.' },
  { label: 'DESCENT / 02', title: 'Follow the\nroute down.', detail: 'The map gains height, texture, and a sense of distance.' },
  { label: 'STREET LEVEL / 03', title: 'Now you are\nhere.', detail: 'The same plan becomes a place you can almost step into.' },
]

const buildings = [
  { x: -7.2, z: -13, w: 4.6, d: 4.8, h: 5.2, color: '#b77f63' }, { x: 7.2, z: -13, w: 4.6, d: 4.8, h: 4.4, color: '#d4a176' },
  { x: -7.2, z: -6, w: 4.6, d: 4.6, h: 3.6, color: '#c08c69' }, { x: 7.2, z: -6, w: 4.6, d: 4.6, h: 5.8, color: '#9e7867' },
  { x: -7.2, z: 1, w: 4.6, d: 4.6, h: 4.8, color: '#d1a074' }, { x: 7.2, z: 1, w: 4.6, d: 4.6, h: 3.2, color: '#bd8764' },
  { x: -7.2, z: 8, w: 4.6, d: 4.6, h: 5.5, color: '#aa7a6c' }, { x: 7.2, z: 8, w: 4.6, d: 4.6, h: 4.5, color: '#d5a679' },
]

type BuildingData = typeof buildings[number]

function Building({ data, index }: { data: BuildingData; index: number }) {
  const floors = Math.max(2, Math.floor(data.h / 1.35))
  return <group position={[data.x, -1, data.z]}>
    <mesh position={[0, data.h / 2, 0]} castShadow receiveShadow><boxGeometry args={[data.w, data.h, data.d]} /><meshStandardMaterial color={data.color} roughness={0.76} /></mesh>
    <mesh position={[0, data.h + 0.1, 0]}><boxGeometry args={[data.w + 0.18, 0.2, data.d + 0.18]} /><meshStandardMaterial color={index % 2 ? '#6d7067' : '#858171'} roughness={0.86} /></mesh>
    <mesh position={[0, data.h + 0.27, 0]}><boxGeometry args={[0.85, 0.14, 0.72]} /><meshStandardMaterial color="#77786e" roughness={0.72} /></mesh>
    {Array.from({ length: floors }, (_, row) => [-1, 0, 1].map((column) => <mesh key={`${row}-${column}`} position={[column * 1.15, 0.7 + row * 1.25, data.d / 2 + 0.012]}>
      <boxGeometry args={[0.52, 0.72, 0.025]} /><meshStandardMaterial color={row === 0 && column === index % 3 - 1 ? '#f2cc8b' : '#39444a'} emissive={row === 0 && column === index % 3 - 1 ? '#e5a95d' : '#101a21'} emissiveIntensity={row === 0 && column === index % 3 - 1 ? 0.6 : 0.08} roughness={0.3} />
    </mesh>))}
  </group>
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.08, 0.11, 0.76, 8]} /><meshStandardMaterial color="#705947" /></mesh>
    <mesh position={[0, 1.08, 0]}><icosahedronGeometry args={[0.62, 1]} /><meshStandardMaterial color="#58775e" roughness={0.88} /></mesh>
    <mesh position={[0, 1.55, 0]}><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color="#75906a" roughness={0.88} /></mesh>
  </group>
}

function RouteLine() {
  const route = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, -0.83, 9), new Vector3(0, -0.83, 4), new Vector3(0, -0.83, -1),
      new Vector3(0, -0.83, -5), new Vector3(0.35, -0.83, -9), new Vector3(0.35, -0.83, -17),
    ])
    const geometry = new BufferGeometry().setFromPoints(curve.getPoints(120))
    const material = new LineBasicMaterial({ color: '#f0b36d', linewidth: 3 })
    return new Line(geometry, material)
  }, [])
  return <primitive object={route} />
}

function RevealCamera({ progress }: { progress: MotionValue<number> }) {
  const paper = useMemo(() => new Color('#d8d3c6'), [])
  const sky = useMemo(() => new Color('#1a2630'), [])
  const mixed = useMemo(() => new Color(), [])
  const sunlight = useRef<PointLight>(null)
  const nightLight = useRef<PointLight>(null)
  const target = useRef(new Vector3())
  const topUp = useMemo(() => new Vector3(0, 0, -1), [])
  const worldUp = useMemo(() => new Vector3(0, 1, 0), [])
  useFrame(({ camera, scene }) => {
    const t = progress.get()
    const descent = MathUtils.smoothstep(t, 0.05, 0.9)
    const ease = descent * descent * (3 - 2 * descent)
    camera.position.set(Math.sin(ease * Math.PI) * 0.5, MathUtils.lerp(24, 2.45, ease), MathUtils.lerp(0.02, 10, ease))
    target.current.set(0, MathUtils.lerp(-1, 0.6, ease), MathUtils.lerp(0, -5, ease))
    camera.up.copy(topUp).lerp(worldUp, ease).normalize()
    camera.lookAt(target.current)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(38, 51, ease)
      camera.updateProjectionMatrix()
    }
    mixed.lerpColors(paper, sky, MathUtils.smoothstep(t, 0.42, 1))
    if (scene.background instanceof Color) scene.background.copy(mixed)
    else scene.background = mixed
    if (scene.fog) scene.fog.color.copy(mixed)
    if (sunlight.current) sunlight.current.intensity = 18 * (1 - t * 0.72)
    if (nightLight.current) nightLight.current.intensity = 1 + t * 11
  })
  return <>
    <fog attach="fog" args={['#d8d3c6', 30, 65]} />
    <ambientLight intensity={0.82} />
    <hemisphereLight args={['#fff1d9', '#5c665a', 0.95]} />
    <directionalLight position={[-6, 13, 5]} intensity={1.9} color="#fff0d8" />
    <pointLight ref={sunlight} position={[0, 14, 0]} color="#ffc679" intensity={18} distance={38} />
    <pointLight ref={nightLight} position={[0, 7, -14]} color="#69c4d0" intensity={1} distance={40} />
  </>
}

function Neighborhood({ progress }: { progress: MotionValue<number> }) {
  return <>
    <RevealCamera progress={progress} />
    <mesh position={[0, -1.12, -5]} receiveShadow><planeGeometry args={[40, 44]} /><meshStandardMaterial color="#938f7e" roughness={0.92} /></mesh>
    <mesh position={[0, -1.05, -5]}><boxGeometry args={[4.1, 0.08, 42]} /><meshStandardMaterial color="#41484a" roughness={0.88} /></mesh>
    <mesh position={[0, -1.04, -6]}><boxGeometry args={[36, 0.07, 3.2]} /><meshStandardMaterial color="#495052" roughness={0.9} /></mesh>
    <mesh position={[0, -0.98, -4.8]}><boxGeometry args={[0.08, 0.025, 36]} /><meshBasicMaterial color="#d6bd8d" /></mesh>
    <mesh position={[0, -0.97, -6]}><boxGeometry args={[26, 0.025, 0.07]} /><meshBasicMaterial color="#d6bd8d" /></mesh>
    {buildings.map((building, index) => <Building key={index} data={building} index={index} />)}
    <mesh position={[0, -0.96, -13]}><cylinderGeometry args={[2.3, 2.4, 0.1, 40]} /><meshStandardMaterial color="#727d67" roughness={0.9} /></mesh>
    {[[0, -13], [1.3, -13], [-1.3, -13], [0, -14.3], [0, -11.7]].map(([x, z], index) => <Tree key={index} position={[x, -0.88, z]} scale={index ? 0.7 : 1} />)}
    <RouteLine />
    <mesh position={[-2.3, -0.63, 2.5]}><boxGeometry args={[0.42, 0.8, 0.3]} /><meshStandardMaterial color="#cc7e62" roughness={0.5} /></mesh>
  </>
}

function RevealChapter({ index, activeChapter, reduceMotion }: { index: number; activeChapter: number; reduceMotion: boolean }) {
  const active = activeChapter === index
  const chapter = chapters[index]
  return <motion.article className={`topdown-chapter topdown-chapter-${index}`} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18, z: active ? 0 : -90 }} transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function TopDownReveal() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.36 ? 0 : value < 0.7 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="topdown-reveal-scroll">
    <div className="topdown-reveal-stage">
      <Canvas className="topdown-reveal-canvas" camera={{ position: [0, 24, 0.02], fov: 38, up: [0, 0, -1] }} dpr={[1, 1.5]}><Neighborhood progress={scrollYProgress} /></Canvas>
      <div className="topdown-reveal-shade" />
      <header className="topdown-reveal-head"><span>NEIGHBORHOOD / 01</span><span>{activeChapter === 0 ? 'PLAN VIEW' : activeChapter === 1 ? 'LOWERING THE CAMERA' : 'STREET LEVEL'}</span></header>
      <div className="topdown-reveal-copy">{chapters.map((_, index) => <RevealChapter key={index} index={index} activeChapter={activeChapter} reduceMotion={reduceMotion} />)}</div>
      <footer className="topdown-reveal-foot"><span>PLAN · PERSPECTIVE · PLACE</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>KEEP SCROLLING ↓</span></footer>
    </div>
  </section>
}
