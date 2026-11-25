import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Color, Float32BufferAttribute, IcosahedronGeometry, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { DirectionalLight, PointLight } from 'three'

const chapters = [
  { label: 'MATERIAL / 01', title: 'A world inside\nthe surface.', detail: 'Grain, fracture, and mineral color fill the frame. The scale is still a mystery.' },
  { label: 'OBJECT / 02', title: 'The stone\ncomes into view.', detail: 'As the camera retreats, a single sculpted rock gives the surface its size.' },
  { label: 'PLACE / 03', title: 'Now it belongs\nto a landscape.', detail: 'A pavilion, a path, and a human figure reveal the world around it.' },
]

function makeStone() {
  const geometry = new IcosahedronGeometry(2.05, 6)
  const positions = geometry.attributes.position
  const color = new Color()
  const colors: number[] = []
  const deep = new Color('#453d38')
  const clay = new Color('#a77d5d')
  const pale = new Color('#d4b991')
  const point = new Vector3()
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i)
    const n = Math.sin(point.x * 3.4 + point.z * 2.3) * 0.055
      + Math.sin(point.y * 4.2 - point.x * 1.8) * 0.035
      + Math.sin(point.z * 6.4 + point.y * 2.1) * 0.018
    point.normalize().multiplyScalar(2.05 + n)
    positions.setXYZ(i, point.x, point.y, point.z)
    const strata = MathUtils.clamp(0.48 + point.y * 0.14 + Math.sin(point.x * 2.1 + point.z) * 0.12, 0, 1)
    color.copy(deep).lerp(clay, strata).lerp(pale, Math.max(0, strata - 0.62) * 0.75)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}


function ScaleCamera({ progress, keyLight, rimLight }: { progress: MotionValue<number>; keyLight: React.RefObject<DirectionalLight | null>; rimLight: React.RefObject<PointLight | null> }) {
  const aim = useRef(new Vector3())
  const close = useMemo(() => new Vector3(0.38, 0.12, 3.12), [])
  const far = useMemo(() => new Vector3(1.2, 10.2, 29), [])
  const target = useMemo(() => new Vector3(0, 0.05, 0), [])
  const orbit = useMemo(() => new Vector3(), [])
  useFrame(({ camera }) => {
    const t = progress.get()
    const scale = MathUtils.smoothstep(t, 0.02, 0.96)
    const eased = MathUtils.smoothstep(scale, 0, 1)
    orbit.set(Math.sin(eased * Math.PI) * 2.5, 0, 0)
    camera.position.copy(close).lerp(far, eased).add(orbit)
    aim.current.copy(target)
    aim.current.y += eased * 0.5
    camera.lookAt(aim.current)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(42, 49, eased)
      camera.updateProjectionMatrix()
    }
    if (keyLight.current) {
      keyLight.current.intensity = MathUtils.lerp(2.5, 1.65, eased)
      keyLight.current.position.set(-5 - eased * 8, 7 + eased * 5, 5 + eased * 6)
    }
    if (rimLight.current) rimLight.current.intensity = MathUtils.lerp(7, 19, eased)
  })
  return <>
    <fog attach="fog" args={['#252a2c', 25, 72]} />
    <ambientLight intensity={0.55} />
    <hemisphereLight args={['#dfd5c4', '#353a3b', 0.82]} />
    <directionalLight ref={keyLight} position={[-5, 7, 5]} intensity={2.5} color="#f1c99a" />
    <pointLight ref={rimLight} position={[7, 4, -4]} intensity={7} color="#9bb2b3" distance={35} />
    <pointLight position={[-8, 2, 4]} intensity={2.4} color="#d48056" distance={14} />
  </>
}

function HumanScale() {
  return <group position={[-4.5, -2.1, 1.2]}>
    <mesh position={[0, 0.82, 0]}><capsuleGeometry args={[0.22, 0.78, 5, 10]} /><meshStandardMaterial color="#353638" roughness={0.76} /></mesh>
    <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.19, 12, 10]} /><meshStandardMaterial color="#353638" roughness={0.76} /></mesh>
  </group>
}

function Pavilion() {
  const stone = '#b6aa97'
  return <>
    <mesh position={[0, -2.16, 0]}><cylinderGeometry args={[9.2, 9.6, 0.34, 64]} /><meshStandardMaterial color="#665f53" roughness={0.92} /></mesh>
    <mesh position={[0, -1.94, 0]}><cylinderGeometry args={[8.5, 8.6, 0.1, 64]} /><meshStandardMaterial color="#978a75" roughness={0.72} /></mesh>
    {[-5.3, 5.3].flatMap((x) => [-3.4, 3.4].map((z) => <group key={x + '-' + z} position={[x, 0, z]}>
      <mesh position={[0, 1.35, 0]}><cylinderGeometry args={[0.25, 0.32, 6.5, 12]} /><meshStandardMaterial color={stone} roughness={0.78} /></mesh>
      <mesh position={[0, 4.65, 0]}><boxGeometry args={[0.82, 0.25, 0.82]} /><meshStandardMaterial color="#8e8475" roughness={0.83} /></mesh>
    </group>))}
    <mesh position={[0, 4.75, 0]}><boxGeometry args={[12.3, 0.42, 8.5]} /><meshStandardMaterial color="#c3b59f" roughness={0.76} /></mesh>
    <mesh position={[0, 5.02, 0]}><boxGeometry args={[11.8, 0.16, 8]} /><meshStandardMaterial color="#514d46" roughness={0.65} /></mesh>
    <mesh position={[0, -1.87, -7.7]}><boxGeometry args={[12.5, 0.58, 0.55]} /><meshStandardMaterial color="#9d907d" roughness={0.86} /></mesh>
    <mesh position={[0, -1.25, -7.7]}><boxGeometry args={[12.5, 0.08, 0.08]} /><meshBasicMaterial color="#d0b58b" /></mesh>
  </>
}
function Landscape() {
  return <>
    <mesh position={[0, -2.45, -12]}><boxGeometry args={[100, 0.28, 90]} /><meshStandardMaterial color="#454d47" roughness={1} /></mesh>
    {[-20, -13, -6, 2, 10, 17, 23].map((x, index) => <group key={x} position={[x, -2.2, -18 - (index % 3) * 2]} scale={[1.6, 0.72 + (index % 4) * 0.16, 0.8]}>
      <mesh><dodecahedronGeometry args={[5, 2]} /><meshStandardMaterial color={index % 2 ? '#566158' : '#62665b'} roughness={0.96} /></mesh>
    </group>)}
    {[-10, -7, 9, 12].map((x) => <group key={'tree-' + x} position={[x, -2, 5]}>
      <mesh position={[0, 1.35, 0]}><cylinderGeometry args={[0.14, 0.2, 2.7, 8]} /><meshStandardMaterial color="#574738" /></mesh>
      <mesh position={[0, 3, 0]}><coneGeometry args={[1.2, 2.8, 9]} /><meshStandardMaterial color="#596953" roughness={0.9} /></mesh>
    </group>)}
    <HumanScale />
  </>
}

function ScaleScene({ progress }: { progress: MotionValue<number> }) {
  const keyLight = useRef<DirectionalLight>(null)
  const rimLight = useRef<PointLight>(null)
  const stone = useMemo(makeStone, [])
  return <>
    <ScaleCamera progress={progress} keyLight={keyLight} rimLight={rimLight} />
    <mesh geometry={stone} position={[0, 0, 0]} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.8} metalness={0.06} /></mesh>
    <Pavilion />
    <Landscape />
  </>
}

function ScaleChapter({ index, active, reduceMotion }: { index: number; active: boolean; reduceMotion: boolean }) {
  const chapter = chapters[index]
  return <motion.article className={'scale-shift-chapter scale-shift-chapter-' + index} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18 }} transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function ScaleShiftJourney() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.7 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="scale-shift-scroll">
    <div className="scale-shift-stage">
      <Canvas className="scale-shift-canvas" camera={{ position: [0.38, 0.12, 3.12], fov: 42, near: 0.05, far: 100 }} dpr={[1, 1.5]}><ScaleScene progress={scrollYProgress} /></Canvas>
      <div className="scale-shift-shade" />
      <header className="scale-shift-head"><span>FIELD STUDY / 11</span><span>{activeChapter === 0 ? 'MICRO' : activeChapter === 1 ? 'OBJECT' : 'LANDSCAPE'}</span></header>
      <div className="scale-shift-copy">{chapters.map((_, index) => <ScaleChapter key={index} index={index} active={activeChapter === index} reduceMotion={reduceMotion} />)}</div>
      <footer className="scale-shift-foot"><span>MINERAL → STONE → PLACE</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>SCROLL TO PULL BACK ↓</span></footer>
    </div>
  </section>
}
