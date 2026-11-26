import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { Ref } from 'react'
import { useRef } from 'react'
import { Group, Mesh, Object3D } from 'three'

export function MechanicalSequence() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section ref={section} className="mechanism-scroll"><div className="mechanism-stage">
    <Canvas camera={{ position: [0, 0, 7], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#171b19']}/><fog attach="fog" args={['#171b19', 9, 18]}/>
      <ambientLight intensity={.65}/><hemisphereLight args={['#f4e9d1', '#202a25', 1.2]}/><directionalLight position={[-3,4,6]} intensity={3.4} color="#fff0d4"/><pointLight position={[2,1,3]} intensity={9} color="#dfb870" distance={10}/>
      <Engine progress={scrollYProgress} reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.65,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#222722" roughness={.85}/></mesh>
    </Canvas>
    <div className="mechanism-head"><span>MOTION STUDY / 01</span><span>SCROLL TO DRIVE THE MECHANISM ↓</span></div>
    <div className="mechanism-copy"><span>CRANK · GEAR · SLIDER</span><h2>One turn<br/><em>sets it all in motion.</em></h2><p>A crank rotates the gear train. The connecting rod transfers that motion to a piston, which travels back and forth.</p></div>
    <div className="mechanism-labels"><span>01 / INPUT CRANK</span><span>02 / GEAR TRAIN</span><span>03 / RECIPROCATING PISTON</span></div>
    <div className="mechanism-foot"><span>ROTATION → RECIPROCATING MOTION</span><div><motion.i style={{ scaleX: reduceMotion ? 1 : scrollYProgress, transformOrigin: 'left' }}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function Engine({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const input = useRef<Group>(null)
  const output = useRef<Group>(null)
  const slider = useRef<Group>(null)
  const rod = useRef<Mesh>(null)
  const gearInput = useRef<Group>(null)
  const gearOutput = useRef<Group>(null)
  const pin = useRef<Object3D>(null)
  useFrame(() => {
    const p = reduceMotion ? .35 : progress.get()
    const angle = p * Math.PI * 6
    const crankRadius = .48
    const crankX = -1.1 + Math.cos(angle) * crankRadius
    const crankY = Math.sin(angle) * crankRadius
    const sliderX = .85
    const rodLength = Math.sqrt((sliderX - crankX) ** 2 + crankY ** 2)
    if (input.current) input.current.rotation.z = angle
    if (output.current) output.current.rotation.z = -angle * .75
    if (gearInput.current) gearInput.current.rotation.z = angle
    if (gearOutput.current) gearOutput.current.rotation.z = -angle * .75
    if (pin.current) pin.current.position.set(crankX, crankY, .42)
    if (slider.current) slider.current.position.y = crankY * .58
    if (rod.current) {
      rod.current.position.set((crankX + sliderX) / 2, crankY * .5, .35)
      rod.current.scale.y = rodLength
      rod.current.rotation.z = Math.atan2(crankY, sliderX - crankX) - Math.PI / 2
    }
  })
  return <group position={[1.15, -.05, 0]}>
    {/* Gear shafts and interlocking spur gears */}
    <Gear ref={gearInput} position={[-1.1,.72,0]} radius={.62} teeth={14} color="#bd9c5d"/>
    <Gear ref={gearOutput} position={[.05,.72,-.02]} radius={.46} teeth={10} color="#8f987e"/>
    <mesh position={[-1.1,.72,.13]}><cylinderGeometry args={[.095,.095,.16,24]}/><meshStandardMaterial color="#d2c18f" metalness={.8} roughness={.22}/></mesh>
    <mesh position={[.05,.72,.12]}><cylinderGeometry args={[.08,.08,.15,24]}/><meshStandardMaterial color="#d2c18f" metalness={.8} roughness={.22}/></mesh>
    {/* Slider guide */}
    <mesh position={[.85,0,-.05]}><boxGeometry args={[.22,2.15,.14]}/><meshStandardMaterial color="#77796c" metalness={.65} roughness={.33}/></mesh>
    <mesh ref={slider} position={[.85,0,.18]}><boxGeometry args={[.66,.42,.22]}/><meshStandardMaterial color="#d2c18f" metalness={.72} roughness={.24}/></mesh>
    {/* Crank wheel, pin and connecting rod */}
    <group ref={input} position={[-1.1,0,.22]}>
      <mesh><cylinderGeometry args={[.16,.16,.12,40]}/><meshStandardMaterial color="#c3a363" metalness={.78} roughness={.23}/></mesh>
      <mesh position={[0,.48,.04]}><sphereGeometry args={[.105,20,20]}/><meshStandardMaterial color="#efe1bd" metalness={.65} roughness={.2}/></mesh>
    </group>
    <mesh ref={pin}><sphereGeometry args={[.105,20,20]}/><meshStandardMaterial color="#efe1bd" metalness={.65} roughness={.2}/></mesh>
    <mesh ref={rod} position={[-.1,0,.35]}><boxGeometry args={[.12,1,.12]}/><meshStandardMaterial color="#d7d0bd" metalness={.7} roughness={.26}/></mesh>
    {/* Frame rails and foot */}
    <mesh position={[-.1,-1.25,-.12]}><boxGeometry args={[2.9,.11,.22]}/><meshStandardMaterial color="#51564d" metalness={.55} roughness={.4}/></mesh>
    <mesh position={[-.1,1.46,-.1]}><boxGeometry args={[2.9,.09,.2]}/><meshStandardMaterial color="#51564d" metalness={.55} roughness={.4}/></mesh>
    <mesh position={[-.1,-1.52,.08]}><boxGeometry args={[3.35,.18,.45]}/><meshStandardMaterial color="#30362f" metalness={.45} roughness={.38}/></mesh>
  </group>
}

function Gear({ ref, position, radius, teeth, color }: { ref: Ref<Group>; position: [number,number,number]; radius: number; teeth: number; color: string }) {
  return <group ref={ref} position={position}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[radius*.72,radius*.72,.16,48]}/><meshStandardMaterial color={color} metalness={.78} roughness={.26}/></mesh>
    <mesh><torusGeometry args={[radius*.46,.045,10,40]}/><meshStandardMaterial color="#e2c98e" metalness={.8} roughness={.2}/></mesh>
    {Array.from({length:teeth},(_,i)=>{const a=i*Math.PI*2/teeth;return <mesh key={i} position={[Math.cos(a)*radius,Math.sin(a)*radius,0]} rotation={[0,0,a]}><boxGeometry args={[radius*.2,radius*.34,.14]}/><meshStandardMaterial color={color} metalness={.78} roughness={.26}/></mesh>})}
    <mesh><torusGeometry args={[.12,.025,8,24]}/><meshStandardMaterial color="#ead39c" metalness={.75} roughness={.2}/></mesh>
  </group>
}
