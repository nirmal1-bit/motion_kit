import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { MathUtils, Vector2 } from 'three'
import type { Group } from 'three'

const parts = [
  { id: 'glass', name: 'Hand-blown glass', description: 'A softly weighted vessel with thick glass at the base and a clear, curved shoulder.', code: '01' },
  { id: 'essence', name: 'Amber essence', description: 'The warm-toned fragrance sits inside the clear vessel, visible through the glass.', code: '02' },
  { id: 'atomizer', name: 'Precision atomizer', description: 'A fine-mist pump lifts from the neck, revealing its collar, stem, and nozzle.', code: '03' },
  { id: 'cap', name: 'Brushed brass cap', description: 'A satin-metal cap protects the sprayer and completes the bottle silhouette.', code: '04' },
] as const

type PartId = (typeof parts)[number]['id']
const bottleProfile = [
  new Vector2(0, -.98), new Vector2(.48, -.98), new Vector2(.63, -.93), new Vector2(.68, -.82),
  new Vector2(.68, -.32), new Vector2(.66, .12), new Vector2(.61, .36), new Vector2(.47, .52),
  new Vector2(.29, .62), new Vector2(.27, .88), new Vector2(.26, .96), new Vector2(0, .96),
]

function AnimatedPart({ id, progress, assembled, selected, onSelect, position, offset, children }: {
  id: PartId; progress: MotionValue<number>; assembled: boolean; selected: boolean; onSelect: (id: PartId) => void
  position: readonly [number, number, number]; offset: readonly [number, number, number]; children: React.ReactNode
}) {
  const group = useRef<Group>(null)
  const target = useMemo(() => [position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]], [position, offset])
  useFrame((_, delta) => {
    if (!group.current) return
    const raw = assembled ? 0 : progress.get()
    const amount = raw * raw * (3 - 2 * raw)
    group.current.position.x = MathUtils.damp(group.current.position.x, MathUtils.lerp(position[0], target[0], amount), 7, delta)
    group.current.position.y = MathUtils.damp(group.current.position.y, MathUtils.lerp(position[1], target[1], amount), 7, delta)
    group.current.position.z = MathUtils.damp(group.current.position.z, MathUtils.lerp(position[2], target[2], amount), 7, delta)
    const scale = selected ? 1.035 : 1
    group.current.scale.setScalar(MathUtils.damp(group.current.scale.x, scale, 6, delta))
  })
  return <group ref={group} position={position} onPointerDown={(event) => { event.stopPropagation(); onSelect(id) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>{children}</group>
}

function BottleScene({ progress, assembled, selected, onSelect }: { progress: MotionValue<number>; assembled: boolean; selected: PartId; onSelect: (id: PartId) => void }) {
  return <>
    <color attach="background" args={['#171c19']}/><fog attach="fog" args={['#171c19', 9, 23]}/>
    <ambientLight intensity={.7}/><hemisphereLight args={['#f4ead8', '#202a24', 1.2]}/>
    <directionalLight position={[4, 6, 5]} intensity={3.2} color="#fff1d8"/>
    <pointLight position={[-2.5, 1.5, 2]} intensity={27} color="#eac07b" distance={8}/>
    <pointLight position={[2.7, 2.5, -2]} intensity={30} color="#b3d2c8" distance={9}/>
    <spotLight position={[0, 6, 3]} angle={.52} penumbra={.85} intensity={65} color="#f8edcc" distance={12}/>
    <AnimatedPart id="glass" progress={progress} assembled={assembled} selected={selected === 'glass'} onSelect={onSelect} position={[0, 0, 0]} offset={[-.75, 0, 0]}>
      <mesh castShadow receiveShadow><latheGeometry args={[bottleProfile, 72]}/><meshPhysicalMaterial color={selected === 'glass' ? '#cfe7d4' : '#9ebbb0'} roughness={.08} metalness={.05} transmission={.94} thickness={.32} ior={1.46} transparent opacity={.42} side={2}/></mesh>
      <mesh position={[0, -.89, 0]}><torusGeometry args={[.54, .035, 16, 72]}/><meshStandardMaterial color="#d9e2d4" metalness={.5} roughness={.2}/></mesh>
      <mesh position={[0, .25, .681]}><planeGeometry args={[.75, .48]}/><meshStandardMaterial color="#ede5d2" roughness={.65}/></mesh>
      <mesh position={[0, .25, .695]}><planeGeometry args={[.69, .42]}/><meshStandardMaterial color="#28332c" roughness={.72}/></mesh>
      <mesh position={[0, .25, .708]}><planeGeometry args={[.018, .31]}/><meshStandardMaterial color="#c3a66b" metalness={.7} roughness={.25}/></mesh>
    </AnimatedPart>
    <AnimatedPart id="essence" progress={progress} assembled={assembled} selected={selected === 'essence'} onSelect={onSelect} position={[0, 0, 0]} offset={[0, -1.18, 0]}>
      <mesh position={[0, -.35, 0]}><cylinderGeometry args={[.535, .57, .92, 64]}/><meshPhysicalMaterial color="#b67336" roughness={.18} metalness={.08} transparent opacity={.84} transmission={.08}/></mesh>
      <mesh position={[0, .12, 0]}><cylinderGeometry args={[.52, .52, .035, 64]}/><meshStandardMaterial color="#d8a35d" roughness={.2} metalness={.2}/></mesh>
    </AnimatedPart>
    <AnimatedPart id="atomizer" progress={progress} assembled={assembled} selected={selected === 'atomizer'} onSelect={onSelect} position={[0, .92, 0]} offset={[1.18, .38, .05]}>
      <mesh><cylinderGeometry args={[.25, .25, .15, 48]}/><meshStandardMaterial color="#c9a76a" metalness={.78} roughness={.22}/></mesh>
      <mesh position={[0, -.37, 0]}><cylinderGeometry args={[.035, .035, .62, 20]}/><meshStandardMaterial color="#d6d0bd" metalness={.45} roughness={.24}/></mesh>
      <mesh position={[0, .15, 0]}><cylinderGeometry args={[.075, .09, .19, 24]}/><meshStandardMaterial color="#e3d5b2" metalness={.62} roughness={.2}/></mesh>
      <mesh position={[.15, .22, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[.055, .07, .32, 24]}/><meshStandardMaterial color="#d9d3c1" metalness={.55} roughness={.2}/></mesh>
      <mesh position={[.31, .22, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[.045, .045, .035, 24]}/><meshStandardMaterial color="#292f2a" roughness={.3}/></mesh>
    </AnimatedPart>
    <AnimatedPart id="cap" progress={progress} assembled={assembled} selected={selected === 'cap'} onSelect={onSelect} position={[0, 1.06, 0]} offset={[0, 1.35, 0]}>
      <mesh castShadow><cylinderGeometry args={[.31, .31, .72, 64, 1]}/><meshStandardMaterial color="#b89b65" metalness={.82} roughness={.25}/></mesh>
      <mesh position={[0, -.36, 0]}><torusGeometry args={[.28, .028, 14, 64]}/><meshStandardMaterial color="#ead8aa" metalness={.78} roughness={.2}/></mesh>
      <mesh position={[0, .34, 0]}><cylinderGeometry args={[.29, .31, .045, 64]}/><meshStandardMaterial color="#d1b577" metalness={.8} roughness={.22}/></mesh>
    </AnimatedPart>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.12, 0]} receiveShadow><planeGeometry args={[100, 100]}/><shadowMaterial transparent opacity={.28}/></mesh>
  </>
}

export function ExplodedAssembly() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const explodeProgress = useTransform(scrollYProgress, [0, .14, .72, 1], [0, .04, 1, 1])
  const stillProgress = useTransform(scrollYProgress, () => 0)
  const sceneProgress = reduceMotion ? stillProgress : explodeProgress
  const progressLabel = useTransform(explodeProgress, (value) => `OPEN ${Math.round(value * 100)}%`)
  const [selected, setSelected] = useState<PartId>('glass')
  const [assembled, setAssembled] = useState(false)
  const detail = parts.find((part) => part.id === selected) ?? parts[0]
  return <section ref={section} className="assembly-scroll">
    <div className="assembly-stage">
      <Canvas shadows camera={{ position: [4.5, 2.7, 6.5], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <BottleScene progress={sceneProgress} assembled={assembled || reduceMotion} selected={selected} onSelect={setSelected}/>
      </Canvas>
      <div className="assembly-vignette"/>
      <header className="assembly-head"><span>OBJECT STUDY / 014</span><span>SCROLL TO OPEN · SELECT A COMPONENT</span></header>
      <div className="assembly-copy"><span className="eyebrow">EAU DE PARFUM · NO. 04</span><h2>A little<br/>closer to <em>essence.</em></h2><p>Scroll to reveal the bottle’s layers. Select a component to inspect it, then bring the fragrance back together.</p></div>
      <aside className="assembly-inspector"><span>COMPONENT / {detail.code}</span><h3>{detail.name}</h3><p>{detail.description}</p><div className="assembly-part-list">{parts.map((part) => <button key={part.id} className={part.id === selected ? 'active' : ''} onClick={() => setSelected(part.id)}><span>{part.code}</span>{part.name}<i>↗</i></button>)}</div></aside>
      <div className="assembly-controls"><motion.span className="assembly-scroll-label">{assembled ? 'BOTTLE RESTORED' : progressLabel}</motion.span><button onClick={() => setAssembled((value) => !value)}>{assembled ? 'Resume scroll reveal' : 'Reassemble bottle'} <b>{assembled ? '↗' : '↙'}</b></button></div>
      <footer className="assembly-footer"><span>FOUR LAYERS · ONE SIGNATURE</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }}/></div><span>GLASS · ESSENCE · ATOMIZER · BRASS</span></footer>
    </div>
  </section>
}
