import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import type { SpotLight } from 'three'

const chapters = [
  { label: 'ARRIVAL / 01', title: 'A quieter\nkind of entry.', detail: 'Stone, shade, and a long view set the pace before the building opens.' },
  { label: 'THE GALLERY / 02', title: 'Light finds\na way through.', detail: 'A measured walk past framed works and filtered daylight.' },
  { label: 'THE COURT / 03', title: 'The room\nopens out.', detail: 'The axis ends in a planted courtyard, open to the sky.' },
]

const cameraPath = new CatmullRomCurve3([
  new Vector3(0, 2.25, 12), new Vector3(0, 2.3, 7), new Vector3(0, 2.45, 1),
  new Vector3(0, 2.45, -6), new Vector3(1.4, 2.5, -12), new Vector3(3.6, 2.7, -17),
  new Vector3(3.6, 2.8, -21),
])

function GalleryCamera({ progress }: { progress: MotionValue<number> }) {
  const aim = useRef(new Vector3())
  const direction = useRef(new Vector3())
  const keyLight = useRef<SpotLight>(null)
  useFrame(({ camera }) => {
    const value = progress.get()
    const easedPath = value < 0.34
      ? MathUtils.lerp(0, 0.37, MathUtils.smoothstep(value, 0, 0.34))
      : value < 0.68
        ? MathUtils.lerp(0.37, 0.7, MathUtils.smoothstep(value, 0.34, 0.68))
        : MathUtils.lerp(0.7, 1, MathUtils.smoothstep(value, 0.68, 1))
    const point = cameraPath.getPointAt(MathUtils.clamp(easedPath, 0, 1))
    camera.position.copy(point)
    cameraPath.getTangentAt(Math.min(easedPath + 0.012, 1), direction.current).normalize()
    aim.current.copy(point).add(direction.current.multiplyScalar(5))
    camera.lookAt(aim.current)
    if (keyLight.current) keyLight.current.intensity = 24 + MathUtils.smoothstep(value, 0.58, 0.9) * 34
  })
  return <>
    <fog attach="fog" args={['#c9c1b2', 18, 48]} />
    <ambientLight intensity={0.72} />
    <hemisphereLight args={['#f2e8d7', '#514b41', 1.15]} />
    <directionalLight position={[-5, 10, 5]} intensity={2.2} color="#ffe5c1" />
    <spotLight ref={keyLight} position={[4, 9, -19]} target-position={[3.6, 0, -21]} color="#fff0cf" intensity={24} distance={38} angle={0.75} penumbra={0.7} />
  </>
}

function GalleryBuilding({ progress }: { progress: MotionValue<number> }) {
  const stone = '#b8ad9a'
  const paleStone = '#d0c5b2'
  const bronze = '#554e43'
  return <>
    <GalleryCamera progress={progress} />
    <mesh position={[0, -0.18, -4]} receiveShadow><boxGeometry args={[19, 0.36, 39]} /><meshStandardMaterial color="#81796a" roughness={0.9} /></mesh>
    <mesh position={[0, -0.36, -4]}><boxGeometry args={[19.5, 0.22, 39.5]} /><meshStandardMaterial color="#615d53" roughness={0.95} /></mesh>
    {[-17, -12, -7, -2, 3, 8, 13].map((z, index) => <group key={z} position={[0, 0, z]}>
      <mesh position={[-8.2, 3.3, 0]}><boxGeometry args={[0.5, 6.6, index === 6 ? 8 : 4.2]} /><meshStandardMaterial color={stone} roughness={0.88} /></mesh>
      <mesh position={[8.2, 3.3, 0]}><boxGeometry args={[0.5, 6.6, index === 6 ? 8 : 4.2]} /><meshStandardMaterial color={stone} roughness={0.88} /></mesh>
      <mesh position={[0, 6.65, 0]}><boxGeometry args={[16.4, 0.34, 0.36]} /><meshStandardMaterial color={paleStone} roughness={0.84} /></mesh>
      <mesh position={[-7.85, 3.3, 0]}><boxGeometry args={[0.12, 6.2, 0.12]} /><meshStandardMaterial color="#8f8574" roughness={0.8} /></mesh>
      <mesh position={[7.85, 3.3, 0]}><boxGeometry args={[0.12, 6.2, 0.12]} /><meshStandardMaterial color="#8f8574" roughness={0.8} /></mesh>
    </group>)}
    {[-16, -11, -6, -1, 4, 9, 14].map((z, index) => <group key={`rib-${z}`}>
      <mesh position={[0, 6.85, z]}><boxGeometry args={[16.8, 0.32, 0.72]} /><meshStandardMaterial color={index % 2 ? paleStone : '#a99f8d'} roughness={0.88} /></mesh>
      <mesh position={[0, 6.54, z]}><boxGeometry args={[0.08, 0.28, 0.5]} /><meshBasicMaterial color="#f4d9ad" /></mesh>
    </group>)}
    {Array.from({ length: 7 }, (_, index) => {
      const z = 11 - index * 5
      return [-6.8, 6.8].map((x) => <group key={`${x}-${z}`} position={[x, 0, z]}>
        <mesh position={[0, 2.95, 0]} castShadow><cylinderGeometry args={[0.28, 0.36, 5.9, 12]} /><meshStandardMaterial color={paleStone} roughness={0.82} /></mesh>
        <mesh position={[0, 5.96, 0]}><boxGeometry args={[0.9, 0.24, 0.9]} /><meshStandardMaterial color={stone} roughness={0.85} /></mesh>
        <mesh position={[0, 0.16, 0]}><boxGeometry args={[0.9, 0.32, 0.9]} /><meshStandardMaterial color={stone} roughness={0.85} /></mesh>
      </group>)
    })}
    {[-10, -5, 0].map((z, index) => <group key={`art-${z}`} position={[0, 0, z]}>
      <mesh position={[-7.9, 3, 0]}><boxGeometry args={[0.12, 2.8, 2.1]} /><meshStandardMaterial color={bronze} roughness={0.5} /></mesh>
      <mesh position={[-7.81, 3, 0]}><planeGeometry args={[1.8, 2.5]} /><meshStandardMaterial color={['#bb8767', '#73847d', '#d1b887'][index]} roughness={0.72} /></mesh>
      <mesh position={[0, 0.62, 0]}><boxGeometry args={[2.8, 0.16, 0.72]} /><meshStandardMaterial color="#685d4e" roughness={0.72} /></mesh>
      <mesh position={[0, 0.31, 0]}><boxGeometry args={[2.3, 0.48, 0.46]} /><meshStandardMaterial color="#9c8c74" roughness={0.84} /></mesh>
    </group>)}
    <mesh position={[3.6, 0.04, -22.5]}><boxGeometry args={[10, 0.08, 7]} /><meshStandardMaterial color="#6c8179" roughness={0.24} metalness={0.15} /></mesh>
    <mesh position={[3.6, 3.6, -26.1]}><boxGeometry args={[10.5, 7.2, 0.45]} /><meshStandardMaterial color={stone} roughness={0.9} /></mesh>
    {[-0.7, 7.9].map((x, index) => <group key={`tree-${x}`} position={[x, 0, -23]}>
      <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.2, 0.32, 3.6, 10]} /><meshStandardMaterial color="#6d5a48" /></mesh>
      <mesh position={[0, 4.3, 0]}><icosahedronGeometry args={[1.65, 1]} /><meshStandardMaterial color={index ? '#677b65' : '#7d8c70'} roughness={0.9} /></mesh>
    </group>)}
  </>
}

function FlythroughChapter({ index, active, reduceMotion }: { index: number; active: boolean; reduceMotion: boolean }) {
  const chapter = chapters[index]
  return <motion.article className={`flythrough-chapter flythrough-chapter-${index}`} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18 }} transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function ArchitecturalFlythrough() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.68 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="architectural-flythrough-scroll">
    <div className="architectural-flythrough-stage">
      <Canvas className="architectural-flythrough-canvas" camera={{ position: [0, 2.25, 12], fov: 62, near: 0.1, far: 90 }} dpr={[1, 1.5]}><GalleryBuilding progress={scrollYProgress} /></Canvas>
      <div className="architectural-flythrough-shade" />
      <header className="architectural-flythrough-head"><span>FIELD NOTES / 08</span><span>{activeChapter === 0 ? 'ARRIVAL' : activeChapter === 1 ? 'THE GALLERY' : 'THE COURT'}</span></header>
      <div className="architectural-flythrough-copy">{chapters.map((_, index) => <FlythroughChapter key={index} index={index} active={activeChapter === index} reduceMotion={reduceMotion} />)}</div>
      <footer className="architectural-flythrough-foot"><span>ENTRY → GALLERY → COURTYARD</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>SCROLL TO WALK ↓</span></footer>
    </div>
  </section>
}
