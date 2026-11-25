import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, MathUtils, PerspectiveCamera, TubeGeometry, Vector3 } from 'three'
import type { Mesh } from 'three'

const chapters = [
  { label: 'THE OVERVIEW / 01', title: 'A path through\nthe highlands.', detail: 'A raised landscape gives the journey its shape. Follow the gold line toward the lookout.' },
  { label: 'ON THE ROUTE / 02', title: 'Across the\nopen country.', detail: 'The camera drops closer as the trail winds between the lake and the ridgeline.' },
  { label: 'THE LOOKOUT / 03', title: 'The long view\nwas worth it.', detail: 'The route ends above the valley, with the whole landscape behind you.' },
]

function terrainHeight(x: number, z: number) {
  const ridgeA = Math.exp(-(((x + 11) / 8) ** 2 + ((z + 7) / 10) ** 2)) * 3.8
  const ridgeB = Math.exp(-(((x - 9) / 9) ** 2 + ((z - 10) / 8) ** 2)) * 4.6
  const basin = Math.exp(-(((x - 1) / 8) ** 2 + ((z - 1) / 8) ** 2)) * 1.5
  return 0.15 + ridgeA + ridgeB - basin + Math.sin(x * 0.24 + z * 0.12) * 0.16 + Math.cos(z * 0.21) * 0.12
}

function makeTerrain() {
  const size = 46
  const segments = 96
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const low = new Color('#495e50')
  const mid = new Color('#71816a')
  const high = new Color('#aaa187')
  for (let row = 0; row <= segments; row++) {
    const z = -size / 2 + size * row / segments
    for (let column = 0; column <= segments; column++) {
      const x = -size / 2 + size * column / segments
      const y = terrainHeight(x, z)
      positions.push(x, y, z)
      const color = new Color().lerpColors(low, mid, MathUtils.smoothstep(y, -0.5, 2.4)).lerp(high, MathUtils.smoothstep(y, 2.2, 5.2) * 0.58)
      colors.push(color.r, color.g, color.b)
      if (row < segments && column < segments) {
        const a = row * (segments + 1) + column
        const b = a + segments + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

const routeCoordinates: [number, number][] = [
  [-19, -16], [-14, -13], [-11, -8], [-7, -5], [-5, 1], [-4, 6], [0, 10], [7, 9], [11, 11], [15, 16],
]

function createRoute() {
  const points = routeCoordinates.map(([x, z]) => new Vector3(x, terrainHeight(x, z) + 0.2, z))
  const curve = new CatmullRomCurve3(points, false, 'centripetal')
  return { curve, geometry: new TubeGeometry(curve, 320, 0.075, 8, false) }
}

function RouteCamera({ progress, route, routeMesh }: { progress: MotionValue<number>; route: CatmullRomCurve3; routeMesh: React.RefObject<Mesh | null> }) {
  const target = useRef(new Vector3())
  const point = useRef(new Vector3())
  const tangent = useRef(new Vector3())
  const followPosition = useRef(new Vector3())
  const overview = useMemo(() => new Vector3(0, 37, 30), [])
  const center = useMemo(() => new Vector3(0, 0.4, 0), [])
  useFrame(({ camera }) => {
    const value = progress.get()
    const journey = MathUtils.smoothstep((value - 0.12) / 0.88, 0, 1)
    route.getPointAt(journey, point.current)
    route.getTangentAt(Math.min(journey + 0.018, 1), tangent.current).normalize()
    followPosition.current.copy(point.current).addScaledVector(tangent.current, -7.2)
    followPosition.current.y += 5.6 - journey * 1.4
    const overviewMix = 1 - MathUtils.smoothstep(value, 0.08, 0.34)
    camera.position.copy(followPosition.current).lerp(overview, overviewMix)
    target.current.copy(point.current).addScaledVector(tangent.current, 3.5)
    target.current.y += 0.35
    target.current.lerp(center, overviewMix)
    camera.lookAt(target.current)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(53, 48, overviewMix)
      camera.updateProjectionMatrix()
    }
    const geometry = routeMesh.current?.geometry
    if (geometry) {
      const total = geometry.index?.count ?? geometry.attributes.position.count
      geometry.setDrawRange(0, Math.floor(total * MathUtils.smoothstep(value, 0.03, 0.92)))
    }
  })
  return <>
    <fog attach="fog" args={['#aeb8ad', 25, 74]} />
    <ambientLight intensity={0.8} />
    <hemisphereLight args={['#dce8e2', '#39453c', 1.05]} />
    <directionalLight position={[-9, 16, 6]} intensity={2.25} color="#ffe5bd" />
    <pointLight position={[15, 9, 16]} color="#ffc77c" intensity={34} distance={35} />
  </>
}

function Pine({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return <group position={[x, terrainHeight(x, z), z]} scale={scale}>
    <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.1, 0.17, 1.24, 7]} /><meshStandardMaterial color="#6e5944" roughness={0.92} /></mesh>
    <mesh position={[0, 1.55, 0]}><coneGeometry args={[0.78, 1.8, 8]} /><meshStandardMaterial color="#3f5b4c" roughness={0.92} /></mesh>
    <mesh position={[0, 2.15, 0]}><coneGeometry args={[0.55, 1.5, 8]} /><meshStandardMaterial color="#54705b" roughness={0.92} /></mesh>
  </group>
}

function Destination() {
  const x = 15
  const z = 16
  return <group position={[x, terrainHeight(x, z), z]}>
    <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[2.25, 2.5, 0.36, 24]} /><meshStandardMaterial color="#c1ae8c" roughness={0.8} /></mesh>
    <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.14, 0.2, 2.7, 10]} /><meshStandardMaterial color="#5d564a" roughness={0.65} /></mesh>
    <mesh position={[0, 3.08, 0]}><cylinderGeometry args={[0.9, 0.72, 0.5, 12]} /><meshStandardMaterial color="#dbc79f" roughness={0.65} /></mesh>
    <mesh position={[0, 3.42, 0]}><coneGeometry args={[0.82, 0.5, 12]} /><meshStandardMaterial color="#74695a" roughness={0.7} /></mesh>
    <pointLight position={[0, 3.6, 0]} color="#ffcf85" intensity={8} distance={11} />
  </group>
}

function RouteMap({ progress }: { progress: MotionValue<number> }) {
  const route = useMemo(createRoute, [])
  const routeMesh = useRef<Mesh>(null)
  const terrain = useMemo(makeTerrain, [])
  return <>
    <RouteCamera progress={progress} route={route.curve} routeMesh={routeMesh} />
    <mesh geometry={terrain} receiveShadow><meshStandardMaterial vertexColors roughness={0.96} /></mesh>
    <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[31, 32, 1.3, 64]} /><meshStandardMaterial color="#343f39" roughness={1} /></mesh>
    <mesh position={[2, terrainHeight(2, 2) - 0.34, 2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.1, 48]} /><meshStandardMaterial color="#668f92" roughness={0.24} metalness={0.16} /></mesh>
    <mesh position={[2, terrainHeight(2, 2) - 0.3, 2]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[4.05, 4.35, 48]} /><meshStandardMaterial color="#c8bc9d" roughness={0.82} /></mesh>
    <mesh ref={routeMesh} geometry={route.geometry}><meshStandardMaterial color="#e6b36e" emissive="#ad642d" emissiveIntensity={1.25} roughness={0.36} metalness={0.08} /></mesh>
    <mesh position={[-19, terrainHeight(-19, -16) + 0.24, -16]}><sphereGeometry args={[0.32, 16, 12]} /><meshStandardMaterial color="#f3d08e" emissive="#e3a952" emissiveIntensity={1.1} /></mesh>
    {[
      [-21, -10, 0.95], [-18, -4, 1.1], [-15, 3, 0.78], [-17, 9, 1.15], [-12, 13, 0.9], [-9, -17, 0.82],
      [-8, 12, 0.88], [-2, -15, 1.18], [1, -12, 0.84], [8, -16, 1.04], [13, -11, 0.92], [18, -7, 1.1],
      [19, 1, 0.85], [20, 7, 1.15], [6, 17, 0.82], [-4, 19, 0.98], [-19, 19, 1.05], [21, 18, 0.82],
    ].map(([x, z, scale], index) => <Pine key={index} x={x} z={z} scale={scale} />)}
    <Destination />
  </>
}

function JourneyChapter({ index, active, reduceMotion }: { index: number; active: boolean; reduceMotion: boolean }) {
  const chapter = chapters[index]
  return <motion.article className={'map-journey-chapter map-journey-chapter-' + index} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18 }} transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function MapRouteJourney() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [activeChapter, setActiveChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.7 ? 1 : 2
    setActiveChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="map-route-journey-scroll">
    <div className="map-route-journey-stage">
      <Canvas className="map-route-journey-canvas" camera={{ position: [0, 37, 30], fov: 53, near: 0.1, far: 100 }} dpr={[1, 1.5]}><RouteMap progress={scrollYProgress} /></Canvas>
      <div className="map-route-journey-shade" />
      <header className="map-route-journey-head"><span>FIELD GUIDE / 09</span><span>{activeChapter === 0 ? 'ROUTE OVERVIEW' : activeChapter === 1 ? 'FOLLOWING THE TRAIL' : 'ARRIVAL'}</span></header>
      <div className="map-route-journey-copy">{chapters.map((_, index) => <JourneyChapter key={index} index={index} active={activeChapter === index} reduceMotion={reduceMotion} />)}</div>
      <footer className="map-route-journey-foot"><span>18.4 KM · NORTH RIDGE TRAIL</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>SCROLL TO TRAVEL ↓</span></footer>
    </div>
  </section>
}
