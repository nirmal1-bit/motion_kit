import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'

const designs=[['#d7e3bd','#71874c'],['#e5b999','#9b5f49'],['#c5c7d9','#656789'],['#d1b96d','#586b5b'],['#a9c7c8','#42686b'],['#e5d7bc','#926c57'],['#c4d2a1','#506a42'],['#dec1a5','#7b5347']]
const textureCache=new Map<number,CanvasTexture>()
function artwork(index:number){
  const id=index%designs.length,existing=textureCache.get(id);if(existing)return existing
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=720
  const ctx=canvas.getContext('2d')!,[base,accent]=designs[id]
  ctx.fillStyle=base;ctx.fillRect(0,0,512,720)
  const grad=ctx.createLinearGradient(0,0,512,720);grad.addColorStop(0,'#ffffff55');grad.addColorStop(1,'#00000022');ctx.fillStyle=grad;ctx.fillRect(0,0,512,720)
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.beginPath();ctx.arc(256,280,140,0,Math.PI*2);ctx.stroke()
  ctx.fillStyle=accent;ctx.beginPath();ctx.ellipse(256,280,92,132,(id%4)*.4,0,Math.PI*2);ctx.fill()
  ctx.globalAlpha=.62;ctx.fillStyle='#f5eedc';ctx.beginPath();ctx.arc(256,280,55,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1
  ctx.fillStyle=accent;ctx.font='bold 24px monospace';ctx.fillText(`STUDY / 0${id+1}`,34,52)
  ctx.font='italic 54px Georgia';ctx.fillText(['Stillness','Contour','Motion','Material','Quiet','Object','Surface','Light'][id],34,570)
  ctx.font='18px monospace';ctx.fillText('FORM IN A CONTINUOUS SPACE',34,620)
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;textureCache.set(id,texture);return texture
}

export function ImageTube(){
  const section=useRef<HTMLElement>(null),reduceMotion=Boolean(useReducedMotion())
  const {scrollYProgress}=useScroll({target:section,offset:['start start','end end']})
  return <section ref={section} className="tube-scroll"><div className="tube-stage">
    <Canvas camera={{position:[0,0,0],fov:63,near:.1,far:40}} dpr={[1,1.5]} gl={{antialias:true}}>
      <color attach="background" args={['#20221e']}/><ambientLight intensity={1.1}/>
      <Tube progress={scrollYProgress} reduceMotion={reduceMotion}/>
    </Canvas>
    <div className="tube-head"><span>IMAGE SPACE / 01</span><span>SCROLL TO TRAVEL THROUGH THE TUBE ↓</span></div>
    <div className="tube-copy"><span>IMAGE · DEPTH · PASSAGE</span><h2>A gallery<br/><em>without a wall.</em></h2><p>Scroll through a continuous cylinder of image panels, arranged around the camera in a deep 3D space.</p></div>
    <div className="tube-counter"><span>SCROLL PROGRESS</span><motion.i style={{scaleY:reduceMotion?1:scrollYProgress,transformOrigin:'top'}}/></div>
    <div className="tube-foot"><span>PROCEDURAL ART · 3D IMAGE TUBE</span><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function Tube({progress,reduceMotion}:{progress:MotionValue<number>;reduceMotion:boolean}){
  const world=useRef<Group>(null);const {camera}=useThree()
  useFrame(()=>{
    const p=reduceMotion ? .5 : progress.get()
    camera.position.set(0,0,1.2-p*11.8)
    camera.lookAt(0,0,camera.position.z-1)
    if(world.current)world.current.rotation.z=Math.sin(p*Math.PI*2)*.025
  })
  return <group ref={world}>
    {Array.from({length:5},(_,ring)=>Array.from({length:8},(_,panel)=>{
      const angle=panel*Math.PI/4+(ring%2)*Math.PI/8,radius=2.4,y=radius*Math.sin(angle),x=radius*Math.cos(angle),z=-ring*3.1
      return <group key={`${ring}-${panel}`} position={[x,y,z]} rotation={[0,0,angle]}>
        <mesh rotation={[0,Math.PI/2,0]}>
          <planeGeometry args={[1.48,2.35]}/><meshBasicMaterial map={artwork(ring*8+panel)} toneMapped={false} side={2}/>
        </mesh>
        <mesh rotation={[0,Math.PI/2,0]} position={[0,0,-.018]}><planeGeometry args={[1.53,2.4]}/><meshBasicMaterial color="#f4ead3" wireframe transparent opacity={.13}/></mesh>
      </group>
    }))}
  </group>
}
