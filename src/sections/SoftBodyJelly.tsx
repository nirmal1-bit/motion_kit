import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { BufferAttribute, MathUtils, Mesh, SphereGeometry, Vector3 } from 'three'

export function SoftBodyJelly() {
  const reduceMotion = Boolean(useReducedMotion())
  return <section className="jelly-stage">
    <Canvas camera={{position:[0,0,4.4],fov:42}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#e4eadc']}/>
      <ambientLight intensity={.75}/><hemisphereLight args={['#f4ffdf','#52604b',1.4]}/><directionalLight position={[-3,4,5]} intensity={3.4} color="#fff7dc"/><pointLight position={[2,-1,3]} intensity={13} color="#b5ed63" distance={8}/>
      <Jelly reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.3,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#d1d9c7" roughness={.9}/></mesh>
    </Canvas>
    <div className="jelly-head"><span>SOFT BODY STUDY / 01</span><span>DRAG THE FORM · RELEASE TO SETTLE</span></div>
    <div className="jelly-copy"><span>PRESS · PULL · RELEASE</span><h2>Give it<br/><em>a little wobble.</em></h2><p>Grab the soft form and pull. Its surface stretches behind your hand, then jiggles back into shape.</p></div>
    <div className="jelly-hint">CLICK / TOUCH & DRAG <b>↗</b></div>
    <motion.div className="jelly-badge" animate={reduceMotion?undefined:{rotate:[-5,5,-5]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}}>SOFT<br/>ON THE<br/>OUTSIDE ✳</motion.div>
  </section>
}

function Jelly({reduceMotion}:{reduceMotion:boolean}){
  const mesh=useRef<Mesh>(null)
  const geometry=useRef(new SphereGeometry(.9,64,48))
  const base=useRef<Float32Array | null>(null)
  const pointer=useRef(new Vector3())
  const target=useRef(new Vector3())
  const velocity=useRef(new Vector3())
  const wobble=useRef(0)
  const last=useRef(new Vector3())
  const [dragging,setDragging]=useState(false)
  if(!base.current)base.current=new Float32Array(geometry.current.attributes.position.array as Float32Array)
  useFrame(({clock},delta)=>{
    if(!mesh.current)return
    const dt=Math.min(delta,.04)
    velocity.current.x+=(target.current.x-mesh.current.position.x)*dt*24
    velocity.current.y+=(target.current.y-mesh.current.position.y)*dt*24
    velocity.current.multiplyScalar(Math.exp(-dt*(dragging?4:7)))
    mesh.current.position.x+=velocity.current.x*dt
    mesh.current.position.y+=velocity.current.y*dt
    const stretch=Math.min(.42,Math.hypot(velocity.current.x,velocity.current.y)*.045 + (dragging ? .06 : 0))
    wobble.current=MathUtils.damp(wobble.current,stretch,dragging?3:1.7,dt)
    const pos=geometry.current.attributes.position as BufferAttribute
    const amp=reduceMotion?0:wobble.current
    for(let i=0;i<pos.count;i++){
      const x=base.current![i*3],y=base.current![i*3+1],z=base.current![i*3+2]
      const direction=(x*pointer.current.x+y*pointer.current.y+z*pointer.current.z)
      const wave=Math.sin(clock.elapsedTime*8 + y*5 + x*3)*amp
      const pull=Math.max(0,direction)*amp*.85
      const squash=dragging?1-.07*Math.abs(pointer.current.y):1
      const factor=1+wave+pull
      pos.setXYZ(i,x*factor,y*factor*squash,z*factor)
    }
    pos.needsUpdate=true;geometry.current.computeVertexNormals()
    mesh.current.rotation.z=MathUtils.damp(mesh.current.rotation.z,-velocity.current.x*.08,3,dt)
    mesh.current.rotation.x=MathUtils.damp(mesh.current.rotation.x,velocity.current.y*.06,3,dt)
  })
  const down=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();(e.target as HTMLElement).setPointerCapture(e.pointerId);setDragging(true);last.current.copy(e.point);target.current.copy(mesh.current!.position);document.body.style.cursor='grabbing'}
  const move=(e:ThreeEvent<PointerEvent>)=>{if(!dragging)return;e.stopPropagation();const dx=e.point.x-last.current.x,dy=e.point.y-last.current.y;target.current.x=MathUtils.clamp(target.current.x+dx,-1.35,1.35);target.current.y=MathUtils.clamp(target.current.y+dy,-.7,1.15);pointer.current.set(dx*4,dy*4,1).normalize();last.current.copy(e.point);wobble.current=Math.min(.42,wobble.current+Math.hypot(dx,dy)*.32)}
  const up=()=>{setDragging(false);target.current.set(0,0,0);document.body.style.cursor=''}
  return <mesh ref={mesh} geometry={geometry.current} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerOut={()=>{if(dragging)up();else document.body.style.cursor=''}} onPointerOver={()=>{if(!dragging)document.body.style.cursor='grab'}} castShadow>
    <meshPhysicalMaterial color="#b9df71" roughness={.22} metalness={.02} clearcoat={.8} clearcoatRoughness={.18}/>
  </mesh>
}
