import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { IcosahedronGeometry, Mesh, MeshPhysicalMaterial } from 'three'

export function ThreeDToTwoD() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const flatOpacity = useTransform(scrollYProgress, [0, .28, .38, .65, .76, 1], [0, 0, 1, 1, 0, 0])
  const flatScale = useTransform(scrollYProgress, [0, .38, .65, 1], [.92, 1, 1, .96])
  const flatBackdrop = useTransform(scrollYProgress, [0, .28, .42, .64, .78, 1], [0, 0, 1, 1, 0, 0])
  const firstLabel = useTransform(scrollYProgress, [0, .18, .3, 1], [1, 1, 0, 0])
  const flatLabel = useTransform(scrollYProgress, [0, .28, .4, .62, .75, 1], [0, 0, 1, 1, 0, 0])
  const restoredLabel = useTransform(scrollYProgress, [0, .62, .76, 1], [0, 0, 1, 1])

  return <section ref={section} className="handoff-scroll">
    <div className="handoff-stage">
      <div className="handoff-header"><span>DEPTH STUDY / 01</span><span>SCROLL THROUGH ALL THREE STAGES ↓</span></div>
      <div className="handoff-stage-labels"><span>01&nbsp; 3D OBJECT</span><i>→</i><span>02&nbsp; FLAT IMAGE</span><i>→</i><span>03&nbsp; DEPTH RETURNS</span></div>
      <div className="handoff-model" aria-label="A 3D sculptural object transitioning into a flat illustration">
        {!reduceMotion && <Canvas camera={{ position: [0, 0, 4.4], fov: 36 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
          <hemisphereLight args={['#f8e9cd', '#283c35', 1.8]}/>
          <directionalLight position={[-3, 5, 5]} intensity={3.5} color="#fff0d5"/>
          <pointLight position={[3, -2, 2]} intensity={12} color="#c9f16c"/>
          <HandoffObject progress={scrollYProgress}/>
          <Environment preset="studio"/>
        </Canvas>}
      </div>
      <motion.div className="handoff-light" style={{ opacity: reduceMotion ? 1 : flatBackdrop }} aria-hidden="true" />
      <motion.div className="handoff-flat" style={{ opacity: reduceMotion ? 1 : flatOpacity, scale: reduceMotion ? 1 : flatScale }} aria-hidden="true">
        <div className="handoff-flat-art">
          <span>OBJECT / STUDY 01</span>
          <svg viewBox="0 0 360 360" role="presentation">
            <circle cx="180" cy="180" r="148" fill="none" stroke="#33473b" strokeWidth="1" strokeDasharray="2 8"/>
            <circle cx="180" cy="180" r="112" fill="#d4ed92"/>
            <path d="M180 68 C215 112 224 145 180 180 C136 215 145 248 180 292 C215 248 224 215 180 180 C136 145 145 112 180 68Z" fill="#829b55"/>
            <path d="M68 180 C112 145 145 136 180 180 C215 224 248 215 292 180 C248 145 215 136 180 180 C145 224 112 215 68 180Z" fill="#f1b58f"/>
            <circle cx="180" cy="180" r="18" fill="#f7f3e6"/>
          </svg>
          <strong>One form.<br/><em>Two dimensions.</em></strong>
          <small>THE IMAGE HOLDS THE SHAPE WHILE DEPTH FALLS AWAY.</small>
        </div>
      </motion.div>
      <div className="handoff-caption">
        <motion.div style={{ opacity: reduceMotion ? 1 : firstLabel }}><span>STAGE 01</span><b>3D object</b><small>A lit form with visible volume.</small></motion.div>
        <motion.div style={{ opacity: reduceMotion ? 0 : flatLabel }}><span>STAGE 02</span><b>Flat image</b><small>The 3D form gives way to a 2D graphic.</small></motion.div>
        <motion.div style={{ opacity: reduceMotion ? 0 : restoredLabel }}><span>STAGE 03</span><b>Depth returns</b><small>Keep scrolling to bring the object back.</small></motion.div>
      </div>
      <div className="handoff-footer"><span>3D → 2D → 3D · SCROLL SCRUBBED</span><div><motion.i style={reduceMotion ? { scaleX: 1 } : { scaleX: scrollYProgress, transformOrigin: 'left' }}/></div><span>KEEP SCROLLING ↓</span></div>
    </div>
  </section>
}

function HandoffObject({ progress }: { progress: MotionValue<number> }) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshPhysicalMaterial>(null)
  const geometry = useRef(new IcosahedronGeometry(1.05, 5))
  useFrame(({ clock }) => {
    const p = progress.get()
    const firstForm = 1 - Math.min(1, Math.max(0, (p - .27) / .16))
    const restoredForm = Math.min(1, Math.max(0, (p - .64) / .16))
    const depth = p < .29 ? 1 : p < .47 ? 1 - (p - .29) / .18 : p < .65 ? 0 : Math.min(1, (p - .65) / .18)
    const spin = p < .29 ? 1 : p < .47 ? 1 - (p - .29) / .18 : p < .65 ? 0 : Math.min(1, (p - .65) / .18)
    if (mesh.current) {
      mesh.current.rotation.set(.2 + Math.sin(clock.elapsedTime * .24) * .08 * spin, clock.elapsedTime * .16 * spin, .12 * spin)
      mesh.current.scale.set(1, 1, Math.max(.025, depth))
    }
    if (material.current) material.current.opacity = Math.max(firstForm, restoredForm)
  })
  return <mesh ref={mesh} geometry={geometry.current}>
    <meshPhysicalMaterial ref={material} color="#c9e88c" roughness={.27} metalness={.12} clearcoat={.8} clearcoatRoughness={.2} transparent opacity={0} depthWrite={false}/>
  </mesh>
}
