import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { CanvasTexture, ShaderMaterial, SRGBColorSpace } from 'three'

const scenes = [
  { name: 'Mineral memory', label: '01 / FORM', colors: ['#a6b8a3', '#d9c294'], shape: 'circle' },
  { name: 'A warmer current', label: '02 / FLOW', colors: ['#8f9ec1', '#e1a884'], shape: 'wave' },
  { name: 'After the light', label: '03 / GLOW', colors: ['#c7a5bb', '#f0ce8d'], shape: 'sun' },
]

function makeSceneTexture(index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')!
  const scene = scenes[index]
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, scene.colors[0])
  gradient.addColorStop(1, scene.colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = .28
  for (let i = 0; i < 22; i++) {
    const radius = 25 + i * 9
    ctx.beginPath()
    ctx.arc(540 + Math.sin(i * .7) * 65, 370 + Math.cos(i * .6) * 45, radius, 0, Math.PI * 2)
    ctx.strokeStyle = i % 2 ? '#f8f3e8' : '#34383a'
    ctx.lineWidth = 2 + (i % 3)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#f6f1e8cc'
  if (scene.shape === 'circle') {
    ctx.beginPath(); ctx.ellipse(520, 380, 185, 250, -.32, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#63766a'; ctx.beginPath(); ctx.arc(600, 310, 85, 0, Math.PI * 2); ctx.fill()
  } else if (scene.shape === 'wave') {
    ctx.beginPath(); ctx.moveTo(0, 490); ctx.bezierCurveTo(250, 270, 520, 730, 1024, 360); ctx.lineTo(1024, 768); ctx.lineTo(0, 768); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#526780'; ctx.beginPath(); ctx.ellipse(470, 310, 190, 110, -.4, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.beginPath(); ctx.arc(520, 370, 180, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#704d65'; ctx.lineWidth = 28
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(520, 370); ctx.lineTo(520 + Math.cos(i * Math.PI / 6) * 350, 370 + Math.sin(i * Math.PI / 6) * 300); ctx.stroke() }
  }
  ctx.fillStyle = '#242620'
  ctx.font = '500 42px sans-serif'
  ctx.fillText(`STUDY NO. 0${index + 1}`, 54, 90)
  ctx.font = 'italic 92px Georgia'
  ctx.fillText(scene.name, 54, 690)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fragmentShader = `
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;
float random(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(random(i), random(i + vec2(1.0, 0.0)), f.x), mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 uv = vUv;
  float n = noise(uv * 9.0 + vec2(uTime * 0.02, 0.0));
  float edge = smoothstep(uProgress - 0.12, uProgress + 0.12, n + (uv.x - 0.5) * 0.12);
  vec2 drift = (uv - 0.5) * 0.035 * sin(uProgress * 3.14159);
  vec4 a = texture2D(uFrom, uv - drift * edge);
  vec4 b = texture2D(uTo, uv + drift * (1.0 - edge));
  gl_FragColor = mix(b, a, edge);
}`

function TransitionPlane({ progress, textures, reduceMotion }: { progress: MotionValue<number>; textures: CanvasTexture[]; reduceMotion: boolean }) {
  const material = useRef<ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (!material.current) return
    const p = reduceMotion ? 0 : progress.get()
    const stage = Math.min(1, Math.floor(p * 2))
    const local = p >= 1 ? 1 : (p * 2) % 1
    material.current.uniforms.uFrom.value = textures[stage]
    material.current.uniforms.uTo.value = textures[stage + 1]
    material.current.uniforms.uProgress.value = local
    material.current.uniforms.uTime.value = clock.elapsedTime
  })
  return <mesh>
    <planeGeometry args={[4.5, 3.38, 1, 1]} />
    <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ uFrom: { value: textures[0] }, uTo: { value: textures[1] }, uProgress: { value: 0 }, uTime: { value: 0 } }} />
  </mesh>
}

export function WebGLTransition() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const active = useTransform(scrollYProgress, [0, .48, .52, 1], [0, 0, 1, 2])
  const textures = useMemo(() => scenes.map((_, index) => makeSceneTexture(index)), [])
  return <section className="webgl-transition-scroll" ref={section}>
    <div className="webgl-transition-stage">
      <div className="webgl-transition-head"><span>IMAGE STUDIES / WEBGL</span><span>SCROLL TO TRANSFORM</span></div>
      <div className="webgl-transition-canvas"><Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}><TransitionPlane progress={scrollYProgress} textures={textures} reduceMotion={reduceMotion}/></Canvas></div>
      <div className="webgl-transition-copy">{scenes.map((scene, index) => <SceneCaption key={scene.label} scene={scene} index={index} active={active} reduceMotion={reduceMotion}/>)}</div>
      <div className="webgl-transition-foot"><span>NO EXTERNAL IMAGE ASSETS · PROCEDURAL ART</span><motion.i style={reduceMotion ? { scaleX: 1 } : { scaleX: scrollYProgress, transformOrigin: 'left' }}/></div>
    </div>
  </section>
}

function SceneCaption({ scene, index, active, reduceMotion }: { scene: typeof scenes[number]; index: number; active: MotionValue<number>; reduceMotion: boolean }) {
  const opacity = useTransform(active, [index - .35, index, index + .35], [0, 1, 0])
  const y = useTransform(active, [index - .35, index], [18, 0])
  return <motion.div style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}><span>{scene.label}</span><h2>{scene.name}</h2></motion.div>
}
