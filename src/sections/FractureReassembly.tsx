import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Group, MathUtils, Vector3 } from 'three'

const COUNT=18
const palette=['#c6a96e','#9a735d','#d3c39a','#758a79','#b58b70','#8e9ca0']
const fragments=Array.from({length:COUNT},(_,i)=>{
  const y=1-2*(i+.5)/COUNT, radius=Math.sqrt(1-y*y), angle=i*2.399963
  const direction=new Vector3(Math.cos(angle)*radius,y,Math.sin(angle)*radius)
  return {direction,assembled:direction.clone().multiplyScalar(.42),scattered:direction.clone().multiplyScalar(1.55+((i*7)%5)*.1),color:palette[i%palette.length],scale:.27+((i*13)%5)*.025,spin:(i%2?1:-1)*(.8+(i%4)*.2)}
})

export function FractureReassembly(){
  const section=useRef<HTMLElement>(null)
  const reduceMotion=Boolean(useReducedMotion())
  const {scrollYProgress}=useScroll({target:section,offset:['start start','end end']})
  return <section ref={section} className="fracture-scroll"><div className="fracture-stage">
    <Canvas camera={{position:[0,0,5.5],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#1b211e']}/><fog attach="fog" args={['#1b211e',8,17]}/>
      <ambientLight intensity={.7}/><hemisphereLight args={['#fff0d4','#27312b',1.2]}/><directionalLight position={[-3,5,5]} intensity={3.5} color="#fff2d8"/><pointLight position={[2,1,3]} intensity={8} color="#d4b16f" distance={9}/>
      {fragments.map((fragment,index)=><Shard key={index} fragment={fragment} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.3,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#252c27" roughness={.9}/></mesh>
    </Canvas>
    <div className="fracture-head"><span>FORM STUDY / 02</span><span>SCROLL TO FRACTURE · CONTINUE TO REASSEMBLE ↓</span></div>
    <div className="fracture-copy"><span>BREAK · DRIFT · RETURN</span><h2>Made of<br/><em>many parts.</em></h2><p>The sculptural form separates into individual fragments, hangs in space, then finds its way back together.</p></div>
    <div className="fracture-labels"><span>01 / WHOLE</span><span>02 / FRACTURE</span><span>03 / REASSEMBLY</span></div>
    <div className="fracture-foot"><span>18 FRAGMENTS · ONE FORM</span><div><motion.i style={{scaleX:reduceMotion?1:scrollYProgress,transformOrigin:'left'}}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function Shard({fragment,index,progress,reduceMotion}:{fragment:typeof fragments[number];index:number;progress:MotionValue<number>;reduceMotion:boolean}){
  const ref=useRef<Group>(null)
  useFrame(({clock},delta)=>{
    if(!ref.current)return
    const p=reduceMotion?1:progress.get()
    const breakAmount=MathUtils.smoothstep(p,.2,.53)
    const returnAmount=MathUtils.smoothstep(p,.66,.94)
    const amount=breakAmount*(1-returnAmount)
    const t=1-amount
    const bob=Math.sin(clock.elapsedTime*1.4+index)*amount*.045
    const pos=fragment.assembled.clone().lerp(fragment.scattered,amount)
    ref.current.position.x=MathUtils.damp(ref.current.position.x,pos.x,7,delta)
    ref.current.position.y=MathUtils.damp(ref.current.position.y,pos.y+bob,7,delta)
    ref.current.position.z=MathUtils.damp(ref.current.position.z,pos.z,7,delta)
    ref.current.rotation.x=MathUtils.damp(ref.current.rotation.x,fragment.spin*amount,6,delta)
    ref.current.rotation.y=MathUtils.damp(ref.current.rotation.y,clock.elapsedTime*.16+fragment.spin*amount,6,delta)
    ref.current.rotation.z=MathUtils.damp(ref.current.rotation.z,-fragment.spin*amount,6,delta)
    ref.current.scale.setScalar(fragment.scale*(.9+.1*t))
  })
  return <group ref={ref} position={fragment.assembled}>
    <mesh castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={fragment.color} roughness={.31} metalness={.16} flatShading/></mesh>
    <mesh scale={1.012}><dodecahedronGeometry args={[1,0]}/><meshBasicMaterial color="#f0ddb0" wireframe transparent opacity={.2}/></mesh>
  </group>
}
