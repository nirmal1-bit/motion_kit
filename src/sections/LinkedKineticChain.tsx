import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { InstancedMesh, Object3D, Quaternion, Vector3 } from 'three'

const COUNT=12, LINK=.38
const REST=Array.from({length:COUNT},(_,i)=>new Vector3(-2.15+i*LINK,.15-Math.sin(i/11*Math.PI)*.12,0))

export function LinkedKineticChain(){
  const reduceMotion=Boolean(useReducedMotion())
  return <section className="chain-stage">
    <Canvas camera={{position:[0,0,6.3],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#e6eade']}/><ambientLight intensity={.75}/><hemisphereLight args={['#f7ffdf','#566251',1.4]}/><directionalLight position={[-3,4,5]} intensity={3.2} color="#fff7dd"/><pointLight position={[2,-1,3]} intensity={14} color="#b5e768" distance={9}/>
      <Chain reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.1,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#d2d9c9" roughness={.9}/></mesh>
    </Canvas>
    <div className="chain-head"><span>LINKED MOTION / 01</span><span>DRAG THE END NODE · WATCH THE WAVE TRAVEL</span></div>
    <div className="chain-copy"><span>INPUT · LAG · FOLLOW-THROUGH</span><h2>Pull one.<br/><em>Move the whole chain.</em></h2><p>Drag the end node. Each connected link follows with spring lag, then settles when you let go.</p></div>
    <div className="chain-hint">GRAB THE GREEN NODE <b>↗</b></div>
    <div className="chain-foot"><span>CONNECTED NODES · DAMPED MOTION</span><span>POINTER / TOUCH ENABLED</span></div>
  </section>
}

function Chain({reduceMotion}:{reduceMotion:boolean}){
  const current=useRef(REST.map(p=>p.clone())),previous=useRef(REST.map(p=>p.clone()))
  const target=useRef(REST[COUNT-1].clone()),dragging=useRef(false)
  const beads=useRef<Array<Object3D|null>>([])
  const links=useRef<InstancedMesh>(null)
  const [active,setActive]=useState(false)
  const temp=new Object3D(),quat=new Quaternion(),up=new Vector3(0,1,0),direction=new Vector3()
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.033),points=current.current,old=previous.current
    if(!dragging.current){target.current.lerp(REST[COUNT-1],Math.min(1,dt*3.5))}
    points[0].copy(REST[0]);points[COUNT-1].lerp(target.current,Math.min(1,dt*24))
    for(let i=1;i<COUNT-1;i++){
      if(reduceMotion){points[i].lerp(REST[i],Math.min(1,dt*5));continue}
      const x=points[i].x+(points[i].x-old[i].x)*.92
      const y=points[i].y+(points[i].y-old[i].y)*.92-dt*dt*.8
      old[i].copy(points[i]);points[i].set(x,y,0)
    }
    for(let pass=0;pass<7;pass++){
      points[0].copy(REST[0])
      for(let i=0;i<COUNT-1;i++){
        direction.subVectors(points[i+1],points[i]);const length=direction.length()||1;direction.multiplyScalar((length-LINK)/length*.5)
        if(i>0)points[i].add(direction)
        if(i+1<COUNT-1)points[i+1].sub(direction)
      }
      points[0].copy(REST[0]);points[COUNT-1].lerp(target.current,.7)
    }
    for(let i=0;i<COUNT;i++)if(beads.current[i])beads.current[i]!.position.copy(points[i])
    if(links.current){
      for(let i=0;i<COUNT-1;i++){
        const a=points[i],b=points[i+1];direction.subVectors(b,a);const length=direction.length()
        temp.position.copy(a).add(b).multiplyScalar(.5);temp.quaternion.copy(quat.setFromUnitVectors(up,direction.normalize()));temp.scale.set(.055,length,.055);temp.updateMatrix();links.current.setMatrixAt(i,temp.matrix)
      }
      links.current.instanceMatrix.needsUpdate=true
    }
  })
  const move=(e:ThreeEvent<PointerEvent>)=>{if(!dragging.current)return;e.stopPropagation();target.current.set(Math.min(2.2,Math.max(-2.1,e.point.x)),Math.min(1.25,Math.max(-.75,e.point.y)),0)}
  const down=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();dragging.current=true;setActive(true);(e.target as HTMLElement).setPointerCapture(e.pointerId);document.body.style.cursor='grabbing'}
  const release=()=>{dragging.current=false;setActive(false);document.body.style.cursor=''}
  return <group>
    <instancedMesh ref={links} args={[undefined,undefined,COUNT-1]}><cylinderGeometry args={[1,1,1,12]}/><meshStandardMaterial color="#777a6d" metalness={.72} roughness={.27}/></instancedMesh>
    {REST.map((_,i)=><mesh key={i} ref={(node)=>{beads.current[i]=node}} position={REST[i]} onPointerOver={()=>{if(i===COUNT-1&&!active)document.body.style.cursor='grab'}} onPointerOut={()=>{if(!active)document.body.style.cursor=''}} onPointerDown={i===COUNT-1?down:undefined} onPointerMove={i===COUNT-1?move:undefined} onPointerUp={i===COUNT-1?release:undefined} onPointerCancel={i===COUNT-1?release:undefined}>
      <sphereGeometry args={[i===COUNT-1?.17:.105,24,20]}/><meshStandardMaterial color={i===COUNT-1?'#a4cf5c':i%3===0?'#d4bd83':'#a8b09b'} metalness={.55} roughness={.23}/>
    </mesh>)}
    <mesh position={REST[0]}><torusGeometry args={[.17,.035,12,32]}/><meshStandardMaterial color="#646b5d" metalness={.6}/></mesh>
    <mesh position={[2.35,-.4,0]}><boxGeometry args={[.17,.8,.25]}/><meshStandardMaterial color="#747a6c" metalness={.64} roughness={.3}/></mesh>
  </group>
}
