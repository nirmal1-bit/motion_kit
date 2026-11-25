import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, Color, ExtrudeGeometry, MathUtils, PerspectiveCamera, Path, Shape, Vector3 } from 'three'
import type { DirectionalLight, PointLight } from 'three'

const chapters = [
  { label: 'PASSAGE / 01', title: 'Move through\nthe first idea.', detail: 'An opening in the letter becomes a threshold. Keep moving to see what follows.' },
  { label: 'A CHANGE OF PACE / 02', title: 'The space\nbetween words.', detail: 'Each turn through the type reveals another frame in the story.' },
  { label: 'THE NEXT FRAME / 03', title: 'A new page\ncomes into view.', detail: 'The camera clears the final letter and settles on the next chapter.' },
]

function glyphShape(letter: 'M' | 'O' | 'V' | 'E') {
  const shape = new Shape()
  if (letter === 'M') {
    shape.moveTo(0, 0); shape.lineTo(0, 8); shape.lineTo(1.35, 8); shape.lineTo(2.8, 4.2)
    shape.lineTo(4.25, 8); shape.lineTo(5.6, 8); shape.lineTo(5.6, 0); shape.lineTo(4.25, 0)
    shape.lineTo(4.25, 5.35); shape.lineTo(2.8, 2.65); shape.lineTo(1.35, 5.35); shape.lineTo(1.35, 0); shape.closePath()
  } else if (letter === 'O') {
    shape.moveTo(0, 0); shape.lineTo(6, 0); shape.lineTo(6, 8); shape.lineTo(0, 8); shape.closePath()
    const hole = new Path()
    hole.moveTo(1.45, 1.35); hole.lineTo(1.45, 6.65); hole.lineTo(4.55, 6.65); hole.lineTo(4.55, 1.35); hole.closePath()
    shape.holes.push(hole)
  } else if (letter === 'V') {
    shape.moveTo(0, 8); shape.lineTo(1.55, 8); shape.lineTo(3, 2.55); shape.lineTo(4.45, 8)
    shape.lineTo(6, 8); shape.lineTo(3.8, 0); shape.lineTo(2.2, 0); shape.closePath()
  } else {
    shape.moveTo(0, 0); shape.lineTo(6, 0); shape.lineTo(6, 1.45); shape.lineTo(1.75, 1.45)
    shape.lineTo(1.75, 3.25); shape.lineTo(5.15, 3.25); shape.lineTo(5.15, 4.75)
    shape.lineTo(1.75, 4.75); shape.lineTo(1.75, 6.55); shape.lineTo(6, 6.55)
    shape.lineTo(6, 8); shape.lineTo(0, 8); shape.closePath()
  }
  return shape
}

function useGlyphGeometry(letter: 'M' | 'O' | 'V' | 'E') {
  return useMemo(() => {
    const geometry = new ExtrudeGeometry(glyphShape(letter), {
      depth: 0.82,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 2,
      curveSegments: 8,
    })
    geometry.translate(-3, -4, -0.41)
    geometry.computeVertexNormals()
    return geometry
  }, [letter])
}

function Glyph({ letter, z, color, rotate = 0 }: { letter: 'M' | 'O' | 'V' | 'E'; z: number; color: string; rotate?: number }) {
  const geometry = useGlyphGeometry(letter)
  return <mesh geometry={geometry} position={[0, 0, z]} rotation={[0, 0, rotate]} castShadow>
    <meshStandardMaterial color={color} roughness={0.5} metalness={0.18} />
  </mesh>
}

function EditorialPanel() {
  return <group position={[0, 0, -27]}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[15, 9, 0.32]} /><meshStandardMaterial color="#d2c2a6" roughness={0.82} /></mesh>
    <mesh position={[-4.25, 1.5, 0.22]}><boxGeometry args={[0.08, 5.4, 0.06]} /><meshBasicMaterial color="#8c644c" /></mesh>
    <mesh position={[-2.1, 3.1, 0.23]}><boxGeometry args={[4.2, 0.12, 0.06]} /><meshBasicMaterial color="#8c644c" /></mesh>
    <mesh position={[-2.1, -0.2, 0.23]}><boxGeometry args={[4.2, 0.08, 0.06]} /><meshBasicMaterial color="#8c644c" /></mesh>
    <mesh position={[3.15, 0.45, 0.22]}><boxGeometry args={[4.8, 6.5, 0.06]} /><meshStandardMaterial color="#817c71" roughness={0.75} /></mesh>
    <mesh position={[3.15, 0.45, 0.27]}><planeGeometry args={[4.1, 5.8]} /><meshStandardMaterial color="#b2a48d" roughness={0.82} /></mesh>
    <mesh position={[3.15, -2.65, 0.31]}><boxGeometry args={[4.8, 0.12, 0.1]} /><meshBasicMaterial color="#edc18a" /></mesh>
  </group>
}

function TypographyCamera({ progress, keyLight, rimLight }: { progress: MotionValue<number>; keyLight: React.RefObject<DirectionalLight | null>; rimLight: React.RefObject<PointLight | null> }) {
  const path = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0, 22), new Vector3(0, 0, 15), new Vector3(0, 0, 8),
    new Vector3(0, 0, 2), new Vector3(0.5, 1.25, -3), new Vector3(0, 1.25, -9),
    new Vector3(0, 1.25, -15), new Vector3(-0.3, 0.65, -21), new Vector3(0, 0.2, -25),
  ]), [])
  const ahead = useRef(new Vector3())
  const direction = useRef(new Vector3())
  const backdrop = useMemo(() => new Color(), [])
  const nearColor = useMemo(() => new Color('#293139'), [])
  const endColor = useMemo(() => new Color('#a99c86'), [])
  useFrame(({ camera, scene }) => {
    const t = MathUtils.clamp(progress.get(), 0, 1)
    const point = path.getPointAt(t)
    path.getTangentAt(Math.min(t + 0.025, 1), direction.current).normalize()
    camera.position.copy(point)
    ahead.current.copy(point).addScaledVector(direction.current, 5)
    camera.lookAt(ahead.current)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.lerp(48, 43, MathUtils.smoothstep(t, 0.5, 0.9))
      camera.updateProjectionMatrix()
    }
    backdrop.copy(nearColor).lerp(endColor, MathUtils.smoothstep(t, 0.55, 1))
    scene.background = backdrop
    if (scene.fog) scene.fog.color.copy(backdrop)
    if (keyLight.current) keyLight.current.intensity = MathUtils.lerp(2.2, 1.4, t)
    if (rimLight.current) rimLight.current.intensity = MathUtils.lerp(5, 13, t)
  })
  return <>
    <fog attach="fog" args={['#293139', 22, 62]} />
    <ambientLight intensity={0.62} />
    <hemisphereLight args={['#e1d4c0', '#343a43', 0.86]} />
    <directionalLight ref={keyLight} position={[-5, 8, 8]} color="#f1d1a5" intensity={2.2} />
    <pointLight ref={rimLight} position={[6, 4, -11]} color="#8cbac3" intensity={5} distance={35} />
    <pointLight position={[-6, -1, 4]} color="#d78059" intensity={2.2} distance={22} />
  </>
}

function TypeScene({ progress }: { progress: MotionValue<number> }) {
  const keyLight = useRef<DirectionalLight>(null)
  const rimLight = useRef<PointLight>(null)
  return <>
    <TypographyCamera progress={progress} keyLight={keyLight} rimLight={rimLight} />
    <Glyph letter="M" z={11} color="#d6a77e" rotate={-0.025} />
    <Glyph letter="O" z={3} color="#91b7bd" rotate={0.018} />
    <Glyph letter="V" z={-7} color="#b2a890" rotate={-0.018} />
    <Glyph letter="E" z={-17} color="#d19a73" rotate={0.015} />
    <EditorialPanel />
    {[-23, -15, -7, 1, 9, 17].map((z, index) => <group key={z} position={[index % 2 ? -7 : 7, 0, z]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.06, 14, 0.06]} /><meshBasicMaterial color={index % 2 ? '#57646a' : '#756658'} transparent opacity={0.55} /></mesh>
    </group>)}
  </>
}

function TypeChapter({ index, active, reduceMotion }: { index: number; active: boolean; reduceMotion: boolean }) {
  const chapter = chapters[index]
  return <motion.article className={'type-camera-chapter type-camera-chapter-' + index} initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 18 }} transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}>
    <span>{chapter.label}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{chapter.detail}</p>
  </motion.article>
}

export function TypographyCameraMove() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const [chapter, setChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.7 ? 1 : 2
    setChapter((current) => current === next ? current : next)
  })
  return <section ref={section} className="type-camera-scroll">
    <div className="type-camera-stage">
      <Canvas className="type-camera-canvas" camera={{ position: [0, 0, 22], fov: 48, near: 0.1, far: 90 }} dpr={[1, 1.5]}><TypeScene progress={scrollYProgress} /></Canvas>
      <div className="type-camera-shade" />
      <header className="type-camera-head"><span>TYPE AS PLACE / 12</span><span>{chapter === 0 ? 'ENTER THE LETTER' : chapter === 1 ? 'BETWEEN THE FORMS' : 'NEXT FRAME'}</span></header>
      <div className="type-camera-copy">{chapters.map((_, index) => <TypeChapter key={index} index={index} active={chapter === index} reduceMotion={reduceMotion} />)}</div>
      <footer className="type-camera-foot"><span>M → O → V → E</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} /></div><span>SCROLL TO MOVE THROUGH TYPE ↓</span></footer>
    </div>
  </section>
}
