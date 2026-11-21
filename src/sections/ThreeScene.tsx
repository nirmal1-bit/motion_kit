import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { useReducedMotion } from 'framer-motion'

function Sculpture({ reduceMotion }: { reduceMotion: boolean }) {
  const mesh = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!mesh.current || reduceMotion) return
    mesh.current.rotation.y += delta * 0.28
    mesh.current.rotation.x += delta * 0.12
  })

  return (
    <Float speed={reduceMotion ? 0 : 1.5} rotationIntensity={reduceMotion ? 0 : 0.35} floatIntensity={reduceMotion ? 0 : 0.6}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[0.9, 0.28, 180, 24, 2, 3]} />
        <meshStandardMaterial color="#d4fa74" roughness={0.24} metalness={0.55} />
      </mesh>
    </Float>
  )
}

export function ThreeScene() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="three-scene">
      <Canvas camera={{ position: [0, 0, 4.3], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 4, 3]} intensity={3} color="#ffffff" />
        <pointLight position={[-3, -2, 1]} intensity={18} color="#f99067" />
        <Sculpture reduceMotion={Boolean(reduceMotion)} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={6} />
      </Canvas>
      <div className="three-label"><strong>Little worlds</strong><span>Three.js · drag to orbit</span></div>
    </div>
  )
}
