import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { MathUtils, Vector3 } from 'three'

const projects = [
  { id: 'form', title: 'Form in motion', label: 'IDENTITY / 2025', detail: 'A visual identity built from a single shape that keeps finding new ways to move.', color: '#d7f36c', x: 0, z: -8 },
  { id: 'signal', title: 'Signal / noise', label: 'DIGITAL / 2024', detail: 'An experimental sound archive translated into a tactile, light-filled interface.', color: '#efad83', x: -1.5, z: -19 },
  { id: 'field', title: 'Open field', label: 'CAMPAIGN / 2024', detail: 'A quiet campaign about making room for new ideas, told through a world you can explore.', color: '#b7a8e4', x: 1.4, z: -30 },
]

type WalkInput = { forward: number; back: number; left: number; right: number }

function GalleryProject({ project, index }: { project: typeof projects[number]; index: number }) {
  const art = index === 0
    ? <mesh position={[0, 0.15, 0.2]}><torusKnotGeometry args={[0.58, 0.18, 100, 16, 2, 3]} /><meshStandardMaterial color={project.color} roughness={0.24} metalness={0.38} emissive={project.color} emissiveIntensity={0.14} /></mesh>
    : index === 1
      ? <><mesh position={[0, 0.25, 0.15]}><icosahedronGeometry args={[0.7, 1]} /><meshPhysicalMaterial color={project.color} roughness={0.2} metalness={0.12} clearcoat={0.9} /></mesh><mesh position={[0, 0.25, 0.1]} rotation={[0.4, 0.2, 0.2]}><torusGeometry args={[1.05, 0.025, 8, 80]} /><meshStandardMaterial color="#f4e8ce" emissive="#a5704f" emissiveIntensity={0.5} /></mesh></>
      : <><mesh position={[0, 0.15, 0.1]} rotation={[0.2, 0.4, 0.3]}><octahedronGeometry args={[0.72, 1]} /><meshStandardMaterial color={project.color} roughness={0.4} metalness={0.24} /></mesh><mesh position={[0, 0.15, 0.1]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.1, 0.022, 8, 80]} /><meshStandardMaterial color="#dce5ca" emissive="#b7a8e4" emissiveIntensity={0.65} /></mesh></>

  return <group position={[project.x, 0, project.z]}>
    <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[1.75, 1.95, 0.35, 48]} /><meshStandardMaterial color="#303a31" roughness={0.7} /></mesh>
    <mesh position={[0, -0.7, 0]}><torusGeometry args={[1.48, 0.025, 8, 72]} /><meshStandardMaterial color={project.color} emissive={project.color} emissiveIntensity={0.8} /></mesh>
    <mesh position={[0, 0.2, -0.35]}><torusGeometry args={[1.65, 0.045, 12, 80]} /><meshStandardMaterial color={project.color} emissive={project.color} emissiveIntensity={0.38} metalness={0.35} roughness={0.28} /></mesh>
    {art}
    <pointLight position={[0, 1, 1]} color={project.color} intensity={14} distance={5} />
    <mesh position={[-3.05, 1.1, -0.3]}><boxGeometry args={[0.15, 2.6, 0.22]} /><meshStandardMaterial color="#63715a" roughness={0.6} /></mesh>
    <mesh position={[3.05, 1.1, -0.3]}><boxGeometry args={[0.15, 2.6, 0.22]} /><meshStandardMaterial color="#63715a" roughness={0.6} /></mesh>
    <mesh position={[0, 2.35, -0.3]}><boxGeometry args={[6.2, 0.15, 0.22]} /><meshStandardMaterial color="#63715a" roughness={0.6} /></mesh>
  </group>
}

function WalkWorld({ input, yaw, pitch, paused, onNearby }: { input: RefObject<WalkInput>; yaw: RefObject<number>; pitch: RefObject<number>; paused: boolean; onNearby: (id: string | null) => void }) {
  const position = useRef(new Vector3(0, 0.42, 3))
  const lastNearby = useRef<string | null>(null)
  const direction = useRef(new Vector3())
  useFrame(({ camera }, delta) => {
    const safeDelta = Math.min(delta, 0.05)
    const controls = input.current
    if (!paused) {
      const forward = (controls.forward ? 1 : 0) - (controls.back ? 1 : 0)
      const side = (controls.right ? 1 : 0) - (controls.left ? 1 : 0)
      const magnitude = Math.hypot(forward, side) || 1
      const speed = 4.2 * safeDelta / magnitude
      position.current.x += (Math.sin(yaw.current) * forward + Math.cos(yaw.current) * side) * speed
      position.current.z += (-Math.cos(yaw.current) * forward + Math.sin(yaw.current) * side) * speed
      position.current.x = MathUtils.clamp(position.current.x, -4.3, 4.3)
      position.current.z = MathUtils.clamp(position.current.z, -34, 5)
    }
    camera.position.copy(position.current)
    direction.current.set(Math.sin(yaw.current) * Math.cos(pitch.current), Math.sin(pitch.current), -Math.cos(yaw.current) * Math.cos(pitch.current)).normalize()
    camera.lookAt(position.current.x + direction.current.x, position.current.y + direction.current.y, position.current.z + direction.current.z)

    let nearest: string | null = null
    let nearestDistance = 3.2
    for (const project of projects) {
      const distance = Math.hypot(position.current.x - project.x, position.current.z - project.z)
      if (distance < nearestDistance) { nearest = project.id; nearestDistance = distance }
    }
    if (nearest !== lastNearby.current) {
      lastNearby.current = nearest
      onNearby(nearest)
    }
  })

  return <>
    <color attach="background" args={['#171b18']} />
    <fog attach="fog" args={['#171b18', 15, 43]} />
    <ambientLight intensity={0.58} />
    <hemisphereLight args={['#d8e3cf', '#202820', 1]} />
    <directionalLight position={[-4, 9, 3]} intensity={2.2} color="#f2ecd9" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, -14]} receiveShadow><planeGeometry args={[11, 54]} /><meshStandardMaterial color="#252c25" roughness={0.94} /></mesh>
    {Array.from({ length: 14 }, (_, index) => <group key={index} position={[0, 0, 4 - index * 3.2]}>
      <mesh position={[-5, 0, 0]}><boxGeometry args={[0.18, 4.8, 0.3]} /><meshStandardMaterial color="#455044" roughness={0.75} /></mesh>
      <mesh position={[5, 0, 0]}><boxGeometry args={[0.18, 4.8, 0.3]} /><meshStandardMaterial color="#455044" roughness={0.75} /></mesh>
      <mesh position={[0, -1.16, 0]}><boxGeometry args={[0.07, 0.025, 0.8]} /><meshBasicMaterial color="#b5c977" /></mesh>
    </group>)}
    <mesh position={[-4.4, 1.55, -14]}><boxGeometry args={[0.025, 3.5, 48]} /><meshBasicMaterial color="#63715a" /></mesh>
    <mesh position={[4.4, 1.55, -14]}><boxGeometry args={[0.025, 3.5, 48]} /><meshBasicMaterial color="#63715a" /></mesh>
    {projects.map((project, index) => <GalleryProject key={project.id} project={project} index={index} />)}
  </>
}

export function FirstPersonWalk() {
  const input = useRef<WalkInput>({ forward: 0, back: 0, left: 0, right: 0 })
  const yaw = useRef(0)
  const pitch = useRef(0)
  const drag = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })
  const nearbyRef = useRef<string | null>(null)
  const [nearby, setNearby] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [looking, setLooking] = useState(false)
  const [started, setStarted] = useState(false)
  const notifyNearby = useCallback((id: string | null) => {
    nearbyRef.current = id
    setNearby(id)
  }, [])
  const selectedProject = projects.find((project) => project.id === selected)
  const nearbyProject = projects.find((project) => project.id === nearby)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'arrowup'].includes(key)) input.current.forward = 1
      if (['s', 'arrowdown'].includes(key)) input.current.back = 1
      if (['a', 'arrowleft'].includes(key)) input.current.left = 1
      if (['d', 'arrowright'].includes(key)) input.current.right = 1
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) setStarted(true)
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault()
      if (key === 'e' && nearbyRef.current) setSelected(nearbyRef.current)
      if (key === 'escape') setSelected(null)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'arrowup'].includes(key)) input.current.forward = 0
      if (['s', 'arrowdown'].includes(key)) input.current.back = 0
      if (['a', 'arrowleft'].includes(key)) input.current.left = 0
      if (['d', 'arrowright'].includes(key)) input.current.right = 0
    }
    const clearInput = () => { input.current = { forward: 0, back: 0, left: 0, right: 0 } }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearInput)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', clearInput) }
  }, [])

  const beginLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    drag.current = { x: event.clientX, y: event.clientY, active: true }
    setLooking(true)
    setStarted(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    yaw.current += (event.clientX - drag.current.x) * 0.004
    pitch.current = MathUtils.clamp(pitch.current - (event.clientY - drag.current.y) * 0.003, -0.65, 0.65)
    drag.current.x = event.clientX
    drag.current.y = event.clientY
  }
  const endLook = () => { drag.current.active = false; setLooking(false) }
  const hold = (key: keyof WalkInput, value: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    input.current[key] = value
    if (value) setStarted(true)
  }
  const openNearby = () => { if (nearby) setSelected(nearby) }

  return <section className={`first-person-demo ${looking ? 'is-looking' : ''}`} onPointerDown={beginLook} onPointerMove={moveLook} onPointerUp={endLook} onPointerCancel={endLook}>
    <Canvas className="walk-canvas" camera={{ position: [0, 0.42, 3], fov: 72 }} dpr={[1, 1.5]}><WalkWorld input={input} yaw={yaw} pitch={pitch} paused={Boolean(selected)} onNearby={notifyNearby} /></Canvas>
    <div className="walk-grain" />
    <header className="walk-header"><a href="#animations/all">MOTION / FIELD NOTES</a><span>PORTFOLIO WALK / 01</span></header>
    <div className={`walk-intro ${started ? 'has-started' : ''}`}><span>FIRST-PERSON EXPLORATION</span><h2>Walk the<br /><em>work.</em></h2><p>Move through the gallery. Come closer to a project to take a look.</p></div>
    <div className="walk-reticle" aria-hidden="true"><i /><i /></div>
    <div className="walk-hud"><span>{nearbyProject ? `NEARBY / ${nearbyProject.label}` : 'WASD OR ARROWS TO WALK'}</span><span>DRAG TO LOOK</span></div>
    {nearbyProject && !selected && <motion.button className="walk-interact" onClick={openNearby} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span>PROJECT / {nearbyProject.label}</span><strong>{nearbyProject.title}</strong><small>PRESS E OR SELECT TO INSPECT ↗</small></motion.button>}
    {selectedProject && <motion.div className="walk-project-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} role="dialog" aria-modal="true" aria-label={selectedProject.title}>
      <button className="walk-close" onClick={() => setSelected(null)} aria-label="Close project details">×</button><span>{selectedProject.label}</span><h3>{selectedProject.title}</h3><p>{selectedProject.detail}</p><button className="walk-resume" onClick={() => setSelected(null)}>RETURN TO THE WALK <b>↗</b></button>
    </motion.div>}
    <div className="walk-touch" aria-label="Touch movement controls">
      <button aria-label="Walk forward" onPointerDown={hold('forward', 1)} onPointerUp={hold('forward', 0)} onPointerLeave={hold('forward', 0)} onPointerCancel={hold('forward', 0)}>↑</button>
      <button aria-label="Walk left" onPointerDown={hold('left', 1)} onPointerUp={hold('left', 0)} onPointerLeave={hold('left', 0)} onPointerCancel={hold('left', 0)}>←</button>
      <button aria-label="Walk backward" onPointerDown={hold('back', 1)} onPointerUp={hold('back', 0)} onPointerLeave={hold('back', 0)} onPointerCancel={hold('back', 0)}>↓</button>
      <button aria-label="Walk right" onPointerDown={hold('right', 1)} onPointerUp={hold('right', 0)} onPointerLeave={hold('right', 0)} onPointerCancel={hold('right', 0)}>→</button>
    </div>
  </section>
}
