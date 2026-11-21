import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Group, Mesh } from 'three'
import type { MotionValue } from 'framer-motion'

function createSaturnTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const context = canvas.getContext('2d')!
  const bands = ['#806b57', '#c0a582', '#d1b995', '#9d8064', '#d7c4a4', '#b29473', '#e0cfb2', '#8b735d']
  bands.forEach((color, index) => {
    const y = index * canvas.height / bands.length
    context.fillStyle = color
    context.fillRect(0, y, canvas.width, canvas.height / bands.length + 1)
    context.fillStyle = index % 2 ? '#e3cfaa22' : '#30271d20'
    for (let line = 0; line < 5; line++) {
      const stripeY = y + line * 8 + Math.sin(line * .9 + index) * 3
      context.fillRect(0, stripeY, canvas.width, 2 + (line % 3))
    }
  })
  for (let i = 0; i < 110; i++) {
    const y = Math.random() * canvas.height
    const h = 1 + Math.random() * 5
    context.fillStyle = `rgba(248,226,192,${Math.random() * .12})`
    context.fillRect(Math.random() * canvas.width, y, 30 + Math.random() * 300, h)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function Saturn({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const group = useRef<Group>(null)
  const moons = useRef<Group>(null)
  const planet = useRef<Mesh>(null)
  const texture = useMemo(createSaturnTexture, [])

  useFrame((_, delta) => {
    if (!group.current || !moons.current || !planet.current) return
    const p = reduceMotion ? .5 : progress.get()
    const ease = Math.min(1, delta * 2.6)
    group.current.rotation.y += (p * Math.PI * 1.7 - group.current.rotation.y) * ease
    group.current.rotation.x += ((p - .5) * .24 - group.current.rotation.x) * ease
    moons.current.rotation.y += (p * Math.PI * 3 - moons.current.rotation.y) * ease
    planet.current.rotation.y += delta * (reduceMotion ? 0 : .045)
  })

  return <group ref={group}>
    <mesh ref={planet}>
      <sphereGeometry args={[.8, 96, 96]} />
      <meshStandardMaterial map={texture} roughness={.92} metalness={0} />
    </mesh>
    <mesh rotation={[1.2, 0, -.28]}>
      <ringGeometry args={[1.06, 1.2, 256]} /><meshStandardMaterial color="#62584c" side={2} roughness={1} metalness={0} />
    </mesh>
    <mesh rotation={[1.2, 0, -.28]}>
      <ringGeometry args={[1.2, 1.48, 256]} /><meshStandardMaterial color="#b4a58c" side={2} roughness={.94} metalness={0} />
    </mesh>
    <mesh rotation={[1.2, 0, -.28]}>
      <ringGeometry args={[1.5, 1.61, 256]} /><meshStandardMaterial color="#776957" side={2} roughness={1} metalness={0} />
    </mesh>
    <mesh rotation={[1.2, 0, -.28]}>
      <ringGeometry args={[1.64, 1.7, 256]} /><meshStandardMaterial color="#c1b399" side={2} roughness={.96} metalness={0} />
    </mesh>
    <group ref={moons}>
      <mesh position={[2.03, .14, 0]}><sphereGeometry args={[.12, 32, 32]} /><meshStandardMaterial color="#b6afa3" roughness={.94} /></mesh>
      <mesh position={[-2.25, .52, .2]}><sphereGeometry args={[.075, 24, 24]} /><meshStandardMaterial color="#827d74" roughness={1} /></mesh>
      <mesh position={[.2, -.48, 2.16]}><sphereGeometry args={[.052, 24, 24]} /><meshStandardMaterial color="#c8c0b2" roughness={.9} /></mesh>
    </group>
  </group>
}

export function SequenceModel({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  return <Canvas camera={{ position: [0, 0, 5.6], fov: 37 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
    <ambientLight intensity={.24} />
    <directionalLight position={[-3, 2, 4]} intensity={3.2} color="#fff0d5" />
    <pointLight position={[3, -1, -2]} intensity={7} color="#7189b0" />
    <Saturn progress={progress} reduceMotion={reduceMotion} />
    <Environment preset="night" />
  </Canvas>
}
