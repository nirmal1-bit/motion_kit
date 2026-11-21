import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CanvasTexture, Color, Float32BufferAttribute, Mesh, SRGBColorSpace, SphereGeometry } from 'three'
import type { MotionValue } from 'framer-motion'

const colorFrom = new Color()
const colors = ['#b88f62', '#64a879', '#9670c7'].map((value) => new Color(value))

function createSurfaceTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#b9ab91'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 16000; i++) {
    const shade = Math.random() > .5 ? 255 : 38
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${Math.random() * .13})`
    const size = Math.random() * 2.2
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, size, size)
  }
  ctx.lineCap = 'round'
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(68,55,39,${Math.random() * .12})`
    ctx.lineWidth = .5 + Math.random() * 2
    ctx.beginPath()
    const y = Math.random() * canvas.height
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(140, y + Math.random() * 18 - 9, 360, y + Math.random() * 18 - 9, 512, y + Math.random() * 10 - 5)
    ctx.stroke()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

const vesselProfile: [number, number][] = [
  [-1, .025], [-.94, .22], [-.78, .4], [-.5, .53], [-.2, .48], [.05, .36], [.3, .39], [.56, .54], [.78, .52], [.94, .35], [1, .08],
]

function vesselRadius(height: number) {
  const h = Math.max(-1, Math.min(1, height))
  for (let index = 0; index < vesselProfile.length - 1; index++) {
    const [fromY, fromRadius] = vesselProfile[index]
    const [toY, toRadius] = vesselProfile[index + 1]
    if (h <= toY) {
      const t = (h - fromY) / (toY - fromY)
      const eased = t * t * (3 - 2 * t)
      return fromRadius + (toRadius - fromRadius) * eased
    }
  }
  return vesselProfile[vesselProfile.length - 1][1]
}

export function ScrollMorphModel({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const mesh = useRef<Mesh>(null)
  const petals = useRef<Mesh[]>([])
  const rim = useRef<Mesh>(null)
  const geometry = useMemo(() => {
    const shape = new SphereGeometry(1, 96, 64)
    shape.setAttribute('basePosition', new Float32BufferAttribute(shape.attributes.position.array.slice(), 3))
    return shape
  }, [])
  const texture = useMemo(createSurfaceTexture, [])

  useFrame((_, delta) => {
    if (!mesh.current) return
    const p = reduceMotion ? 0 : progress.get()
    const base = geometry.getAttribute('basePosition')
    const position = geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) {
      const x = base.getX(i)
      const y = base.getY(i)
      const z = base.getZ(i)
      const theta = Math.acos(Math.max(-1, Math.min(1, y)))
      const phi = Math.atan2(z, x)
      const sphereRadius = Math.hypot(x, z)
      const flowerRadius = sphereRadius * (1 + .52 * Math.cos(phi * 6) * Math.pow(Math.sin(theta), 1.7))
      const vessel = vesselRadius(y) * (1 + .018 * Math.cos(phi * 12))
      const blend = p < .5 ? (p * 2) ** 2 * (3 - 2 * p * 2) : ((p - .5) * 2) ** 2 * (3 - 2 * (p - .5) * 2)
      const radial = p < .5
        ? sphereRadius + (flowerRadius - sphereRadius) * blend
        : flowerRadius + (vessel - flowerRadius) * blend
      const height = p < .5 ? y : y + (y * 1.08 - y) * blend
      position.setXYZ(i, sphereRadius > 0 ? x / sphereRadius * radial : 0, height, sphereRadius > 0 ? z / sphereRadius * radial : 0)
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
    const material = (mesh.current.material as import('three').MeshStandardMaterial)
    const segment = p < .5 ? 0 : 1
    material.color.copy(colorFrom.copy(colors[segment]).lerp(colors[segment + 1], p < .5 ? p * 2 : (p - .5) * 2))
    const bloomAmount = Math.max(0, 1 - Math.abs(p - .5) * 4)
    petals.current.forEach((petal) => {
      petal.scale.set(.001 + bloomAmount * .31, .001 + bloomAmount * .5, .001 + bloomAmount * .12)
      const petalMaterial = petal.material as import('three').MeshPhysicalMaterial
      petalMaterial.opacity = bloomAmount
    })
    if (rim.current) {
      const vesselAmount = Math.max(0, Math.min(1, (p - .72) * 3.5))
      rim.current.scale.setScalar(.001 + vesselAmount)
      ;(rim.current.material as import('three').MeshPhysicalMaterial).opacity = vesselAmount
    }
    mesh.current.rotation.y += (p * Math.PI * 1.6 - mesh.current.rotation.y) * Math.min(1, delta * 3)
    mesh.current.rotation.x += ((p - .5) * .2 - mesh.current.rotation.x) * Math.min(1, delta * 2)
  })

  return <mesh ref={mesh} geometry={geometry} scale={1.05}>
    <meshPhysicalMaterial map={texture} bumpMap={texture} bumpScale={.045} color="#b88f62" roughness={.48} metalness={.02} clearcoat={.42} clearcoatRoughness={.32} sheen={.25} sheenColor="#fff1d6" />
    {Array.from({ length: 6 }, (_, index) => {
      const angle = index * Math.PI / 3
      return <mesh key={index} ref={(node) => { if (node) petals.current[index] = node }} position={[Math.cos(angle) * .25, Math.sin(angle) * .25, .12]} rotation={[0, 0, angle]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#72a879" roughness={.36} clearcoat={.55} transparent opacity={0} side={2} />
      </mesh>
    })}
    <mesh ref={rim} position={[0, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[.24, .035, 16, 64]} />
      <meshPhysicalMaterial color="#9b7bd0" roughness={.3} clearcoat={.7} transparent opacity={0} />
    </mesh>
  </mesh>
}
