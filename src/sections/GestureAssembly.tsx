import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'

const pieces=[
  {id:'base',name:'Weighted base',start:[-.8,-.1,0] as [number,number,number],goal:[.2,-.85,0] as [number,number,number],color:'#777d72'},
  {id:'stem',name:'Support stem',start:[2,1,0] as [number,number,number],goal:[.2,-.12,0] as [number,number,number],color:'#c4a66b'},
  {id:'arm',name:'Articulated arm',start:[2,-.8,0] as [number,number,number],goal:[.68,.52,0] as [number,number,number],color:'#777d72'},
  {id:'shade',name:'Lamp shade',start:[-.7,1.15,0] as [number,number,number],goal:[1.23,.43,0] as [number,number,number],color:'#d3c7a7'},
]

export function GestureAssembly(){
  const [snapped,setSnapped]=useState<string[]>([])
  const onSnap=(id:string)=>setSnapped(current=>current.includes(id)?current:[...current,id])
  return <section className="gesture-assembly-stage">
    <Canvas camera={{position:[0,0,5.2],fov:40}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#e5e9df']}/><ambientLight intensity={.72}/><hemisphereLight args={['#f8f2dc','#536050',1.25]}/><directionalLight position={[-3,4,5]} intensity={3.3} color="#fff7dd"/><pointLight position={[2,-1,3]} intensity={12} color="#b5e768" distance={8}/>
      {pieces.map(piece=><Target key={piece.id} position={piece.goal} ready={snapped.includes(piece.id)}/>)}
      {pieces.map(piece=><LampPiece key={piece.id} piece={piece} snapped={snapped.includes(piece.id)} onSnap={onSnap}/>)}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.35,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#d3dacb" roughness={.9}/></mesh>
    </Canvas>
    <div className="assembly-gesture-head"><span>PRODUCT STUDY / 02</span><span>DRAG EACH PART TO ITS OUTLINE</span></div>
    <div className="assembly-gesture-copy"><span>PLACE · ALIGN · SNAP</span><h2>Put it<br/><em>together.</em></h2><p>Drag each lamp component into its outline. Close alignment pulls it into the final position.</p></div>
    <div className="assembly-checklist">{pieces.map((piece,i)=><span key={piece.id} className={snapped.includes(piece.id)?'done':''}><b>0{i+1}</b>{piece.name}<i>{snapped.includes(piece.id)?'✓':'○'}</i></span>)}</div>
    <div className="assembly-gesture-status">{snapped.length===pieces.length?'ASSEMBLY COMPLETE · READY TO USE':`${snapped.length} / ${pieces.length} PARTS PLACED`}</div>
  </section>
}

function Target({position,ready}:{position:[number,number,number];ready:boolean}){
  return <group position={position}>
    <mesh><torusGeometry args={[.2,.012,8,40]}/><meshBasicMaterial color={ready?'#8aa65a':'#9ca58d'} transparent opacity={ready ? .8 : .4}/></mesh>
    {!ready&&<mesh><sphereGeometry args={[.055,12,12]}/><meshBasicMaterial color="#9ca58d" transparent opacity={.35}/></mesh>}
  </group>
}

function LampPiece({piece,snapped,onSnap}:{piece:typeof pieces[number];snapped:boolean;onSnap:(id:string)=>void}){
  const group=useRef<Group>(null),position=new Vector3(...piece.start),goal=new Vector3(...piece.goal)
  const target=useRef(position.clone()),dragging=useRef(false)
  useFrame((_,delta)=>{
    if(!group.current)return
    if(snapped)target.current.copy(goal)
    group.current.position.x=MathUtils.damp(group.current.position.x,target.current.x,dragging.current?16:10,delta)
    group.current.position.y=MathUtils.damp(group.current.position.y,target.current.y,dragging.current?16:10,delta)
    group.current.position.z=MathUtils.damp(group.current.position.z,target.current.z,12,delta)
    group.current.rotation.z=MathUtils.damp(group.current.rotation.z,dragging.current?-.08:0,6,delta)
  })
  const down=(e:ThreeEvent<PointerEvent>)=>{if(snapped)return;e.stopPropagation();dragging.current=true;(e.target as HTMLElement).setPointerCapture(e.pointerId);document.body.style.cursor='grabbing'}
  const move=(e:ThreeEvent<PointerEvent>)=>{if(!dragging.current)return;e.stopPropagation();target.current.set(MathUtils.clamp(e.point.x,-1.4,2.1),MathUtils.clamp(e.point.y,-1.05,1.45),piece.goal[2])}
  const up=()=>{if(!dragging.current)return;dragging.current=false;document.body.style.cursor='';if(target.current.distanceTo(goal)<.36){target.current.copy(goal);onSnap(piece.id)}}
  const color=piece.color
  return <group ref={group} position={piece.start} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerOver={()=>{if(!snapped)document.body.style.cursor='grab'}} onPointerOut={()=>{if(!dragging.current)document.body.style.cursor=''}}>
    {piece.id==='base'&&<><mesh><cylinderGeometry args={[.38,.43,.18,48]}/><meshStandardMaterial color={color} metalness={.65} roughness={.32}/></mesh><mesh position={[0,.1,0]}><cylinderGeometry args={[.11,.11,.12,24]}/><meshStandardMaterial color="#d0b679" metalness={.7} roughness={.24}/></mesh></>}
    {piece.id==='stem'&&<mesh><cylinderGeometry args={[.055,.07,.8,24]}/><meshStandardMaterial color={color} metalness={.78} roughness={.25}/></mesh>}
    {piece.id==='arm'&&<><mesh rotation={[0,0,-Math.PI/4]}><cylinderGeometry args={[.045,.05,.95,20]}/><meshStandardMaterial color={color} metalness={.76} roughness={.26}/></mesh><mesh position={[-.25,-.25,.01]}><sphereGeometry args={[.09,16,16]}/><meshStandardMaterial color="#c6a767" metalness={.78} roughness={.2}/></mesh></>}
    {piece.id==='shade'&&<><mesh rotation={[0,0,Math.PI]}><coneGeometry args={[.4,.42,48,1,true]}/><meshStandardMaterial color={color} metalness={.22} roughness={.34} side={2}/></mesh><mesh position={[0,-.21,0]}><torusGeometry args={[.39,.022,10,48]}/><meshStandardMaterial color="#c6a767" metalness={.78} roughness={.2}/></mesh></>}
  </group>
}
