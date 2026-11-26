import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'

const cards=[['#d7e3bd','#71874c','Stillness'],['#e5b999','#9b5f49','Contour'],['#c5c7d9','#656789','Motion'],['#d1b96d','#586b5b','Material'],['#a9c7c8','#42686b','Quiet'],['#e5d7bc','#926c57','Object'],['#c4d2a1','#506a42','Surface'],['#dec1a5','#7b5347','Light']]
function textureFor(index:number){
  const [base,accent,name]=cards[index];const canvas=document.createElement('canvas');canvas.width=520;canvas.height=680;const ctx=canvas.getContext('2d')!
  ctx.fillStyle=base;ctx.fillRect(0,0,520,680);const g=ctx.createLinearGradient(0,0,520,680);g.addColorStop(0,'#ffffff44');g.addColorStop(1,'#0000002a');ctx.fillStyle=g;ctx.fillRect(0,0,520,680)
  ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(260,270,155,0,Math.PI*2);ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.ellipse(260,270,105,142,index*.31,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f3ead7aa';ctx.beginPath();ctx.arc(260,270,65,0,Math.PI*2);ctx.fill()
  ctx.fillStyle=accent;ctx.font='bold 22px monospace';ctx.fillText(`ARCHIVE / 0${index+1}`,32,50);ctx.font='italic 58px Georgia';ctx.fillText(name,32,565);ctx.font='17px monospace';ctx.fillText('FORM STUDY · 2026',32,615)
  const tex=new CanvasTexture(canvas);tex.colorSpace=SRGBColorSpace;return tex
}
const textures=cards.map((_,i)=>textureFor(i))

export function InfiniteCarousel(){
  const target=useRef(0),drag=useRef(false),lastX=useRef(0),[active,setActive]=useState(0)
  const step=(direction:number)=>{target.current+=direction*Math.PI/4;setActive(index=>((index+direction)%cards.length+cards.length)%cards.length)}
  const wheel=(e:React.WheelEvent)=>{e.preventDefault();step(e.deltaY>0?1:-1)}
  return <section className="carousel-stage" onWheel={wheel}>
    <Canvas camera={{position:[0,0,6.4],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#20221e']}/><ambientLight intensity={1.1}/><directionalLight position={[-3,4,5]} intensity={2.5} color="#fff0d4"/>
      <Carousel target={target} drag={drag} lastX={lastX} onStep={step}/>
    </Canvas>
    <div className="carousel-head"><span>IMAGE SPACE / 02</span><span>DRAG · SCROLL · LOOP</span></div>
    <div className="carousel-copy"><span>INFINITE · ORBITAL · INTERACTIVE</span><h2>Keep moving<br/><em>around the work.</em></h2><p>Drag the ring or scroll to travel through an endless loop of image studies.</p></div>
    <div className="carousel-controls"><button onClick={()=>step(-1)} aria-label="Previous image">←</button><span>0{active+1} <i>/ 08</i></span><button onClick={()=>step(1)} aria-label="Next image">→</button></div>
    <div className="carousel-foot"><span>8 IMAGE PANELS · CONTINUOUS LOOP</span><span>DRAG OR SCROLL TO EXPLORE</span></div>
  </section>
}

function Carousel({target,drag,lastX,onStep}:{target:React.RefObject<number>;drag:React.RefObject<boolean>;lastX:React.RefObject<number>;onStep:(n:number)=>void}){
  const root=useRef<Group>(null)
  useFrame((_,delta)=>{if(root.current)root.current.rotation.y+=(target.current-root.current.rotation.y)*(1-Math.exp(-delta*5))})
  const down=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();drag.current=true;lastX.current=e.nativeEvent.clientX;(e.target as HTMLElement).setPointerCapture(e.pointerId);document.body.style.cursor='grabbing'}
  const move=(e:ThreeEvent<PointerEvent>)=>{if(!drag.current)return;e.stopPropagation();const dx=e.nativeEvent.clientX-lastX.current;target.current+=dx*.008;lastX.current=e.nativeEvent.clientX}
  const up=()=>{if(!drag.current)return;drag.current=false;document.body.style.cursor='';onStep(0)}
  return <group ref={root}>
    {cards.map((_,i)=>{const angle=i*Math.PI/4,r=2.55;return <group key={i} position={[Math.sin(angle)*r,0,Math.cos(angle)*r]} rotation={[0,angle,0]}>
      <mesh onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerOver={()=>{if(!drag.current)document.body.style.cursor='grab'}} onPointerOut={()=>{if(!drag.current)document.body.style.cursor=''}}>
        <planeGeometry args={[1.65,2.25]}/><meshBasicMaterial map={textures[i]} side={2}/>
      </mesh>
      <mesh position={[0,0,-.035]}><boxGeometry args={[1.72,2.32,.05]}/><meshStandardMaterial color="#d3c5a7" metalness={.18} roughness={.42}/></mesh>
    </group>})}
  </group>
}
