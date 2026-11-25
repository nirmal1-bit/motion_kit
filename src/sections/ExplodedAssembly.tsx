import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group } from 'three'

const parts = [
  { id: 'shade', name: 'Spun aluminum shade', description: 'A broad, lightweight shell directs light toward the work surface.', position: [0, 2.2, 0] as const, offset: [0, 1.55, 0] as const, code: '01' },
  { id: 'bulb', name: 'Warm LED module', description: 'A replaceable low-energy light source sits inside the shade.', position: [0, 1.68, 0] as const, offset: [1.15, 0.45, 0.1] as const, code: '02' },
  { id: 'stem', name: 'Balanced support arm', description: 'A slim articulated stem supports the shade and keeps its profile light.', position: [0, .82, 0] as const, offset: [-1.15, -.05, 0] as const, code: '03' },
  { id: 'base', name: 'Weighted cast base', description: 'A low weighted base keeps the lamp stable on a busy desk.', position: [0, -.12, 0] as const, offset: [0, -1.1, 0] as const, code: '04' },
]

type PartId = (typeof parts)[number]['id']

function MovingPart({ id, progress, assembled, selected, onSelect, children, position, offset }: {
  id: PartId; progress: MotionValue<number>; assembled: boolean; selected: boolean; onSelect: (id: PartId) => void
  children: React.ReactNode; position: readonly [number, number, number]; offset: readonly [number, number, number]
}) {
  const group = useRef<Group>(null)
  const origin = new Vector3(...position)
  const exploded = new Vector3(position[0] + offset[0], position[1] + offset[1], position[2] + offset[2])
  useFrame((_, delta) => {
    if (!group.current) return
    const amount = assembled ? 0 : progress.get()
    const destination = origin.clone().lerp(exploded, amount)
    group.current.position.x = MathUtils.damp(group.current.position.x, destination.x, 6, delta)
    group.current.position.y = MathUtils.damp(group.current.position.y, destination.y, 6, delta)
    group.current.position.z = MathUtils.damp(group.current.position.z, destination.z, 6, delta)
    const targetScale = selected ? 1.045 : 1
    group.current.scale.setScalar(MathUtils.damp(group.current.scale.x, targetScale, 5, delta))
  })
  return <group ref={group} position={position} onPointerDown={(event) => { event.stopPropagation(); onSelect(id) }} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>{children}</group>
}

function LampModel({ progress, assembled, selected, onSelect }: { progress: MotionValue<number>; assembled: boolean; selected: PartId; onSelect: (id: PartId) => void }) {
  const brass = '#b99a68'
  const shade = selected === 'shade' ? '#e1eaac' : '#c7ceaa'
  return <>
    <ambientLight intensity={.72}/><hemisphereLight args={['#fff4df', '#40473b', 1.35]}/><directionalLight position={[4, 7, 5]} intensity={3.5} color="#fff0d2"/><pointLight position={[-2, 3, 1]} intensity={30} color="#e8b76f" distance={8}/>
    <MovingPart id="base" progress={progress} assembled={assembled} selected={selected === 'base'} onSelect={onSelect} position={parts[3].position} offset={parts[3].offset}><mesh castShadow receiveShadow><cylinderGeometry args={[.77, .88, .22, 64]}/><meshStandardMaterial color={selected === 'base' ? '#d1b47f' : brass} roughness={.28} metalness={.76}/></mesh><mesh position={[0, .12, 0]}><torusGeometry args={[.7, .025, 12, 64]}/><meshStandardMaterial color="#e4d5b2" metalness={.65} roughness={.25}/></mesh></MovingPart>
    <MovingPart id="stem" progress={progress} assembled={assembled} selected={selected === 'stem'} onSelect={onSelect} position={parts[2].position} offset={parts[2].offset}><mesh castShadow><cylinderGeometry args={[.07, .085, 1.75, 28]}/><meshStandardMaterial color={selected === 'stem' ? '#e0c18d' : brass} roughness={.22} metalness={.78}/></mesh><mesh position={[0, .83, 0]}><sphereGeometry args={[.16, 20, 20]}/><meshStandardMaterial color="#dcc497" metalness={.72} roughness={.24}/></mesh></MovingPart>
    <MovingPart id="shade" progress={progress} assembled={assembled} selected={selected === 'shade'} onSelect={onSelect} position={parts[0].position} offset={parts[0].offset}><mesh castShadow rotation={[Math.PI, 0, 0]}><cylinderGeometry args={[.28, .75, .57, 64, 1, true]}/><meshStandardMaterial color={shade} roughness={.33} metalness={.34} side={2}/></mesh><mesh position={[0, -.28, 0]} rotation={[Math.PI, 0, 0]}><torusGeometry args={[.74, .035, 12, 64]}/><meshStandardMaterial color="#dfd9bc" metalness={.62} roughness={.27}/></mesh></MovingPart>
    <MovingPart id="bulb" progress={progress} assembled={assembled} selected={selected === 'bulb'} onSelect={onSelect} position={parts[1].position} offset={parts[1].offset}><mesh><sphereGeometry args={[.19, 28, 28]}/><meshStandardMaterial color="#fff1bd" emissive="#ffc866" emissiveIntensity={selected === 'bulb' ? 2.8 : 1.6} roughness={.25}/></mesh><pointLight intensity={18} distance={5} color="#ffd184"/></MovingPart>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow><planeGeometry args={[200, 200]}/><shadowMaterial transparent opacity={.2}/></mesh>
  </>
}

export function ExplodedAssembly() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const progressLabel = useTransform(scrollYProgress, (value) => `EXPLODED ${Math.round(value * 100)}%`)
  const [selected, setSelected] = useState<PartId>('shade')
  const [assembled, setAssembled] = useState(false)
  const detail = parts.find((part) => part.id === selected) ?? parts[0]
  return <section ref={section} className="assembly-scroll">
    <div className="assembly-stage">
      <Canvas shadows camera={{ position: [5, 3.7, 7], fov: 34 }} dpr={[1, 1.5]} gl={{ antialias: true }}><color attach="background" args={['#e8e7dd']}/><fog attach="fog" args={['#e8e7dd', 12, 25]}/><LampModel progress={scrollYProgress} assembled={assembled || reduceMotion} selected={selected} onSelect={setSelected}/></Canvas>
      <div className="assembly-vignette"/>
      <header className="assembly-head"><span>MOTION KIT / OBJECT STUDY 14</span><span>SCROLL TO DISASSEMBLE · SELECT A PART</span></header>
      <div className="assembly-copy"><span className="eyebrow">DESIGN, IN ITS PARTS</span><h2>Every piece<br/>has a <em>purpose.</em></h2><p>Scroll to take the lamp apart. Select any component to inspect its role, then bring the whole object back together.</p></div>
      <aside className="assembly-inspector"><span>COMPONENT / {detail.code}</span><h3>{detail.name}</h3><p>{detail.description}</p><div className="assembly-part-list">{parts.map((part) => <button key={part.id} className={part.id === selected ? 'active' : ''} onClick={() => setSelected(part.id)}><span>{part.code}</span>{part.name}<i>↗</i></button>)}</div></aside>
      <div className="assembly-controls"><motion.span className="assembly-scroll-label">{assembled ? 'ASSEMBLY RESTORED' : progressLabel}</motion.span><button onClick={() => setAssembled((value) => !value)}>{assembled ? 'Explode assembly' : 'Reassemble'} <b>{assembled ? '↗' : '↙'}</b></button></div>
      <footer className="assembly-footer"><span>FOUR PRECISION-MADE COMPONENTS</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }}/></div><span>THREE.JS · PRODUCT EXPLORATION</span></footer>
    </div>
  </section>
}
