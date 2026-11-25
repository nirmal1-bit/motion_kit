import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'

const chapters = [
  { tag: '01 / THRESHOLD', title: 'Enter the\nquiet.', detail: 'A passage opens into a world made of light and stone.' },
  { tag: '02 / SIGNAL', title: 'Follow the\npulse.', detail: 'A living signal gathers at the center of the landscape.' },
  { tag: '03 / CANOPY', title: 'Find your\nway through.', detail: 'The path settles beneath a field of slow moving forms.' },
]

function World() {
  return <>
    <color attach="background" args={['#111713']} />
    <fog attach="fog" args={['#111713', 13, 38]} />
    <ambientLight intensity={0.65} />
    <hemisphereLight args={['#dce9d1', '#15221b', 1.15]} />
    <pointLight position={[0, 3, 2]} intensity={30} color="#c8e477" distance={13} />
    <pointLight position={[12, 3, 2]} intensity={38} color="#e8a779" distance={14} />
    <pointLight position={[24, 3, 2]} intensity={42} color="#a9b9f0" distance={15} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -1.25, 0]} receiveShadow>
      <planeGeometry args={[100, 24]} />
      <meshStandardMaterial color="#202820" roughness={0.92} />
    </mesh>
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}><torusGeometry args={[1.55, 0.055, 16, 96]} /><meshStandardMaterial color="#c8e477" emissive="#829c3c" emissiveIntensity={1.3} metalness={0.4} roughness={0.3} /></mesh>
      <mesh position={[0, -0.3, -0.4]}><icosahedronGeometry args={[0.72, 2]} /><meshStandardMaterial color="#b7c58d" roughness={0.38} metalness={0.22} /></mesh>
      <mesh position={[-2.3, -0.2, -1]} rotation={[0, 0, 0.15]}><cylinderGeometry args={[0.14, 0.3, 2.5, 7]} /><meshStandardMaterial color="#505b43" roughness={0.75} /></mesh>
      <mesh position={[2.1, 0.1, -1.2]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.2, 0.38, 3, 7]} /><meshStandardMaterial color="#495744" roughness={0.75} /></mesh>
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.7, 0.018, 8, 96]} /><meshStandardMaterial color="#92a368" emissive="#536538" emissiveIntensity={0.7} /></mesh>
    </group>
    <group position={[12, 0, 0]}>
      <mesh position={[0, 0.35, 0]}><sphereGeometry args={[0.95, 48, 48]} /><meshPhysicalMaterial color="#db9870" roughness={0.24} metalness={0.18} clearcoat={0.8} emissive="#7b3c27" emissiveIntensity={0.3} /></mesh>
      {[0, 1, 2].map((index) => <mesh key={index} position={[0, 0.35, 0]} rotation={[0.2 + index * 0.45, index * 0.7, index * 0.35]}><torusGeometry args={[1.45 + index * 0.35, 0.018, 8, 100]} /><meshStandardMaterial color={index === 1 ? '#f3c997' : '#a9b78a'} emissive="#bd805e" emissiveIntensity={0.6} /></mesh>)}
      {[-2.2, -1.5, 1.6, 2.4].map((x, index) => <mesh key={x} position={[x, -0.25 + (index % 2) * 0.25, -0.7]} rotation={[0, 0, (index - 1.5) * 0.12]}><cylinderGeometry args={[0.08, 0.19, 2.7 + (index % 2) * 0.6, 8]} /><meshStandardMaterial color="#6b5b4d" roughness={0.7} /></mesh>)}
      <mesh position={[0, -1.16, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.7, 1.73, 96]} /><meshBasicMaterial color="#e8a779" /></mesh>
    </group>
    <group position={[24, 0, 0]}>
      <mesh position={[0, 0.2, 0]}><dodecahedronGeometry args={[0.8, 1]} /><meshPhysicalMaterial color="#b6c4a0" roughness={0.32} metalness={0.14} clearcoat={0.6} /></mesh>
      {[-2.5, -1.7, 1.6, 2.4].map((x, index) => <group key={x} position={[x, -0.1, index % 2 ? -0.4 : -1]}>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.07, 0.12, 2.8, 8]} /><meshStandardMaterial color="#817e66" roughness={0.84} /></mesh>
        <mesh position={[0, 1.15, 0]}><icosahedronGeometry args={[0.72 + (index % 2) * 0.2, 1]} /><meshStandardMaterial color={index % 2 ? '#71855d' : '#9ba878'} roughness={0.75} /></mesh>
      </group>)}
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.4, 0.025, 8, 96]} /><meshStandardMaterial color="#bba9e8" emissive="#7966ad" emissiveIntensity={0.7} /></mesh>
    </group>
  </>
}

function CameraRail({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const rail = useMemo(() => new CatmullRomCurve3([
    new Vector3(-0.4, 0.15, 9), new Vector3(2.3, 0.65, 8.7), new Vector3(5.8, 0.95, 8.2),
    new Vector3(9.1, 0.55, 8.8), new Vector3(12, 0.15, 9), new Vector3(15, -0.35, 8.5),
    new Vector3(18.7, 0.3, 8.2), new Vector3(21.4, 0.6, 8.8), new Vector3(24.4, 0.1, 9),
  ], false, 'catmullrom', 0.35), [])
  const target = useRef(new Vector3())
  useFrame(({ camera }) => {
    const t = reduceMotion ? 0 : progress.get()
    const position = rail.getPointAt(t)
    camera.position.copy(position)
    target.current.set(MathUtils.lerp(0, 24, t), 0, 0)
    camera.lookAt(target.current)
  })
  return null
}

function StoryChapter({ chapter, index, active, reduceMotion }: { chapter: typeof chapters[number]; index: number; active: MotionValue<number>; reduceMotion: boolean }) {
  const opacity = useTransform(active, [index - 0.42, index, index + 0.42], [0, 1, index === chapters.length - 1 ? 1 : 0])
  const y = useTransform(active, [index - 0.42, index], [24, 0])
  return <motion.article style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}>
    <span>{chapter.tag}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function CameraPathStory() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const active = useTransform(scrollYProgress, [0, 0.31, 0.36, 0.64, 0.69, 1], [0, 0, 1, 1, 2, 2])

  return <section ref={section} className="camera-story-scroll">
    <div className="camera-story-stage">
      <div className="camera-story-canvas"><Canvas camera={{ position: [-0.4, 0.15, 9], fov: 43 }} dpr={[1, 1.5]} gl={{ antialias: true }}><World /><CameraRail progress={scrollYProgress} reduceMotion={reduceMotion} /></Canvas></div>
      <div className="camera-story-vignette" />
      <header className="camera-story-head"><span>MOTION KIT / WORLD 01</span><span>{reduceMotion ? 'REDUCED MOTION' : 'SCROLL TO TRAVEL'}</span></header>
      <div className="camera-story-copy">{chapters.map((chapter, index) => <StoryChapter key={chapter.tag} chapter={chapter} index={index} active={active} reduceMotion={reduceMotion} />)}</div>
      <footer className="camera-story-foot"><span>CONTINUOUS CAMERA PATH · THREE.JS</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }} /></div><span>03 CHAPTERS</span></footer>
    </div>
  </section>
}
