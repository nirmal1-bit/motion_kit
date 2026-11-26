import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Group, MathUtils } from 'three'

export function PaperFold() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section ref={section} className="paperfold-scroll"><div className="paperfold-stage">
    <Canvas camera={{ position: [0,0,5.8], fov: 36 }} dpr={[1,1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#20221e']}/><fog attach="fog" args={['#20221e',9,18]}/>
      <ambientLight intensity={.8}/><hemisphereLight args={['#fff0d5','#333329',1.1]}/><directionalLight position={[-3,4,6]} intensity={3.4} color="#fff0d9"/><pointLight position={[2,1,3]} intensity={6} color="#d9b981" distance={9}/>
      <BoxNet progress={scrollYProgress} reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.45,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#292b25" roughness={.9}/></mesh>
    </Canvas>
    <div className="paperfold-head"><span>FORM STUDY / 01</span><span>SCROLL TO FOLD THE NET ↓</span></div>
    <div className="paperfold-copy"><span>CREASE · LIFT · LOCK</span><h2>A flat sheet<br/><em>finds its form.</em></h2><p>Four scored panels rise around a central base and meet as an open paper package.</p></div>
    <div className="paperfold-labels"><span>01 / CUT & SCORE</span><span>02 / FOLD THE SIDES</span><span>03 / FORM THE BOX</span></div>
    <div className="paperfold-foot"><span>ONE NET · FOUR HINGES · ONE FORM</span><div><motion.i style={{scaleX:reduceMotion?1:scrollYProgress,transformOrigin:'left'}}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function BoxNet({progress,reduceMotion}:{progress:MotionValue<number>;reduceMotion:boolean}){
  const left=useRef<Group>(null),right=useRef<Group>(null),top=useRef<Group>(null),bottom=useRef<Group>(null),box=useRef<Group>(null)
  useFrame(()=>{
    const p=reduceMotion?1:progress.get()
    const fold=MathUtils.smoothstep(p,.18,.78)
    const ease=fold*fold*(3-2*fold)
    if(left.current)left.current.rotation.y=-ease*Math.PI/2
    if(right.current)right.current.rotation.y=ease*Math.PI/2
    if(top.current)top.current.rotation.x=-ease*Math.PI/2
    if(bottom.current)bottom.current.rotation.x=ease*Math.PI/2
    if(box.current)box.current.rotation.y=Math.sin(p*Math.PI*2)*.14
  })
  const paper='#e6d7b7'
  return <group position={[.9,-.05,0]} ref={box}>
    <Panel position={[0,0,0]} size={[1,1]} color="#d8c49d"/>
    <group ref={left} position={[-.5,0,0]}><Panel position={[-.5,0,0]} size={[1,1]} color={paper}/></group>
    <group ref={right} position={[.5,0,0]}><Panel position={[.5,0,0]} size={[1,1]} color="#decba5"/></group>
    <group ref={top} position={[0,.5,0]}><Panel position={[0,.5,0]} size={[1,1]} color="#eee2c7"/></group>
    <group ref={bottom} position={[0,-.5,0]}><Panel position={[0,-.5,0]} size={[1,1]} color="#d5c19a"/></group>
    <mesh position={[0,0,-.5]}><planeGeometry args={[1,1]}/><meshStandardMaterial color="#bb9568" side={2} roughness={.82}/></mesh>
  </group>
}

function Panel({position,size,color}:{position:[number,number,number];size:[number,number];color:string}){
  return <group position={position}>
    <mesh><planeGeometry args={size}/><meshStandardMaterial color={color} side={2} roughness={.84}/></mesh>
    <mesh position={[0,0,.008]}><planeGeometry args={[.012,.72]}/><meshBasicMaterial color="#b49a71" transparent opacity={.55}/></mesh>
    <mesh position={[0,-.33,.01]}><planeGeometry args={[.42,.012]}/><meshBasicMaterial color="#b49a71" transparent opacity={.6}/></mesh>
    <mesh position={[0,.18,.012]}><planeGeometry args={[.13,.13]}/><meshBasicMaterial color="#a38258"/></mesh>
  </group>
}
