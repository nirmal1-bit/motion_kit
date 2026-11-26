import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Color, Group, MathUtils, MeshPhysicalMaterial, Vector2 } from 'three'

const finishes=[
  {id:'silver',name:'Brushed aluminium',color:'#aeb7b7',metalness:.82,roughness:.26,swatch:'#aeb7b7'},
  {id:'ceramic',name:'Midnight ceramic',color:'#304959',metalness:.18,roughness:.19,swatch:'#304959'},
  {id:'brass',name:'Satin brass',color:'#b99758',metalness:.76,roughness:.3,swatch:'#b99758'},
] as const

export function MaterialContinuity(){
  const [selected,setSelected]=useState(0),reduceMotion=Boolean(useReducedMotion())
  return <section className="finish-stage">
    <Canvas camera={{position:[0,.25,5.4],fov:36}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#1d2422']}/><ambientLight intensity={.68}/><hemisphereLight args={['#fff1d8','#29342f',1.15]}/><directionalLight position={[-3,4,5]} intensity={3.5} color="#fff0d4"/><pointLight position={[3,1,2]} intensity={14} color="#8fc9bb" distance={9}/><pointLight position={[-3,-1,2]} intensity={9} color="#dfb46d" distance={8}/>
      <Product finish={selected} reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.25,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#222a26" roughness={.9}/></mesh>
    </Canvas>
    <div className="finish-head"><span>MATERIAL STUDY / 01</span><span>SELECT A FINISH · SURFACE RESPONSE BLENDS IN PLACE</span></div>
    <div className="finish-copy"><span>COLOR · METALNESS · ROUGHNESS</span><h2>Same form.<br/><em>New material.</em></h2><p>Choose a finish. The surface properties blend smoothly while the product, lighting, and reflections stay in place.</p></div>
    <div className="finish-picker" role="group" aria-label="Choose product finish">{finishes.map((finish,index)=><button key={finish.id} className={selected===index?'active':''} onClick={()=>setSelected(index)} aria-pressed={selected===index}><i style={{background:finish.swatch}}/><span>{finish.name}</span><b>{selected===index?'SELECTED':'VIEW FINISH'}</b></button>)}</div>
    <div className="finish-foot"><span>LIVE MATERIAL BLEND · FIXED LIGHT RIG</span><span>SELECT ANY FINISH</span></div>
  </section>
}

function Product({finish,reduceMotion}:{finish:number;reduceMotion:boolean}){
  const group=useRef<Group>(null),surface=useRef<MeshPhysicalMaterial>(null)
  const current=useRef<{color:Color;metalness:number;roughness:number}>({color:new Color(finishes[0].color),metalness:finishes[0].metalness,roughness:finishes[0].roughness})
  useFrame(({clock},delta)=>{
    const goal=finishes[finish],factor=reduceMotion?1:1-Math.exp(-delta*3.4)
    current.current.color.lerp(new Color(goal.color),factor)
    current.current.metalness=MathUtils.lerp(current.current.metalness,goal.metalness,factor)
    current.current.roughness=MathUtils.lerp(current.current.roughness,goal.roughness,factor)
    if(surface.current){surface.current.color.copy(current.current.color);surface.current.metalness=current.current.metalness;surface.current.roughness=current.current.roughness}
    if(group.current)group.current.rotation.y=reduceMotion?-.15:Math.sin(clock.elapsedTime*.28)*.13-.15
  })
  const profile=[[0,-.92],[.34,-.92],[.49,-.82],[.52,-.35],[.48,.05],[.37,.36],[.24,.52],[.22,.86],[0,.9]].map(([x,y])=>new Vector2(x,y))
  return <group ref={group} position={[1.1,0,0]}>
    <mesh castShadow receiveShadow><latheGeometry args={[profile,96]}/><meshPhysicalMaterial ref={surface} color={finishes[0].color} metalness={finishes[0].metalness} roughness={finishes[0].roughness} clearcoat={.55} clearcoatRoughness={.2}/></mesh>
    <mesh position={[0,-.87,0]}><torusGeometry args={[.42,.045,16,64]}/><meshStandardMaterial color="#282e2b" metalness={.7} roughness={.28}/></mesh>
    <mesh position={[0,.9,0]}><torusGeometry args={[.22,.03,12,48]}/><meshStandardMaterial color="#d4c39c" metalness={.78} roughness={.22}/></mesh>
    <mesh position={[0,.18,.49]}><planeGeometry args={[.53,.28]}/><meshStandardMaterial color="#eee5ce" roughness={.72}/></mesh>
  </group>
}
