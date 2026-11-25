import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'

const milestones = [
  { at: 0, tag: '01 / THE ENTRY', title: 'Take a look around.', text: 'Drag to explore the space. Your view stays within a comfortable range.' },
  { at: 0.38, tag: '02 / THE GARDEN', title: 'Find your own angle.', text: 'The authored path keeps moving with the page while your gaze adds a little freedom.' },
  { at: 0.72, tag: '03 / THE OBSERVATORY', title: 'Then follow the light.', text: 'Release the view or keep scrolling. Your camera eases back onto its guided route.' },
]

function World() {
  return <>
    <color attach="background" args={['#17211d']} />
    <fog attach="fog" args={['#17211d', 10, 34]} />
    <ambientLight intensity={0.7} />
    <hemisphereLight args={['#d8e3cf', '#14201a', 1.2]} />
    <directionalLight position={[-4, 8, 5]} intensity={2.2} color="#ffe3bd" />
    <pointLight position={[0, 3, -4]} intensity={35} distance={12} color="#d7f36c" />
    <pointLight position={[0, 3, -18]} intensity={38} distance={13} color="#e8a779" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, -12]} receiveShadow><planeGeometry args={[28, 38]} /><meshStandardMaterial color="#26322a" roughness={0.92} /></mesh>
    {[-5, 5].map((x) => <group key={x} position={[x, 0, -8]}>
      <mesh position={[0, 1.3, 0]}><boxGeometry args={[0.34, 3.1, 0.34]} /><meshStandardMaterial color="#777a61" roughness={0.83} /></mesh>
      <mesh position={[0, 2.95, 0]}><boxGeometry args={[2.2, 0.3, 0.4]} /><meshStandardMaterial color="#a0a17c" roughness={0.75} /></mesh>
      <mesh position={[0, 1.5, 0.25]}><planeGeometry args={[1.45, 1.8]} /><meshBasicMaterial color="#e2a56e" transparent opacity={0.55} /></mesh>
    </group>)}
    {[-9, -15, -22].map((z, index) => <group key={z} position={[0, 0, z]}>
      <mesh position={[0, 1.7, 0]}><torusGeometry args={[2.5, 0.12, 12, 72]} /><meshStandardMaterial color={index === 2 ? '#b6c5a0' : '#87936f'} emissive="#526044" emissiveIntensity={0.35} /></mesh>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.1, 0.18, 2.8, 9]} /><meshStandardMaterial color="#716653" roughness={0.8} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}><ringGeometry args={[2.7, 2.74, 80]} /><meshBasicMaterial color="#d7f36c" transparent opacity={0.45} /></mesh>
    </group>)}
    {Array.from({ length: 18 }, (_, i) => {
      const side = i % 2 ? 1 : -1
      const z = -3 - Math.floor(i / 2) * 2.7
      return <mesh key={i} position={[side * (3.7 + (i % 3) * 0.5), -0.25, z]} rotation={[0, 0, side * 0.08]}>
        <icosahedronGeometry args={[0.35 + (i % 3) * 0.1, 1]} /><meshStandardMaterial color={i % 3 ? '#687d58' : '#d7f36c'} roughness={0.7} emissive={i % 3 ? '#27382b' : '#778a39'} emissiveIntensity={0.3} />
      </mesh>
    })}
  </>
}

function GuardedCamera({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const { gl } = useThree()
  const steering = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0, down: false, x: 0, y: 0, lastInput: 0 })
  const path = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0.35, 5.5), new Vector3(0.4, 0.5, 2), new Vector3(-0.3, 0.45, -3),
    new Vector3(0.2, 0.2, -9), new Vector3(0, 0.45, -16), new Vector3(0.2, 0.35, -25),
  ], false, 'catmullrom', 0.3), [])

  useEffect(() => {
    const element = gl.domElement
    const state = steering.current
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      state.down = true
      state.x = event.clientX
      state.y = event.clientY
      state.lastInput = performance.now()
      element.setPointerCapture(event.pointerId)
      element.classList.add('is-looking')
    }
    const move = (event: PointerEvent) => {
      if (!state.down) return
      const dx = event.clientX - state.x
      const dy = event.clientY - state.y
      state.x = event.clientX
      state.y = event.clientY
      state.targetYaw = MathUtils.clamp(state.targetYaw - dx * 0.004, -0.62, 0.62)
      state.targetPitch = MathUtils.clamp(state.targetPitch - dy * 0.003, -0.32, 0.32)
      state.lastInput = performance.now()
    }
    const up = () => {
      state.down = false
      element.classList.remove('is-looking')
      state.lastInput = performance.now() - 850
    }
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame(({ camera }, delta) => {
    const state = steering.current
    if (performance.now() - state.lastInput > 900) {
      state.targetYaw = 0
      state.targetPitch = 0
    }
    const smoothing = 1 - Math.exp(-delta * (state.down ? 12 : 2.4))
    state.yaw = MathUtils.lerp(state.yaw, state.targetYaw, smoothing)
    state.pitch = MathUtils.lerp(state.pitch, state.targetPitch, smoothing)
    const t = reduceMotion ? 0 : progress.get()
    const point = path.getPointAt(t)
    const look = path.getPointAt(Math.min(0.999, t + 0.035))
    camera.position.lerp(point, 1 - Math.exp(-delta * 7))
    const direction = look.sub(point)
    direction.applyAxisAngle(new Vector3(0, 1, 0), state.yaw)
    direction.applyAxisAngle(new Vector3(1, 0, 0), state.pitch)
    camera.lookAt(camera.position.clone().add(direction))
  })
  return null
}

export function UserSteeredCamera() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const chapter = useTransform(scrollYProgress, [0, 0.3, 0.36, 0.66, 0.72, 1], [0, 0, 1, 1, 2, 2])
  return <section ref={section} className="user-steered-scroll">
    <div className="user-steered-stage">
      <Canvas className="user-steered-canvas" camera={{ position: [0, 0.35, 5.5], fov: 48 }} dpr={[1, 1.5]} gl={{ antialias: true }}><World/><GuardedCamera progress={scrollYProgress} reduceMotion={reduceMotion}/></Canvas>
      <div className="user-steered-shade" />
      <header className="user-steered-header"><span>MOTION KIT / CAMERA STUDY 13</span><span>{reduceMotion ? 'REDUCED MOTION' : 'DRAG TO LOOK · SCROLL TO MOVE'}</span></header>
      <div className="user-steered-copy">{milestones.map((item, index) => <Chapter key={item.tag} item={item} index={index} active={chapter} reduceMotion={reduceMotion}/>)}</div>
      <footer className="user-steered-footer"><span>BOUNDED FREE LOOK</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }}/></div><span>GUIDED PATH RESUMES ON RELEASE</span></footer>
      <div className="look-reticle" aria-hidden="true"><i/><i/></div>
    </div>
  </section>
}

function Chapter({ item, index, active, reduceMotion }: { item: typeof milestones[number]; index: number; active: MotionValue<number>; reduceMotion: boolean }) {
  const opacity = useTransform(active, [index - 0.45, index, index + 0.45], [0, 1, index === milestones.length - 1 ? 1 : 0])
  const y = useTransform(active, [index - 0.45, index], [24, 0])
  return <motion.article style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}><span>{item.tag}</span><h2>{item.title}</h2><p>{item.text}</p></motion.article>
}
