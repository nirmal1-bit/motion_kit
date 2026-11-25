import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react'
import { CatmullRomCurve3, MathUtils, Vector2, Vector3 } from 'three'
import type { Group } from 'three'

function LayerDrift({ pointer, amount, position, children }: { pointer: RefObject<Vector2>; amount: number; position: [number, number, number]; children: ReactNode }) {
  const group = useRef<Group>(null)
  const drift = useRef(new Vector2())
  useFrame((_, delta) => {
    if (!group.current) return
    const targetX = pointer.current.x * amount
    const targetY = pointer.current.y * amount * 0.45
    drift.current.x = MathUtils.damp(drift.current.x, targetX, 4, delta)
    drift.current.y = MathUtils.damp(drift.current.y, targetY, 4, delta)
    group.current.position.set(position[0] + drift.current.x, position[1] + drift.current.y, position[2])
  })
  return <group ref={group} position={position}>{children}</group>
}

function Pine({ position, scale = 1, color = '#587355' }: { position: [number, number, number]; scale?: number; color?: string }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.07, 0.12, 0.8, 8]} /><meshStandardMaterial color="#756d52" roughness={0.9} /></mesh>
    <mesh position={[0, 0.84, 0]}><coneGeometry args={[0.43, 1.05, 8]} /><meshStandardMaterial color={color} roughness={0.82} /></mesh>
    <mesh position={[0, 1.22, 0]}><coneGeometry args={[0.3, 0.8, 8]} /><meshStandardMaterial color={color} roughness={0.82} /></mesh>
  </group>
}

function River() {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-0.55, -0.38, -4.7), new Vector3(-0.15, -0.33, -3.6), new Vector3(0.55, -0.34, -2.3),
      new Vector3(0.4, -0.3, -1), new Vector3(-0.45, -0.27, 0.5), new Vector3(-0.6, -0.22, 2.3),
    ])
    return curve
  }, [])
  return <mesh position={[0, 0, 0]}><tubeGeometry args={[geometry, 80, 0.13, 10, false]} /><meshStandardMaterial color="#8eb9b4" roughness={0.24} metalness={0.12} /></mesh>
}

function CameraDrift({ pointer }: { pointer: RefObject<Vector2> }) {
  const drift = useRef(new Vector2())
  const lookAt = useRef(new Vector3())
  useFrame(({ camera }, delta) => {
    drift.current.x = MathUtils.damp(drift.current.x, pointer.current.x * 0.45, 3.5, delta)
    drift.current.y = MathUtils.damp(drift.current.y, pointer.current.y * 0.27, 3.5, delta)
    camera.position.set(drift.current.x, 1.6 + drift.current.y, 12)
    lookAt.current.set(drift.current.x * 0.24, 0.3 + drift.current.y * 0.15, -1.2)
    camera.lookAt(lookAt.current)
  })
  return null
}

function Diorama({ pointer }: { pointer: RefObject<Vector2> }) {
  return <>
    <color attach="background" args={['#d9e0d3']} />
    <fog attach="fog" args={['#d9e0d3', 17, 32]} />
    <ambientLight intensity={0.78} />
    <hemisphereLight args={['#fff7df', '#58654b', 1.25]} />
    <directionalLight position={[-4, 9, 6]} intensity={2.2} color="#fff1d1" />
    <pointLight position={[3, 5, -3]} intensity={17} distance={15} color="#f6cf91" />
    <CameraDrift pointer={pointer} />

    <mesh position={[0, -1.05, -1.2]}><cylinderGeometry args={[6.3, 6.55, 0.55, 72]} /><meshStandardMaterial color="#736d56" roughness={0.8} /></mesh>
    <mesh position={[0, -0.77, -1.2]}><cylinderGeometry args={[6.25, 6.3, 0.12, 72]} /><meshStandardMaterial color="#8c9d73" roughness={0.96} /></mesh>

    <LayerDrift pointer={pointer} amount={0.22} position={[0, -0.46, -6.2]}>
      <mesh position={[-3.5, 1.6, -2]}><coneGeometry args={[2.5, 4.4, 7]} /><meshStandardMaterial color="#9aa68e" roughness={0.95} /></mesh>
      <mesh position={[0, 1.95, -2.4]}><coneGeometry args={[3.1, 5.1, 7]} /><meshStandardMaterial color="#84947d" roughness={0.95} /></mesh>
      <mesh position={[3.7, 1.45, -2]}><coneGeometry args={[2.35, 4.1, 7]} /><meshStandardMaterial color="#9da995" roughness={0.95} /></mesh>
    </LayerDrift>

    <LayerDrift pointer={pointer} amount={0.95} position={[0, -0.38, -2.7]}>
      <mesh position={[-3.5, -0.34, -1.6]} scale={[1.9, 0.75, 1]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#829474" roughness={0.9} /></mesh>
      <mesh position={[2.8, -0.46, -1.8]} scale={[2.1, 0.8, 1.2]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#6f866b" roughness={0.9} /></mesh>
      <River />
      <Pine position={[-3.55, -0.32, -0.2]} scale={0.82} color="#476653" />
      <Pine position={[3.65, -0.28, -1.1]} scale={0.72} color="#567658" />
    </LayerDrift>

    <LayerDrift pointer={pointer} amount={1.85} position={[0, -0.48, 0.8]}>
      <Pine position={[-4.2, -0.22, 0.8]} scale={1.05} color="#3e604d" />
      <Pine position={[4.25, -0.2, -0.2]} scale={1.12} color="#466c53" />
      <Pine position={[-2.9, -0.2, 2.7]} scale={0.6} color="#688361" />
      <Pine position={[3.1, -0.18, 2.2]} scale={0.58} color="#69815f" />
      <mesh position={[0.5, -0.32, 3.1]} scale={[0.5, 0.24, 0.42]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#9b9070" roughness={0.95} /></mesh>
      <mesh position={[-1.1, -0.34, 3.5]} scale={[0.35, 0.2, 0.3]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#a69a78" roughness={0.95} /></mesh>
    </LayerDrift>
  </>
}

export function DioramaParallax() {
  const pointer = useRef(new Vector2())
  const reduceMotion = Boolean(useReducedMotion())
  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const motionScale = reduceMotion ? 0.5 : 1
    pointer.current.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2 * motionScale, -((event.clientY - bounds.top) / bounds.height - 0.5) * 2 * motionScale)
  }
  const reset = () => pointer.current.set(0, 0)

  return <section className="diorama-demo" onPointerMove={move} onPointerLeave={reset}>
    <Canvas className="diorama-canvas" camera={{ position: [0, 1.6, 12], fov: 38 }} dpr={[1, 1.5]}><Diorama pointer={pointer} /></Canvas>
    <div className="diorama-shade" />
    <header className="diorama-head"><span>MINIATURE WORLD / 01</span><span>{reduceMotion ? 'GENTLE POINTER RESPONSE' : 'MOVE TO LOOK AROUND'}</span></header>
    <div className="diorama-copy"><span>POINTER / DEPTH STUDY</span><h2>A world<br />in <em>layers.</em></h2><p>Move your pointer to shift the foreground, midground, and distant landscape at different speeds.</p><div className="diorama-legend"><i /><span>FOREGROUND</span><i /><span>MIDGROUND</span><i /><span>BACKDROP</span></div></div>
    <motion.div className="diorama-hint" animate={reduceMotion ? undefined : { y: [0, -4, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>✳</motion.div>
    <footer className="diorama-foot"><span>DRAG OR MOVE TO EXPLORE</span><span>PARALLAX / 03 LAYERS</span></footer>
  </section>
}
