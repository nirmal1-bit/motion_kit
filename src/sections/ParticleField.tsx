import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { BufferAttribute, BufferGeometry, ShaderMaterial, Vector2 } from 'three'
import { useRef as useThreeRef } from 'react'

const vertexShader = `
attribute float aSize;
uniform float uTime;
uniform vec2 uPointer;
uniform float uActive;
varying float vAlpha;
void main() {
  vec3 p = position;
  float wave = sin(p.x * 2.1 + uTime * 0.35) * cos(p.y * 1.7 - uTime * 0.24);
  p.z += wave * 0.16;
  vec2 delta = p.xy - uPointer;
  float d = length(delta);
  float push = exp(-d * 1.55) * uActive;
  p.xy += normalize(delta + vec2(0.0001)) * push * 2.0;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * (280.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  vAlpha = 0.45 + 0.55 * (1.0 - smoothstep(0.0, 2.3, d));
}`

const fragmentShader = `
uniform float uTime;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float glow = 1.0 - smoothstep(0.02, 0.5, d);
  vec3 color = mix(vec3(0.38, 0.68, 1.0), vec3(0.92, 0.97, 1.0), glow);
  float pulse = 0.78 + 0.22 * sin(uTime * 1.3 + gl_FragCoord.x * 0.04);
  gl_FragColor = vec4(color, glow * vAlpha * pulse);
}`

function ParticleCloud({ pointerX, pointerY, active, reduceMotion }: { pointerX: MotionValue<number>; pointerY: MotionValue<number>; active: MotionValue<number>; reduceMotion: boolean }) {
  const material = useThreeRef<ShaderMaterial>(null)
  const geometry = useMemo(() => {
    const count = 2600
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * 3.4
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius * .68
      positions[i * 3 + 2] = (Math.random() - .5) * 1.2
      sizes[i] = .05 + Math.random() * .1
    }
    const result = new BufferAttribute(positions, 3)
    const geo = new BufferGeometry()
    geo.setAttribute('position', result)
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = reduceMotion ? 0 : clock.elapsedTime
    material.current.uniforms.uPointer.value.set(pointerX.get() * 3.6, pointerY.get() * 2.2)
    material.current.uniforms.uActive.value = reduceMotion ? 0 : active.get()
  })

  return <points geometry={geometry}>
    <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} uniforms={{ uTime: { value: 0 }, uPointer: { value: new Vector2() }, uActive: { value: 0 } }} />
  </points>
}

export function ParticleField() {
  const field = useRef<HTMLDivElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const [entered, setEntered] = useState(false)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const pointerX = useSpring(px, { stiffness: 65, damping: 24 })
  const pointerY = useSpring(py, { stiffness: 65, damping: 24 })
  const active = useSpring(entered ? 1 : 0, { stiffness: 80, damping: 20 })

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = field.current?.getBoundingClientRect()
    if (!rect) return
    px.set(((event.clientX - rect.left) / rect.width - .5) * 2)
    py.set(-((event.clientY - rect.top) / rect.height - .5) * 2)
    field.current?.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    field.current?.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  return <section className="particle-field-demo" ref={field} onPointerMove={move} onPointerEnter={() => setEntered(true)} onPointerLeave={() => { setEntered(false); px.set(0); py.set(0) }}>
    <div className="particle-field-copy"><span>FIELD STUDY / 01</span><h2>Shape the<br/><em>invisible.</em></h2><p>Move through the field. Particles flow away from your pointer, then gather back into place.</p></div>
    <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true }}><ParticleCloud pointerX={pointerX} pointerY={pointerY} active={active} reduceMotion={reduceMotion}/></Canvas>
    <div className="particle-field-meta"><span>GPU PARTICLES · POINTER FORCE</span><motion.div animate={{ opacity: entered ? .95 : .45 }}>MOVE POINTER TO DISTURB <b>↗</b></motion.div></div>
  </section>
}
