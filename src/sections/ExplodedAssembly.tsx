import { Canvas, useFrame } from '@react-three/fiber'
import { Center, RoundedBox, useGLTF } from '@react-three/drei'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Object3D } from 'three'
import type { ErrorInfo, ReactNode } from 'react'

const MODEL_URL = 'https://tevy.dev/models/electric-gt/v1/lod1.glb'
const parts = [
  { id: 'body', name: 'Grand touring body', description: 'A sculpted electric coupe shell, finished in a deep mineral green with a low, aerodynamic profile.', code: '01' },
  { id: 'battery', name: 'Skateboard battery', description: 'A structural battery pack sits low beneath the cabin to keep weight balanced and the floor flat.', code: '02' },
  { id: 'wheels', name: 'Independent wheel units', description: 'Four precision wheel assemblies move outward to reveal the stance, hubs, and braking geometry.', code: '03' },
  { id: 'spoiler', name: 'Active rear aero', description: 'The rear wing lifts clear of the tail to show how the coupe manages airflow at speed.', code: '04' },
] as const

type PartId = (typeof parts)[number]['id']
type MovingNode = { object: Object3D; origin: Vector3; offset: Vector3; category: PartId }

function ImportedCar({ progress, assembled, selected, onSelect, onLoad }: { progress: MotionValue<number>; assembled: boolean; selected: PartId; onSelect: (id: PartId) => void; onLoad: () => void }) {
  const root = useRef<Object3D>(null)
  const battery = useRef<Object3D>(null)
  const { scene } = useGLTF(MODEL_URL)
  useEffect(() => onLoad(), [onLoad])
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const movingNodes: MovingNode[] = []
    clone.traverse((node) => {
      const name = node.name.toLowerCase()
      const category: PartId | null = /wheel_(fl|fr|rl|rr)|wheel.?[0-9]/.test(name) ? 'wheels' : /spoiler|rear.?wing/.test(name) ? 'spoiler' : null
      const mesh = node as Object3D & { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true }
      if (category) {
        const isLeft = /_(fl|rl)$/.test(name)
        const isFront = /_(fl|fr)$/.test(name)
        const signX = isLeft ? -1 : 1
        const signZ = isFront ? 1 : -1
        movingNodes.push({
          object: node,
          origin: node.position.clone(),
          offset: category === 'wheels' ? new Vector3(signX * .72, .2, signZ * .32) : new Vector3(0, .85, -.12),
          category,
        })
      }
    })
    return { scene: clone, movingNodes }
  }, [scene])

  useFrame(({ camera }, delta) => {
    const t = progress.get()
    const rawAmount = assembled ? 0 : t
    const amount = rawAmount * rawAmount * (3 - 2 * rawAmount)
    if (root.current) root.current.rotation.y = MathUtils.damp(root.current.rotation.y, -.22 + t * .44, 2.3, delta)
    for (const part of model.movingNodes) {
      const destination = part.origin.clone().addScaledVector(part.offset, amount)
      part.object.position.lerp(destination, 1 - Math.exp(-delta * 7))
    }
    if (battery.current) {
      const rawAmountDown = assembled ? 0 : t
      const amountDown = rawAmountDown * rawAmountDown * (3 - 2 * rawAmountDown)
      battery.current.position.y = MathUtils.damp(battery.current.position.y, -.42 - amountDown * .95, 6, delta)
      battery.current.scale.setScalar(MathUtils.damp(battery.current.scale.x, selected === 'battery' ? 1.07 : 1, 6, delta))
    }
    camera.position.x = MathUtils.damp(camera.position.x, 5.1 - t * 1.3, 2, delta)
    camera.position.z = MathUtils.damp(camera.position.z, 7.3 + t * .35, 2, delta)
    camera.lookAt(0, .12, 0)
  })

  const selectFromObject = (object: Object3D) => {
    const name = object.name.toLowerCase()
    onSelect(/wheel/.test(name) ? 'wheels' : /spoiler|rear.?wing/.test(name) ? 'spoiler' : 'body')
  }

  return <>
    <ambientLight intensity={.72}/><hemisphereLight args={['#e8f0e4', '#1e2924', 1.2]}/><directionalLight position={[4, 8, 6]} intensity={3.1} color="#fff1d7" castShadow/><pointLight position={[-4, 2, -3]} intensity={22} color="#b8d5b8" distance={12}/>
    <group ref={root}>
      <Center><primitive object={model.scene} onPointerDown={(event: { stopPropagation: () => void; object: Object3D }) => { event.stopPropagation(); selectFromObject(event.object) }} /></Center>
      <group ref={battery} position={[0, -.42, 0]} onPointerDown={(event) => { event.stopPropagation(); onSelect('battery') }}>
        <RoundedBox args={[1.48, .17, 2.85]} radius={.07} smoothness={4} castShadow><meshStandardMaterial color={selected === 'battery' ? '#d7f36c' : '#737c68'} metalness={.62} roughness={.34}/></RoundedBox>
        <mesh position={[0, .095, 0]}><boxGeometry args={[1.25, .025, 2.5]}/><meshStandardMaterial color="#d2c29a" metalness={.72} roughness={.3}/></mesh>
      </group>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.8, 0]} receiveShadow><planeGeometry args={[200, 200]}/><shadowMaterial transparent opacity={.18}/></mesh>
  </>
}

class ModelErrorBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error('Unable to load the Electric GT model.', error) }
  render() {
    if (this.state.failed) return <div className="assembly-model-fallback" role="status">
      <svg viewBox="0 0 900 360" aria-hidden="true"><defs><linearGradient id="carPaint" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c8d7a2"/><stop offset=".52" stopColor="#748665"/><stop offset="1" stopColor="#34443a"/></linearGradient></defs><ellipse cx="450" cy="295" rx="360" ry="26" fill="#090d0b" opacity=".3"/><path d="M108 234l45-79c15-25 35-39 66-47l118-31c36-9 70-13 107-13h105c43 0 76 11 110 39l75 62 39 23 18 58-45 23H151l-43-20z" fill="url(#carPaint)" stroke="#e0e8c5" strokeOpacity=".45" strokeWidth="3"/><path d="M248 154l126-47c28-9 54-13 85-13h84c32 0 57 8 82 28l52 44H248z" fill="#243532" stroke="#d1dbbd" strokeOpacity=".65" strokeWidth="3"/><path d="M408 97v69m-159-12h428" fill="none" stroke="#d1dbbd" strokeOpacity=".4" strokeWidth="3"/><path d="M129 211l90 1m553 0l66 1" stroke="#f5e4aa" strokeWidth="8" strokeLinecap="round"/><circle cx="257" cy="255" r="55" fill="#151a18"/><circle cx="257" cy="255" r="29" fill="#aeb99a"/><circle cx="257" cy="255" r="11" fill="#3d493e"/><circle cx="665" cy="255" r="55" fill="#151a18"/><circle cx="665" cy="255" r="29" fill="#aeb99a"/><circle cx="665" cy="255" r="11" fill="#3d493e"/></svg>
      <span>3D model unavailable · showing vehicle preview</span>
    </div>
    return this.props.children
  }
}

function ModelFallback() {
  return <div className="assembly-model-fallback" role="status"><svg viewBox="0 0 900 360" aria-hidden="true"><defs><linearGradient id="carPaint" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c8d7a2"/><stop offset=".52" stopColor="#748665"/><stop offset="1" stopColor="#34443a"/></linearGradient></defs><ellipse cx="450" cy="295" rx="360" ry="26" fill="#090d0b" opacity=".3"/><path d="M108 234l45-79c15-25 35-39 66-47l118-31c36-9 70-13 107-13h105c43 0 76 11 110 39l75 62 39 23 18 58-45 23H151l-43-20z" fill="url(#carPaint)" stroke="#e0e8c5" strokeOpacity=".45" strokeWidth="3"/><path d="M248 154l126-47c28-9 54-13 85-13h84c32 0 57 8 82 28l52 44H248z" fill="#243532" stroke="#d1dbbd" strokeOpacity=".65" strokeWidth="3"/><path d="M408 97v69m-159-12h428" fill="none" stroke="#d1dbbd" strokeOpacity=".4" strokeWidth="3"/><path d="M129 211l90 1m553 0l66 1" stroke="#f5e4aa" strokeWidth="8" strokeLinecap="round"/><circle cx="257" cy="255" r="55" fill="#151a18"/><circle cx="257" cy="255" r="29" fill="#aeb99a"/><circle cx="257" cy="255" r="11" fill="#3d493e"/><circle cx="665" cy="255" r="55" fill="#151a18"/><circle cx="665" cy="255" r="29" fill="#aeb99a"/><circle cx="665" cy="255" r="11" fill="#3d493e"/></svg><span>3D model unavailable · showing vehicle preview</span></div>
}

export function ExplodedAssembly() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const explodeProgress = useTransform(scrollYProgress, [0, .18, .72, 1], [0, .08, 1, 1])
  const stillProgress = useTransform(scrollYProgress, () => 0)
  const sceneProgress = reduceMotion ? stillProgress : explodeProgress
  const progressLabel = useTransform(explodeProgress, (value) => `DISASSEMBLY ${Math.round(value * 100)}%`)
  const [selected, setSelected] = useState<PartId>('body')
  const [assembled, setAssembled] = useState(false)
  const [modelUnavailable, setModelUnavailable] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const detail = parts.find((part) => part.id === selected) ?? parts[0]
  return <section ref={section} className="assembly-scroll">
    <div className="assembly-stage">
      <Canvas shadows camera={{ position: [5.1, 3.2, 7.3], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={['#151b19']}/><fog attach="fog" args={['#151b19', 13, 32]}/><directionalLight position={[-5, 4, -4]} intensity={1.8} color="#b4c8e4"/><pointLight position={[0, 4, 0]} intensity={16} color="#d7f36c" distance={14}/>
        <ModelErrorBoundary onFail={() => setModelUnavailable(true)}><ModelErrorBoundary onFail={() => setModelUnavailable(true)}><Suspense fallback={null}><ImportedCar progress={sceneProgress} assembled={assembled || reduceMotion} selected={selected} onSelect={setSelected} onLoad={() => setModelLoaded(true)}/></Suspense></ModelErrorBoundary></ModelErrorBoundary>
      </Canvas>
      {!modelLoaded && !modelUnavailable && <div className="assembly-model-loader"><i/>Loading vehicle model</div>}
      {modelUnavailable && <ModelFallback/>}
      <div className="assembly-vignette"/>
      <header className="assembly-head"><span>OBJECT STUDY / 014</span><span>SCROLL TO EXPLODE · SELECT A COMPONENT</span></header>
      <div className="assembly-copy"><span className="eyebrow">ELECTRIC GRAND TOURER · 2026</span><h2>Designed<br/>from the <em>inside.</em></h2><p>Scroll to open up the coupe. Explore its construction, then pull the systems back into one clean silhouette.</p></div>
      <aside className="assembly-inspector"><span>COMPONENT / {detail.code}</span><h3>{detail.name}</h3><p>{detail.description}</p><div className="assembly-part-list">{parts.map((part) => <button key={part.id} className={part.id === selected ? 'active' : ''} onClick={() => setSelected(part.id)}><span>{part.code}</span>{part.name}<i>↗</i></button>)}</div></aside>
      <div className="assembly-controls"><motion.span className="assembly-scroll-label">{assembled ? 'ASSEMBLY RESTORED' : progressLabel}</motion.span><button onClick={() => setAssembled((value) => !value)}>{assembled ? 'Resume scroll reveal' : 'Reassemble car'} <b>{assembled ? '↗' : '↙'}</b></button></div>
      <footer className="assembly-footer"><span>6 COMPONENTS · 1 COHERENT FORM</span><div><motion.i style={{ scaleX: reduceMotion ? 0 : scrollYProgress, transformOrigin: 'left' }}/></div><a href="https://tevy.dev/models/electric-gt" target="_blank" rel="noreferrer">CC0 ELECTRIC GT · MODEL SOURCE ↗</a></footer>
    </div>
  </section>
}
