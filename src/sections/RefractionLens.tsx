import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Group } from 'three'

function GlassLens({ x, y, reduceMotion }: { x: MotionValue<number>; y: MotionValue<number>; reduceMotion: boolean }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    const targetX = x.get() * 1.15
    const targetY = y.get() * .62
    const follow = Math.min(1, delta * (reduceMotion ? 18 : 5))
    group.current.position.x += (targetX - group.current.position.x) * follow
    group.current.position.y += (targetY - group.current.position.y) * follow
    group.current.rotation.y += (targetX * .12 - group.current.rotation.y) * follow
    group.current.rotation.x += (-targetY * .12 - group.current.rotation.x) * follow
  })
  return <group ref={group}>
    <mesh>
      <sphereGeometry args={[.52, 64, 64]} />
      <meshPhysicalMaterial color="#f4f7ff" roughness={.04} metalness={0} transmission={1} thickness={1.6} ior={1.38} clearcoat={1} clearcoatRoughness={.03} transparent />
    </mesh>
    <mesh scale={1.015}>
      <sphereGeometry args={[.52, 64, 64]} />
      <meshBasicMaterial color="#d9e6ff" wireframe transparent opacity={.08} />
    </mesh>
  </group>
}

export function RefractionLens() {
  const field = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const reduceMotion = Boolean(useReducedMotion())
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 100, damping: 22, mass: .6 })
  const y = useSpring(rawY, { stiffness: 100, damping: 22, mass: .6 })
  const hintX = useTransform(x, (value) => `${50 + value * 45}%`)
  const hintY = useTransform(y, (value) => `${50 - value * 45}%`)

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = field.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set(((event.clientX - rect.left) / rect.width - .5) * 2)
    rawY.set(-((event.clientY - rect.top) / rect.height - .5) * 2)
  }

  return <section className="refraction-demo" ref={field} onPointerMove={move} onPointerEnter={(event) => { if (event.pointerType !== 'touch') setActive(true) }} onPointerLeave={() => { setActive(false); rawX.set(0); rawY.set(0) }}>
    <div className="refraction-background"><div className="refraction-top"><span>OPTICAL STUDY / 01</span><span>MOVE THROUGH THE SURFACE</span></div><div className="refraction-copy"><span>LIGHT / MATERIAL / SPACE</span><h2>A closer<br/>point of <em>view.</em></h2><p>A moving glass lens refracts the light around it as you explore the canvas.</p></div><div className="refraction-art"><div className="refraction-orbit orbit-a"/><div className="refraction-orbit orbit-b"/><div className="refraction-sun"/><span>REFRACTION<br/>INDEX 1.38</span></div><div className="refraction-bottom"><span>REAL-TIME GLASS MATERIAL</span><span>THREE.JS · WEBGL</span></div></div>
    <Canvas className="refraction-canvas" orthographic camera={{ position: [0, 0, 8], zoom: 1 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}><ambientLight intensity={.65}/><directionalLight position={[-3, 4, 5]} intensity={3}/><pointLight position={[3, 2, -2]} intensity={20} color="#91b9ff"/><pointLight position={[-3, -2, 1]} intensity={15} color="#ffd3a1"/><GlassLens x={x} y={y} reduceMotion={reduceMotion}/><Environment preset="studio"/></Canvas>
    <motion.div className="refraction-live-lens" style={{ left: hintX, top: hintY }} animate={{ opacity: active ? 1 : .78 }}><span/></motion.div>
    {active && <motion.div className="refraction-pointer-hint" style={{ left: hintX, top: hintY }} animate={{ opacity: 1 }}><span>GLASS / 1.38</span></motion.div>}
  </section>
}
