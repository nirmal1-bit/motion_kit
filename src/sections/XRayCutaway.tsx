import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Group, MathUtils, Mesh, MeshStandardMaterial } from 'three'

export function XRayCutaway() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section ref={section} className="xray-scroll"><div className="xray-stage">
    <Canvas camera={{ position: [0, 0, 5.8], fov: 34 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#151816']}/><fog attach="fog" args={['#151816', 8, 18]}/>
      <ambientLight intensity={.75}/><hemisphereLight args={['#fff1d9', '#222b29', 1.1]}/><directionalLight position={[-3, 4, 5]} intensity={3.2} color="#fff0d4"/><pointLight position={[2, 1, 3]} intensity={7} color="#d6b77a" distance={8}/>
      <WatchCutaway progress={scrollYProgress} reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.35,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#1b201d" roughness={.9}/></mesh>
    </Canvas>
    <div className="xray-head"><span>MECHANICAL STUDY / 01</span><span>SCROLL TO REVEAL THE MOVEMENT ↓</span></div>
    <div className="xray-copy"><span>WATCH / AUTOMATIC MOVEMENT</span><h2>Time,<br/><em>opened up.</em></h2><p>The steel case and dial recede to reveal the gears, balance wheel, and mainspring beneath.</p></div>
    <div className="xray-callouts"><span>01 / STEEL CASE</span><i/><span>02 / BALANCE WHEEL</span><i/><span>03 / GEAR TRAIN</span></div>
    <div className="xray-foot"><span>CASE → MECHANISM → CASE</span><div><motion.i style={{ scaleX: reduceMotion ? 1 : scrollYProgress, transformOrigin: 'left' }}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function WatchCutaway({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const caseMaterial = useRef<MeshStandardMaterial>(null)
  const dialMaterial = useRef<MeshStandardMaterial>(null)
  const hands = useRef<Group>(null)
  const balance = useRef<Mesh>(null)
  const gear = useRef<Mesh>(null)
  const watch = useRef<Group>(null)
  useFrame(({ clock }) => {
    const p = reduceMotion ? .5 : progress.get()
    const open = MathUtils.smoothstep(p, .2, .53) * (1 - MathUtils.smoothstep(p, .72, .96))
    if (caseMaterial.current) caseMaterial.current.opacity = 1 - open * .86
    if (dialMaterial.current) dialMaterial.current.opacity = 1 - open * .95
    if (hands.current) hands.current.rotation.z = -clock.elapsedTime * .12
    if (balance.current) balance.current.rotation.z = Math.sin(clock.elapsedTime * 5) * .17
    if (gear.current) gear.current.rotation.z = clock.elapsedTime * .8
    if (watch.current) watch.current.rotation.y = Math.sin(clock.elapsedTime * .22) * .035
  })
  const tickAngles = Array.from({ length: 12 }, (_, i) => i * Math.PI / 6)
  return <group ref={watch} position={[1.05, -.05, 0]}>
    {/* Leather strap above and below the case */}
    <mesh position={[0, 1.25, -.2]}><boxGeometry args={[.68, 1.25, .16]}/><meshStandardMaterial color="#47372b" roughness={.82}/></mesh>
    <mesh position={[0, -1.25, -.2]}><boxGeometry args={[.68, 1.25, .16]}/><meshStandardMaterial color="#47372b" roughness={.82}/></mesh>
    {/* Mechanical movement: plates, jeweled pivots and meshing gears */}
    <mesh position={[0,0,-.02]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.75,.75,.12,64]}/><meshStandardMaterial color="#625744" metalness={.55} roughness={.38}/></mesh>
    <mesh ref={gear} position={[-.28,.12,.09]}><torusGeometry args={[.31,.035,10,40]}/><meshStandardMaterial color="#c1a36a" metalness={.82} roughness={.27}/></mesh>
    <mesh position={[-.28,.12,.08]}><cylinderGeometry args={[.045,.045,.04,20]}/><meshStandardMaterial color="#7b4d3c" metalness={.5} roughness={.3}/></mesh>
    <mesh ref={balance} position={[.28,-.16,.12]}><torusGeometry args={[.27,.027,10,48]}/><meshStandardMaterial color="#d0b276" metalness={.82} roughness={.22}/></mesh>
    <mesh position={[.28,-.16,.1]}><torusGeometry args={[.19,.012,8,36]}/><meshStandardMaterial color="#947f58" metalness={.72} roughness={.28}/></mesh>
    {[-.47,-.2,.2,.47].map((x,i)=><mesh key={x} position={[x,(i%2?-.42:.42),.12]}><sphereGeometry args={[.045,12,12]}/><meshStandardMaterial color="#a65c50" metalness={.4} roughness={.24}/></mesh>)}
    {/* Dial and hands sit above the gears and fade with the case */}
    <mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.77,.77,.035,64]}/><meshStandardMaterial ref={dialMaterial} color="#d8d1bd" roughness={.48} transparent depthWrite={false}/></mesh>
    {tickAngles.map((angle,i)=><mesh key={i} position={[Math.sin(angle)*.62,Math.cos(angle)*.62,.25]} rotation={[0,0,-angle]}><boxGeometry args={[i%3===0?.035:.018,i%3===0?.12:.07,.018]}/><meshStandardMaterial color="#393b34"/></mesh>)}
    <group ref={hands} position={[0,0,.29]}>
      <mesh position={[0,.19,0]}><boxGeometry args={[.035,.4,.018]}/><meshStandardMaterial color="#30342f"/></mesh>
      <mesh rotation={[0,0,-.8]} position={[0,.12,.008]}><boxGeometry args={[.022,.28,.018]}/><meshStandardMaterial color="#695a3b"/></mesh>
      <mesh><sphereGeometry args={[.055,16,16]}/><meshStandardMaterial color="#b18d51" metalness={.7}/></mesh>
    </group>
    {/* Case, bezel and crystal form the outer shell */}
    <mesh position={[0,0,.31]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.91,.91,.22,64]}/><meshStandardMaterial ref={caseMaterial} color="#b6b6ad" metalness={.82} roughness={.24} transparent depthWrite={false}/></mesh>
    <mesh position={[0,0,.44]}><torusGeometry args={[.84,.075,16,72]}/><meshStandardMaterial color="#d2c08e" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[.99,0,.22]} rotation={[0,Math.PI/2,0]}><cylinderGeometry args={[.13,.13,.28,32]}/><meshStandardMaterial color="#b6b6ad" metalness={.82} roughness={.25}/></mesh>
  </group>
}
