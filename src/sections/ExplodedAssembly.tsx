import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group } from 'three'

const parts = [
  { id: 'body', name: 'Aerodynamic body shell', description: 'The sculpted outer panels shape airflow and protect the passenger cabin.', position: [0, .12, 0] as const, offset: [0, 1.65, 0] as const, code: '01' },
  { id: 'battery', name: 'Electric battery pack', description: 'A structural floor pack stores energy low in the chassis for a balanced ride.', position: [0, -.16, 0] as const, offset: [0, -1.35, 0] as const, code: '02' },
  { id: 'wheels', name: 'Four-motor wheel set', description: 'Four independent wheel assemblies transfer power and grip to the road.', position: [0, -.2, 0] as const, offset: [2.05, .42, 0] as const, code: '03' },
  { id: 'cabin', name: 'Panoramic glass cabin', description: 'A lightweight glazed canopy gives the compact coupe an open, bright interior.', position: [0, .78, -.12] as const, offset: [0, 1.35, -.45] as const, code: '04' },
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

function VehicleModel({ progress, assembled, selected, onSelect }: { progress: MotionValue<number>; assembled: boolean; selected: PartId; onSelect: (id: PartId) => void }) {
  const bodyColor = selected === 'body' ? '#e6edb2' : '#b8c47d'
  const glassColor = selected === 'cabin' ? '#b7d8d4' : '#829b9b'
  return <>
    <ambientLight intensity={.8}/><hemisphereLight args={['#fff6e8', '#484b3d', 1.2]}/><directionalLight position={[4, 7, 5]} intensity={3.6} color="#fff0d2"/><directionalLight position={[-4, 3, -4]} intensity={2.1} color="#c2d5ff"/><pointLight position={[-2, 3, 1]} intensity={20} color="#efc887" distance={10}/>
    <MovingPart id="battery" progress={progress} assembled={assembled} selected={selected === 'battery'} onSelect={onSelect} position={parts[1].position} offset={parts[1].offset}>
      <RoundedBox args={[1.8, .28, 3.15]} radius={.12} smoothness={5} position={[0, -.18, 0]} castShadow><meshStandardMaterial color={selected === 'battery' ? '#d7f36c' : '#717a62'} roughness={.55} metalness={.38}/></RoundedBox>
      {[-1, -.5, 0, .5, 1].map((x) => <mesh key={x} position={[x * .29, -.02, 0]}><boxGeometry args={[.035, .025, 2.65]}/><meshStandardMaterial color="#d1c69f" metalness={.7} roughness={.35}/></mesh>)}
    </MovingPart>
    <MovingPart id="body" progress={progress} assembled={assembled} selected={selected === 'body'} onSelect={onSelect} position={parts[0].position} offset={parts[0].offset}>
      <RoundedBox args={[2.8, .58, 4.5]} radius={.24} smoothness={6} position={[0, .18, 0]} castShadow receiveShadow><meshPhysicalMaterial color={bodyColor} roughness={.24} metalness={.42} clearcoat={.9} clearcoatRoughness={.16}/></RoundedBox>
      <RoundedBox args={[2.72, .38, 1.15]} radius={.15} smoothness={5} position={[0, .48, -1.45]} castShadow><meshPhysicalMaterial color={bodyColor} roughness={.22} metalness={.38} clearcoat={1}/></RoundedBox>
      <RoundedBox args={[2.5, .29, .72]} radius={.12} smoothness={4} position={[0, .42, 1.78]} castShadow><meshPhysicalMaterial color={bodyColor} roughness={.25} metalness={.4} clearcoat={.9}/></RoundedBox>
      {[-1, 1].map((side) => <group key={side}>
        <mesh position={[side * .94, .27, -2.06]} rotation={[0, side * -.12, 0]}><boxGeometry args={[.46, .12, .035]}/><meshStandardMaterial color="#fff3d0" emissive="#ffe5a6" emissiveIntensity={1.2}/></mesh>
        <mesh position={[side * .94, .28, 2.22]}><boxGeometry args={[.44, .1, .035]}/><meshStandardMaterial color="#b55447" emissive="#b55447" emissiveIntensity={.5}/></mesh>
        <mesh position={[side * 1.38, .08, 0]}><boxGeometry args={[.07, .12, 1.35]}/><meshStandardMaterial color="#e4d6b1" metalness={.7} roughness={.3}/></mesh>
      </group>)}
    </MovingPart>
    <MovingPart id="wheels" progress={progress} assembled={assembled} selected={selected === 'wheels'} onSelect={onSelect} position={parts[2].position} offset={parts[2].offset}>
      {[-1, 1].flatMap((side) => [-1, 1].map((longitudinal) => <group key={`${side}-${longitudinal}`} position={[side * 1.3, -.18, longitudinal * 1.42]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[.46, .46, .3, 40]}/><meshStandardMaterial color="#272b29" roughness={.82}/></mesh>
        <mesh position={[side * -.16, 0, 0]}><cylinderGeometry args={[.27, .27, .025, 32]}/><meshStandardMaterial color={selected === 'wheels' ? '#d7f36c' : '#c3b78f'} metalness={.78} roughness={.22}/></mesh>
        <mesh position={[side * -.18, 0, 0]}><cylinderGeometry args={[.1, .1, .03, 24]}/><meshStandardMaterial color="#5e6555" metalness={.65} roughness={.35}/></mesh>
      </group>))}
    </MovingPart>
    <MovingPart id="cabin" progress={progress} assembled={assembled} selected={selected === 'cabin'} onSelect={onSelect} position={parts[3].position} offset={parts[3].offset}>
      <RoundedBox args={[1.82, .92, 2.42]} radius={.27} smoothness={8} position={[0, .14, -.15]} castShadow><meshPhysicalMaterial color={glassColor} roughness={.16} metalness={.2} clearcoat={1} transparent opacity={.82}/></RoundedBox>
      <RoundedBox args={[1.68, .22, 2.05]} radius={.1} smoothness={5} position={[0, .62, -.14]}><meshStandardMaterial color="#313a36" roughness={.32} metalness={.3}/></RoundedBox>
      {[-1, 1].map((side) => <mesh key={side} position={[side * .82, .11, -.15]}><boxGeometry args={[.07, .8, 2.12]}/><meshStandardMaterial color="#d2c69f" metalness={.64} roughness={.32}/></mesh>)}
    </MovingPart>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.04, 0]} receiveShadow><planeGeometry args={[200, 200]}/><shadowMaterial transparent opacity={.22}/></mesh>
  </>
}

export function ExplodedAssembly() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const progressLabel = useTransform(scrollYProgress, (value) => `EXPLODED ${Math.round(value * 100)}%`)
  const [selected, setSelected] = useState<PartId>('body')
  const [assembled, setAssembled] = useState(false)
  const detail = parts.find((part) => part.id === selected) ?? parts[0]
  return <section ref={section} className="assembly-scroll">
    <div className="assembly-stage">
      <Canvas shadows camera={{ position: [5.5, 3.6, 7.3], fov: 37 }} dpr={[1, 1.5]} gl={{ antialias: true }}><color attach="background" args={['#e8e7dd']}/><fog attach="fog" args={['#e8e7dd', 12, 25]}/><VehicleModel progress={scrollYProgress} assembled={assembled || reduceMotion} selected={selected} onSelect={setSelected}/></Canvas>
      <div className="assembly-vignette"/>
      <header className="assembly-head"><span>MOTION KIT / OBJECT STUDY 14</span><span>SCROLL TO DISASSEMBLE · SELECT A PART</span></header>
      <div className="assembly-copy"><span className="eyebrow">DESIGN, IN ITS PARTS</span><h2>Every piece<br/>has a <em>purpose.</em></h2><p>Scroll to take the coupe apart. Select any component to inspect its role, then bring the whole object back together.</p></div>
      <aside className="assembly-inspector"><span>COMPONENT / {detail.code}</span><h3>{detail.name}</h3><p>{detail.description}</p><div className="assembly-part-list">{parts.map((part) => <button key={part.id} className={part.id === selected ? 'active' : ''} onClick={() => setSelected(part.id)}><span>{part.code}</span>{part.name}<i>↗</i></button>)}</div></aside>
      <div className="assembly-controls"><motion.span className="assembly-scroll-label">{assembled ? 'ASSEMBLY RESTORED' : progressLabel}</motion.span><button onClick={() => setAssembled((value) => !value)}>{assembled ? 'Explode assembly' : 'Reassemble'} <b>{assembled ? '↗' : '↙'}</b></button></div>
      <footer className="assembly-footer"><span>FOUR INTERCONNECTED SYSTEMS</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }}/></div><span>THREE.JS · PRODUCT EXPLORATION</span></footer>
    </div>
  </section>
}
