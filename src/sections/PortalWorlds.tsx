import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { BufferAttribute, BufferGeometry, Color, MathUtils, ShaderMaterial, Vector3 } from 'three'
import type { Mesh, PointLight } from 'three'

const chapters = [
  { label: 'WORLD 01 / THE AMBER REACH', title: 'A familiar\nworld.', detail: 'Scroll forward. Something is waiting just beyond the edge.' },
  { label: 'THE THRESHOLD', title: 'Step into\nthe blue.', detail: 'The portal bends light between two distant places.' },
  { label: 'WORLD 02 / THE DEEP BLUE', title: 'Somewhere\nnew.', detail: 'Cross the threshold and find a different kind of quiet.' },
]

const smooth = (from: number, to: number, value: number) => {
  const t = MathUtils.clamp((value - from) / (to - from), 0, 1)
  return t * t * (3 - 2 * t)
}

function PortalSurface({ progress }: { progress: MotionValue<number> }) {
  const material = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (!material.current) return
    const t = progress.get()
    material.current.uniforms.uTime.value = clock.elapsedTime
    material.current.uniforms.uWorld.value = smooth(0.38, 0.75, t)
    material.current.uniforms.uAlpha.value = 0.88 - smooth(0.56, 0.73, t) * 0.8
  })
  return <mesh position={[0, 1.55, -5]}>
    <circleGeometry args={[1.52, 80]} />
    <shaderMaterial ref={material} vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`} fragmentShader={`uniform float uTime; uniform float uWorld; uniform float uAlpha; varying vec2 vUv; void main(){ vec2 p=vUv-0.5; float r=length(p); float a=atan(p.y,p.x); float bands=0.5+0.5*sin(a*7.0+r*38.0-uTime*1.2); float glow=1.0-smoothstep(0.18,0.56,r); vec3 amber=mix(vec3(0.10,0.07,0.04),vec3(1.0,0.59,0.22),0.25+0.55*bands); vec3 blue=mix(vec3(0.025,0.08,0.15),vec3(0.22,0.83,0.91),0.25+0.55*bands); vec3 color=mix(amber,blue,uWorld); color+=glow*mix(vec3(0.8,0.32,0.1),vec3(0.16,0.65,1.0),uWorld)*0.22; gl_FragColor=vec4(color,uAlpha*(0.78+0.22*glow)); }`} transparent depthWrite={false} side={2} uniforms={{ uTime: { value: 0 }, uWorld: { value: 0 }, uAlpha: { value: 0.88 } }} />
  </mesh>
}

function StarField() {
  const geometry = useMemo(() => {
    const count = 420
    const positions = new Float32Array(count * 3)
    let seed = 84
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
    for (let index = 0; index < count; index++) {
      positions[index * 3] = (random() - 0.5) * 30
      positions[index * 3 + 1] = random() * 11 - 1
      positions[index * 3 + 2] = -8 - random() * 28
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new BufferAttribute(positions, 3))
    return result
  }, [])
  return <points geometry={geometry}><pointsMaterial color="#d9f1f5" size={0.055} transparent opacity={0.82} sizeAttenuation /></points>
}

function PortalFrame({ progress }: { progress: MotionValue<number> }) {
  const outer = useRef<Mesh>(null)
  const inner = useRef<Mesh>(null)
  const gold = useMemo(() => new Color('#e8aa61'), [])
  const cyan = useMemo(() => new Color('#7fe7ed'), [])
  useFrame(() => {
    const blend = smooth(0.37, 0.73, progress.get())
    if (outer.current) outer.current.rotation.z = Math.sin(progress.get() * Math.PI) * 0.06
    if (outer.current?.material && 'color' in outer.current.material) (outer.current.material as import('three').MeshStandardMaterial).color.copy(gold).lerp(cyan, blend)
    if (inner.current?.material && 'color' in inner.current.material) (inner.current.material as import('three').MeshStandardMaterial).color.copy(gold).lerp(cyan, blend)
  })
  return <group position={[0, 1.55, -5]}>
    <mesh ref={outer}><torusGeometry args={[1.63, 0.11, 20, 100]} /><meshStandardMaterial color="#e8aa61" emissive="#e89348" emissiveIntensity={2.3} metalness={0.45} roughness={0.25} /></mesh>
    <mesh ref={inner}><torusGeometry args={[1.43, 0.025, 12, 100]} /><meshStandardMaterial color="#e8aa61" emissive="#f1c271" emissiveIntensity={1.6} /></mesh>
    <mesh position={[0, -1.78, 0]}><cylinderGeometry args={[0.27, 0.34, 0.38, 16]} /><meshStandardMaterial color="#545a52" roughness={0.55} metalness={0.35} /></mesh>
    <pointLight position={[0, 0, 0.4]} color="#ffb262" intensity={34} distance={8} />
  </group>
}

function PortalCamera({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const warm = useMemo(() => new Color('#e3c59a'), [])
  const cool = useMemo(() => new Color('#0b1827'), [])
  const background = useMemo(() => new Color(), [])
  const warmLight = useRef<PointLight>(null)
  const coolLight = useRef<PointLight>(null)
  const target = useRef(new Vector3())
  useFrame(({ camera, scene }) => {
    const t = progress.get()
    const blend = smooth(0.4, 0.8, t)
    const sway = reduceMotion ? 0 : Math.sin(t * Math.PI * 2) * 0.16
    camera.position.set(sway, 1.55 + (reduceMotion ? 0 : Math.sin(t * Math.PI) * 0.12), 9 - 24 * t)
    target.current.set(sway * 0.35, 1.55, camera.position.z - 7)
    camera.lookAt(target.current)
    background.lerpColors(warm, cool, blend)
    if (scene.background instanceof Color) scene.background.copy(background)
    else scene.background = background
    if (scene.fog) scene.fog.color.copy(background)
    if (warmLight.current) warmLight.current.intensity = 2.6 * (1 - blend)
    if (coolLight.current) coolLight.current.intensity = 2.8 * blend
  })
  return <>
    <fog attach="fog" args={['#e3c59a', 15, 42]} />
    <ambientLight intensity={1.05} />
    <directionalLight position={[-4, 8, 5]} intensity={1.8} color="#fff1d1" />
    <pointLight ref={warmLight} position={[-3, 5, 2]} color="#ffb25f" intensity={2.6} distance={32} />
    <pointLight ref={coolLight} position={[2, 5, -15]} color="#5fcfe4" intensity={0} distance={40} />
  </>
}

function PortalWorld({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  return <>
    <PortalCamera progress={progress} reduceMotion={reduceMotion} />
    <StarField />
    <group>
      <mesh position={[0, -0.2, 1]} scale={[5.8, 0.75, 3.8]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#9f825d" roughness={0.94} /></mesh>
      <mesh position={[-3.1, 1.15, -1.3]} rotation={[0, 0, 0.14]}><cylinderGeometry args={[0.3, 0.58, 3.8, 7]} /><meshStandardMaterial color="#816f58" roughness={0.9} /></mesh>
      <mesh position={[3.25, 1.5, -2.2]} rotation={[0, 0, -0.18]}><cylinderGeometry args={[0.22, 0.44, 4.7, 7]} /><meshStandardMaterial color="#92795c" roughness={0.88} /></mesh>
      <mesh position={[-1.2, 0.25, 2.8]}><icosahedronGeometry args={[0.72, 1]} /><meshStandardMaterial color="#d0a56f" roughness={0.42} /></mesh>
      <mesh position={[2, 0.05, 0.6]}><octahedronGeometry args={[0.58, 1]} /><meshStandardMaterial color="#c28d5b" roughness={0.38} metalness={0.15} /></mesh>
      <mesh position={[0, -1.1, 4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[18, 21]} /><meshStandardMaterial color="#b59a74" roughness={1} /></mesh>
    </group>
    <group>
      <mesh position={[0, 1.25, -24]}><icosahedronGeometry args={[1.25, 2]} /><meshPhysicalMaterial color="#55aebd" roughness={0.2} metalness={0.28} clearcoat={0.9} emissive="#16465e" emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 1.25, -24]} rotation={[0.3, 0, 0.4]}><torusGeometry args={[2.0, 0.035, 12, 100]} /><meshStandardMaterial color="#9fe5e6" emissive="#3aa5c1" emissiveIntensity={1.3} /></mesh>
      <mesh position={[-3.5, 1.1, -27]}><octahedronGeometry args={[1.2, 0]} /><meshStandardMaterial color="#375b77" roughness={0.38} metalness={0.32} /></mesh>
      <mesh position={[3.6, 0.6, -30]}><dodecahedronGeometry args={[1.4, 0]} /><meshStandardMaterial color="#29445e" roughness={0.45} metalness={0.25} /></mesh>
      <mesh position={[0, -1.1, -31]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[18, 30]} /><meshStandardMaterial color="#102238" roughness={0.8} metalness={0.08} /></mesh>
    </group>
    <PortalSurface progress={progress} />
    <PortalFrame progress={progress} />
  </>
}

function PortalChapter({ index, activeChapter, reduceMotion }: { index: number; activeChapter: number; reduceMotion: boolean }) {
  const chapter = chapters[index]
  const active = activeChapter === index
  return <motion.article className={`portal-chapter portal-chapter-${index}`} initial={false} animate={{ opacity: active ? 1 : 0, y: reduceMotion || active ? 0 : 12 }} transition={{ duration: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function PortalWorlds() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.46 ? 0 : value < 0.7 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="portal-worlds-scroll">
    <div className="portal-worlds-stage">
      <Canvas className="portal-worlds-canvas" camera={{ position: [0, 1.55, 9], fov: 43 }} dpr={[1, 1.5]}><PortalWorld progress={scrollYProgress} reduceMotion={reduceMotion} /></Canvas>
      <div className="portal-worlds-vignette" />
      <header className="portal-worlds-head"><span>PASSAGE / 01</span><span>{activeChapter === 0 ? 'SCROLL TO APPROACH' : activeChapter === 1 ? 'PASS THROUGH THE PORTAL' : 'EXPLORE THE OTHER SIDE'}</span></header>
      <div className="portal-worlds-copy">{chapters.map((_, index) => <PortalChapter key={index} index={index} activeChapter={activeChapter} reduceMotion={reduceMotion} />)}</div>
      <footer className="portal-worlds-foot"><span>ONE PASSAGE · TWO WORLDS</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>KEEP SCROLLING ↓</span></footer>
    </div>
  </section>
}
