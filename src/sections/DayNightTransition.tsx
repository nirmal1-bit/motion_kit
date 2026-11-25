import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute, MathUtils, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Vector3 } from 'three'
import type { AmbientLight, DirectionalLight, Fog, HemisphereLight, Mesh, PointLight } from 'three'

const chapters = [
  { label: 'HIGH SUN / 01', title: 'A city in\nthe clear.', detail: 'Hard light finds the rooftops. The street is still moving.' },
  { label: 'BLUE HOUR / 02', title: 'The day\nlets go.', detail: 'Shadows lengthen, the sky warms, and the first lights come on.' },
  { label: 'AFTER DARK / 03', title: 'Windows wake\none by one.', detail: 'The same street settles into its evening glow.' },
]
const daySky = new Color('#92b5c0')
const duskSky = new Color('#d5866c')
const nightSky = new Color('#172638')
const dayGlass = new Color('#546d73')
const litGlass = new Color('#f0bd76')

function DayNightLighting({ progress, sun, moon }: { progress: MotionValue<number>; sun: React.RefObject<Mesh | null>; moon: React.RefObject<Mesh | null> }) {
  const sky = useMemo(() => new Color(), [])
  const aim = useMemo(() => new Vector3(0, 3.1, -8), [])
  const sunLight = useRef<PointLight>(null)
  const keyLight = useRef<DirectionalLight>(null)
  const ambient = useRef<AmbientLight>(null)
  const hemisphere = useRef<HemisphereLight>(null)
  const moonMaterial = useRef<MeshBasicMaterial>(null)
  const fog = useRef<Fog>(null)
  useFrame(({ camera, scene }) => {
    const t = progress.get()
    const night = MathUtils.smoothstep(t, 0.42, 0.9)
    const sunset = MathUtils.smoothstep(t, 0.08, 0.58)
    sky.copy(daySky).lerp(duskSky, sunset).lerp(nightSky, night)
    scene.background = sky
    if (fog.current) {
      fog.current.color.copy(sky)
      fog.current.near = MathUtils.lerp(24, 18, night)
      fog.current.far = MathUtils.lerp(70, 53, night)
    }
    camera.position.set(0, 5.2 - t * 0.6, 20 - t * 3.5)
    camera.lookAt(aim)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(48, 52, sunset)
      camera.updateProjectionMatrix()
    }
    if (sun.current) {
      const descent = MathUtils.smoothstep(t, 0, 0.74)
      sun.current.position.set(-15 + descent * 30, 20 - descent * 25, -19)
      sun.current.scale.setScalar(1 - night * 0.96)
      keyLight.current?.position.copy(sun.current.position)
    }
    if (moon.current) {
      const rise = MathUtils.smoothstep(t, 0.42, 0.88)
      moon.current.position.set(13 - rise * 25, -4 + rise * 25, -23)
      moon.current.scale.setScalar(0.001 + rise * 0.9)
    }
    if (moonMaterial.current) moonMaterial.current.opacity = night
    if (sunLight.current) sunLight.current.intensity = 2.3 * (1 - night * 0.92)
    if (keyLight.current) keyLight.current.intensity = 2.4 * (1 - night * 0.96)
    if (ambient.current) ambient.current.intensity = 0.52 - night * 0.25
    if (hemisphere.current) hemisphere.current.intensity = 0.78 - night * 0.42
  })
  return <>
    <fog ref={fog} attach="fog" args={['#92b5c0', 24, 70]} />
    <ambientLight ref={ambient} intensity={0.52} />
    <hemisphereLight ref={hemisphere} args={['#f0e6d3', '#41484c', 0.78]} />
    <directionalLight ref={keyLight} position={[-15, 20, -19]} color="#ffddba" intensity={2.4} />
    <pointLight ref={sunLight} position={[-10, 17, -19]} color="#ffd99f" intensity={2.3} distance={55} />
    <mesh ref={sun}><sphereGeometry args={[1.5, 24, 18]} /><meshBasicMaterial color="#ffd49a" /></mesh>
    <mesh ref={moon}><sphereGeometry args={[1.15, 24, 18]} /><meshBasicMaterial ref={moonMaterial} color="#e7eef2" transparent opacity={0} /></mesh>
  </>
}

function House({ x, z, height, index, progress }: { x: number; z: number; height: number; index: number; progress: MotionValue<number> }) {
  const windows = useRef<MeshStandardMaterial[]>([])
  const body = ['#b7977e', '#a9a18e', '#7e8883', '#c0a58d', '#8e827a', '#b1a18c'][index % 6]
  useFrame(() => {
    const night = MathUtils.smoothstep(progress.get(), 0.4, 0.88)
    windows.current.forEach((material, i) => {
      material.emissiveIntensity = night * (0.75 + (i % 4) * 0.2)
      material.color.copy(dayGlass).lerp(litGlass, night * (0.48 + (i % 3) * 0.16))
    })
  })
  let slot = 0
  return <group position={[x, -0.35, z]}>
    <mesh position={[0, height / 2, 0]} castShadow><boxGeometry args={[4.2, height, 4]} /><meshStandardMaterial color={body} roughness={0.82} /></mesh>
    <mesh position={[0, height + 0.18, 0]}><boxGeometry args={[4.45, 0.36, 4.2]} /><meshStandardMaterial color="#5b5c58" roughness={0.78} /></mesh>
    <mesh position={[0, 0.65, 2.015]}><boxGeometry args={[0.8, 1.3, 0.06]} /><meshStandardMaterial color="#574c42" roughness={0.65} /></mesh>
    {Array.from({ length: Math.floor((height - 1.7) / 1.35) }, (_, row) => [-1, 0, 1].map((column) => {
      const current = slot++
      return <mesh key={row + '-' + column} position={[column * 1.12, 1.35 + row * 1.35, 2.025]}>
        <boxGeometry args={[0.56, 0.72, 0.07]} />
        <meshStandardMaterial ref={(material) => { if (material) windows.current[current] = material }} color="#546d73" emissive="#e9ad62" emissiveIntensity={0} roughness={0.32} metalness={0.16} />
      </mesh>
    }))}
    <mesh position={[0, 1.08, 2.08]}><boxGeometry args={[4.3, 0.12, 0.56]} /><meshStandardMaterial color={index % 2 ? '#d3b08a' : '#667b7a'} roughness={0.66} /></mesh>
  </group>
}

function StreetLamp({ x, z, progress }: { x: number; z: number; progress: MotionValue<number> }) {
  const light = useRef<PointLight>(null)
  const bulb = useRef<MeshStandardMaterial>(null)
  useFrame(() => {
    const glow = MathUtils.smoothstep(progress.get(), 0.37, 0.78)
    if (light.current) light.current.intensity = glow * 4.5
    if (bulb.current) bulb.current.emissiveIntensity = glow * 2.3
  })
  return <group position={[x, -0.45, z]}>
    <mesh position={[0, 2.45, 0]}><cylinderGeometry args={[0.07, 0.1, 4.9, 8]} /><meshStandardMaterial color="#363d3d" metalness={0.52} roughness={0.48} /></mesh>
    <mesh position={[0, 4.9, 0]}><boxGeometry args={[0.58, 0.15, 0.42]} /><meshStandardMaterial ref={bulb} color="#dca966" emissive="#ffc879" emissiveIntensity={0} roughness={0.35} /></mesh>
    <pointLight ref={light} position={[0, 4.75, 0]} color="#ffc979" intensity={0} distance={11} decay={2} />
  </group>
}

function StarField({ progress }: { progress: MotionValue<number> }) {
  const material = useRef<MeshBasicMaterial>(null)
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < 180; i++) {
      const a = Math.sin(i * 127.1) * 43758.5453
      const b = Math.sin(i * 311.7) * 24634.6345
      positions.push(((a - Math.floor(a)) - 0.5) * 54, 12 + (b - Math.floor(b)) * 18, -23 - (i % 7) * 0.2)
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return result
  }, [])
  useFrame(() => { if (material.current) material.current.opacity = MathUtils.smoothstep(progress.get(), 0.56, 0.92) })
  return <points geometry={geometry}><pointsMaterial ref={material} color="#e3e9ee" size={0.1} transparent opacity={0} sizeAttenuation /></points>
}

function CityScene({ progress }: { progress: MotionValue<number> }) {
  const sun = useRef<Mesh>(null)
  const moon = useRef<Mesh>(null)
  return <>
    <DayNightLighting progress={progress} sun={sun} moon={moon} />
    <mesh position={[0, -0.55, -4]} receiveShadow><boxGeometry args={[30, 0.2, 42]} /><meshStandardMaterial color="#565b57" roughness={0.93} /></mesh>
    <mesh position={[0, -0.43, -4]}><boxGeometry args={[7.8, 0.08, 43]} /><meshStandardMaterial color="#343a3b" roughness={0.9} /></mesh>
    {[-15, -8, -1, 6, 13].map((z) => <mesh key={z} position={[0, -0.37, z]}><boxGeometry args={[0.12, 0.025, 2.2]} /><meshBasicMaterial color="#d5c59f" /></mesh>)}
    {[-5.2, 5.2].map((x) => <mesh key={x} position={[x, -0.37, -4]}><boxGeometry args={[2.2, 0.08, 42]} /><meshStandardMaterial color="#aaa18f" roughness={0.95} /></mesh>)}
    {[-14, -7, 0, 7].map((z, index) => <group key={'houses-' + z}>
      <House x={-7.8} z={z} height={5.6 + (index % 2) * 1.2} index={index} progress={progress} />
      <House x={7.8} z={z - 2} height={6.1 + ((index + 1) % 2) * 1.1} index={index + 2} progress={progress} />
    </group>)}
    {[-13, -4, 5, 14].map((z) => <group key={'trees-' + z}>
      <mesh position={[-5.05, 0.5, z]}><cylinderGeometry args={[0.11, 0.15, 1, 8]} /><meshStandardMaterial color="#594a3b" /></mesh>
      <mesh position={[-5.05, 1.45, z]}><icosahedronGeometry args={[0.78, 1]} /><meshStandardMaterial color="#64785e" roughness={0.9} /></mesh>
      <mesh position={[5.05, 0.5, z - 3]}><cylinderGeometry args={[0.11, 0.15, 1, 8]} /><meshStandardMaterial color="#594a3b" /></mesh>
      <mesh position={[5.05, 1.45, z - 3]}><icosahedronGeometry args={[0.78, 1]} /><meshStandardMaterial color="#64785e" roughness={0.9} /></mesh>
    </group>)}
    {[-12, -3, 6, 13].map((z) => <group key={'lamps-' + z}>
      <StreetLamp x={-4.2} z={z} progress={progress} />
      <StreetLamp x={4.2} z={z - 3} progress={progress} />
    </group>)}
    <StarField progress={progress} />
  </>
}

function DayNightChapter({ index, active, reduceMotion }: { index: number; active: boolean; reduceMotion: boolean }) {
  const chapter = chapters[index]
  return <motion.article className={'day-night-chapter day-night-chapter-' + index} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18 }} transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function DayNightTransition() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.69 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="day-night-scroll">
    <div className="day-night-stage">
      <Canvas className="day-night-canvas" camera={{ position: [0, 5.2, 20], fov: 48, near: 0.1, far: 90 }} dpr={[1, 1.5]}><CityScene progress={scrollYProgress} /></Canvas>
      <div className="day-night-shade" />
      <header className="day-night-head"><span>ONE STREET / THREE HOURS</span><span>{activeChapter === 0 ? '1:24 PM' : activeChapter === 1 ? '7:08 PM' : '10:42 PM'}</span></header>
      <div className="day-night-copy">{chapters.map((_, index) => <DayNightChapter key={index} index={index} active={activeChapter === index} reduceMotion={reduceMotion} />)}</div>
      <footer className="day-night-foot"><span>NOON → DUSK → NIGHT</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>SCROLL THROUGH TIME ↓</span></footer>
    </div>
  </section>
}
