import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { MathUtils, Mesh, Quaternion, Vector3 } from 'three'

export function PendulumStudy(){
  const reduceMotion=Boolean(useReducedMotion())
  const wheelEnergy=useRef(0)
  return <section className="pendulum-stage" onWheel={(e)=>{wheelEnergy.current=MathUtils.clamp(wheelEnergy.current+e.deltaY*.001,-.8,.8)}}>
    <Canvas camera={{position:[0,0,6],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#e5e8df']}/><ambientLight intensity={.75}/><hemisphereLight args={['#f8f2dc','#51594e',1.2]}/><directionalLight position={[-3,4,5]} intensity={3.2} color="#fff7dc"/><pointLight position={[2,-1,3]} intensity={12} color="#d0aa65" distance={8}/>
      <Pendulum reduceMotion={reduceMotion} wheelEnergy={wheelEnergy}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.35,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#d2d8cc" roughness={.9}/></mesh>
    </Canvas>
    <div className="pendulum-head"><span>MOTION STUDY / 02</span><span>DRAG THE WEIGHT · SCROLL TO ADD ENERGY</span></div>
    <div className="pendulum-copy"><span>SWING · MOMENTUM · DAMPING</span><h2>Let it<br/><em>find its rhythm.</em></h2><p>Pull the suspended weight and release. Scroll quickly to add energy, then watch the swing ease back to rest.</p></div>
    <div className="pendulum-hint">GRAB THE WEIGHT OR SCROLL <b>↗</b></div>
    <div className="pendulum-foot"><span>GRAVITY · INERTIA · DAMPED REST</span><span>POINTER / TOUCH ENABLED</span></div>
  </section>
}

function Pendulum({reduceMotion,wheelEnergy}:{reduceMotion:boolean;wheelEnergy:RefObject<number>} ){
  const bob=useRef<Mesh>(null),rod=useRef<Mesh>(null)
  const theta=useRef(.35),velocity=useRef(0),target=useRef(0),drag=useRef(false)
  const [active,setActive]=useState(false)
  const pivot=new Vector3(0,1.6,0),down=new Vector3(0,-1,0),mid=new Vector3(),quat=new Quaternion(),upVector=new Vector3(0,1,0)
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.033)
    const impulse=wheelEnergy.current
    wheelEnergy.current*=Math.exp(-dt*2.8)
    if(!drag.current){
      velocity.current+=-Math.sin(theta.current)*4.6*dt
      velocity.current*=Math.exp(-dt*1.25)
      if(Math.abs(impulse)>.001)velocity.current+=impulse
      theta.current+=velocity.current*dt
      target.current=MathUtils.damp(target.current,0,2,dt)
    }else{
      theta.current=MathUtils.damp(theta.current,target.current,18,dt)
      velocity.current=0
    }
    if(reduceMotion&&!active)theta.current=MathUtils.damp(theta.current,0,4,dt)
    const length=2.05,angle=theta.current
    const end=new Vector3(pivot.x+Math.sin(angle)*length,pivot.y-Math.cos(angle)*length,0)
    if(bob.current)bob.current.position.copy(end)
    if(rod.current){mid.copy(pivot).add(end).multiplyScalar(.5);rod.current.position.copy(mid);down.set(Math.sin(angle),-Math.cos(angle),0).normalize();rod.current.quaternion.copy(quat.setFromUnitVectors(upVector,down));rod.current.scale.y=length}
  })
  const move=(e:ThreeEvent<PointerEvent>)=>{if(!drag.current)return;e.stopPropagation();target.current=MathUtils.clamp(Math.atan2(e.point.x-pivot.x,pivot.y-e.point.y),-.95,.95)}
  const downEvent=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();drag.current=true;setActive(true);(e.target as HTMLElement).setPointerCapture(e.pointerId);document.body.style.cursor='grabbing'}
  const release=()=>{drag.current=false;setActive(false);velocity.current=target.current*1.6;document.body.style.cursor=''}
  return <group>
    <mesh position={[0,1.65,0]}><boxGeometry args={[2.6,.18,.35]}/><meshStandardMaterial color="#62685d" metalness={.62} roughness={.3}/></mesh>
    <mesh position={[0,1.52,0]}><torusGeometry args={[.12,.04,12,32]}/><meshStandardMaterial color="#c5a263" metalness={.75} roughness={.2}/></mesh>
    <mesh ref={rod}><cylinderGeometry args={[.022,.022,1,12]}/><meshStandardMaterial color="#676b62" metalness={.74} roughness={.28}/></mesh>
    <mesh ref={bob} onPointerOver={()=>{if(!active)document.body.style.cursor='grab'}} onPointerOut={()=>{if(!active)document.body.style.cursor=''}} onPointerDown={downEvent} onPointerMove={move} onPointerUp={release} onPointerCancel={release} castShadow>
      <sphereGeometry args={[.38,40,32]}/><meshPhysicalMaterial color="#c3a05f" roughness={.22} metalness={.78} clearcoat={.55}/>
    </mesh>
  </group>
}
