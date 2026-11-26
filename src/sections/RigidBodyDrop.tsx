import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Group, MathUtils } from 'three'

const blocks = [
  { start: .08, end: .27, landing: [.45, -.52, .06] as [number,number,number], color: '#d3b472', size: [.66,.6,.62] as [number,number,number], spin: [0,0,1.2] as [number,number,number] },
  { start: .28, end: .48, landing: [1.28, -.52, -.02] as [number,number,number], color: '#829b7a', size: [.58,.72,.58] as [number,number,number], spin: [1.1,0,-.6] as [number,number,number] },
  { start: .5, end: .7, landing: [.74, .08, -.08] as [number,number,number], color: '#bd8870', size: [.54,.52,.62] as [number,number,number], spin: [.5,1.2,.7] as [number,number,number] },
  { start: .7, end: .9, landing: [1.24, .09, .08] as [number,number,number], color: '#8e9aa0', size: [.52,.56,.52] as [number,number,number], spin: [-.7,.5,1] as [number,number,number] },
]

export function RigidBodyDrop() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section ref={section} className="drop-scroll"><div className="drop-stage">
    <Canvas camera={{ position: [0, 1, 6.6], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#1a211e']}/><fog attach="fog" args={['#1a211e', 9, 18]}/>
      <ambientLight intensity={.7}/><hemisphereLight args={['#f6ead3', '#27302a', 1.1]}/><directionalLight position={[-3,5,6]} intensity={3.3} color="#fff0d8"/><pointLight position={[2,2,3]} intensity={8} color="#d7c08c" distance={9}/>
      <Container/>{blocks.map((block,i)=><FallingBlock key={i} block={block} index={i} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.04,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#252d28" roughness={.85}/></mesh>
    </Canvas>
    <div className="drop-head"><span>PHYSICS STUDY / 01</span><span>SCROLL TO DROP THE LOAD ↓</span></div>
    <div className="drop-copy"><span>WEIGHT · IMPACT · SETTLE</span><h2>Give it<br/><em>some weight.</em></h2><p>Each block falls into the steel bin, strikes the base or another block, then settles with a short rebound.</p></div>
    <div className="drop-labels"><span>01 / DROP</span><span>02 / IMPACT</span><span>03 / SETTLE</span></div>
    <div className="drop-foot"><span>GRAVITY · BOUNCE · REST</span><div><motion.i style={{ scaleX: reduceMotion ? 1 : scrollYProgress, transformOrigin: 'left' }}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function FallingBlock({ block, index, progress, reduceMotion }: { block: typeof blocks[number]; index: number; progress: MotionValue<number>; reduceMotion: boolean }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    const p = reduceMotion ? 1 : progress.get()
    const phase = MathUtils.clamp((p - block.start) / (block.end - block.start), 0, 1)
    const t = phase * phase * (3 - 2 * phase)
    const bounce = phase > .72 ? Math.sin((phase - .72) * Math.PI * 3) * Math.exp(-(phase - .72) * 12) * .22 : 0
    const startY = 2.3 + index * .22
    const targetY = block.landing[1] + bounce
    const x = MathUtils.lerp(index % 2 ? .22 : -.18, block.landing[0], t)
    const y = MathUtils.lerp(startY, targetY, t)
    const z = MathUtils.lerp(.15 * (index % 2 ? 1 : -1), block.landing[2], t)
    group.current.position.x = MathUtils.damp(group.current.position.x, x, 18, delta)
    group.current.position.y = MathUtils.damp(group.current.position.y, y, 18, delta)
    group.current.position.z = MathUtils.damp(group.current.position.z, z, 18, delta)
    const rotation = t
    group.current.rotation.set(block.spin[0] * rotation, block.spin[1] * rotation, block.spin[2] * rotation)
    const scale = phase === 0 ? .001 : 1
    group.current.scale.set(block.size[0] * scale, block.size[1] * scale, block.size[2] * scale)
  })
  return <group ref={group}>
    <mesh castShadow receiveShadow><boxGeometry args={[1,1,1]}/><meshStandardMaterial color={block.color} roughness={.38} metalness={.16}/></mesh>
    <mesh position={[0,0,.506]}><boxGeometry args={[.72,.72,.012]}/><meshStandardMaterial color="#f1ead8" roughness={.75}/></mesh>
    <mesh position={[0,0,.516]}><boxGeometry args={[.045,.5,.01]}/><meshStandardMaterial color="#656b5c" roughness={.8}/></mesh>
  </group>
}

function Container() {
  return <group position={[.9,-.35,0]}>
    <mesh position={[0,-.55,0]}><boxGeometry args={[2.35,.16,1.5]}/><meshStandardMaterial color="#73786e" metalness={.72} roughness={.3}/></mesh>
    <mesh position={[-1.1,-.05,0]}><boxGeometry args={[.16,1.05,1.5]}/><meshStandardMaterial color="#85877a" metalness={.68} roughness={.32}/></mesh>
    <mesh position={[1.1,-.05,0]}><boxGeometry args={[.16,1.05,1.5]}/><meshStandardMaterial color="#85877a" metalness={.68} roughness={.32}/></mesh>
    <mesh position={[0,-.53,.77]}><boxGeometry args={[2.35,.98,.08]}/><meshStandardMaterial color="#a0a092" metalness={.62} roughness={.35}/></mesh>
    <mesh position={[0,-.53,-.77]}><boxGeometry args={[2.35,.98,.08]}/><meshStandardMaterial color="#6d7268" metalness={.66} roughness={.34}/></mesh>
    <mesh position={[0,.49,0]}><boxGeometry args={[2.52,.11,1.62]}/><meshStandardMaterial color="#c1b18b" metalness={.72} roughness={.25}/></mesh>
  </group>
}
