import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry, DoubleSide, MathUtils, Mesh, MeshStandardMaterial, Vector2 } from 'three'

const GRID = 36

export function ClothDrape() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  return <section ref={section} className="cloth-scroll"><div className="cloth-stage">
    <Canvas camera={{ position: [0, .5, 6], fov: 37 }} dpr={[1,1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#1a211e']}/><fog attach="fog" args={['#1a211e',9,18]}/>
      <ambientLight intensity={.7}/><hemisphereLight args={['#fff0d5','#26302a',1.2]}/><directionalLight position={[-3,5,5]} intensity={3.2} color="#fff1d9"/><pointLight position={[2,1,2]} intensity={8} color="#c9a66d" distance={9}/>
      <Vase reveal={scrollYProgress} reduceMotion={reduceMotion}/><Fabric progress={scrollYProgress} reduceMotion={reduceMotion}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.25,0]}><planeGeometry args={[100,100]}/><meshStandardMaterial color="#252b25" roughness={.9}/></mesh>
    </Canvas>
    <div className="cloth-head"><span>TEXTILE STUDY / 01</span><span>SCROLL TO DRAPE · KEEP GOING TO REVEAL ↓</span></div>
    <div className="cloth-copy"><span>WEIGHT · FOLD · REVEAL</span><h2>Softness<br/><em>in motion.</em></h2><p>A linen sheet falls over a sculptural vessel, gathers into folds, then lifts away to reveal the form beneath.</p></div>
    <div className="cloth-steps"><span>01 / FALL</span><span>02 / DRAPE</span><span>03 / REVEAL</span></div>
    <div className="cloth-foot"><span>FABRIC · GRAVITY · REVEAL</span><div><motion.i style={{scaleX:reduceMotion?1:scrollYProgress,transformOrigin:'left'}}/></div><span>KEEP SCROLLING ↓</span></div>
  </div></section>
}

function Fabric({ progress, reduceMotion }: { progress: MotionValue<number>; reduceMotion: boolean }) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array((GRID+1)*(GRID+1)*3)
    const indices: number[]=[]
    for(let row=0;row<=GRID;row++) for(let col=0;col<=GRID;col++) {
      const i=row*(GRID+1)+col
      const x=col/GRID*2.6-1.3, z=row/GRID*2.2-1.1
      positions[i*3]=x; positions[i*3+1]=1.65; positions[i*3+2]=z
      if(col<GRID&&row<GRID){indices.push(i,i+1,i+GRID+1,i+1,i+GRID+2,i+GRID+1)}
    }
    const geo=new BufferGeometry();geo.setAttribute('position',new BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return geo
  },[])
  useFrame(({clock})=>{
    const p=reduceMotion?1:progress.get()
    const fall=MathUtils.smoothstep(p,.06,.46)
    const lift=MathUtils.smoothstep(p,.58,.9)
    const attribute=geometry.getAttribute('position') as BufferAttribute
    for(let row=0;row<=GRID;row++) for(let col=0;col<=GRID;col++){
      const i=row*(GRID+1)+col,x=col/GRID*2.6-1.3,z=row/GRID*2.2-1.1
      const radius=Math.sqrt(x*x+z*z)
      const vesselTop=.72-Math.max(0,radius-.34)*1.52
      const folds=(Math.sin(x*13+z*4+clock.elapsedTime*.7)+Math.sin(z*16-x*3-clock.elapsedTime*.45))*.045
      const targetY=Math.max(-1.03,vesselTop+folds)
      const y=MathUtils.lerp(1.65,targetY,fall)
      attribute.setXYZ(i,x+lift*.9,y+lift*2.5+Math.sin(clock.elapsedTime*2+x*3)*lift*.05,z-lift*.55)
    }
    attribute.needsUpdate=true;geometry.computeVertexNormals()
    if(material.current) material.current.opacity=1-lift*.98
  })
  return <mesh ref={mesh} geometry={geometry}>
    <meshStandardMaterial ref={material} color="#d7d0bd" roughness={.94} side={DoubleSide} transparent opacity={1} depthWrite={false}/>
  </mesh>
}

function Vase({reveal,reduceMotion}:{reveal:MotionValue<number>;reduceMotion:boolean}){
  const group=useRef<Mesh>(null)
  const material=useRef<MeshStandardMaterial>(null)
  useFrame(()=>{
    const p=reduceMotion?1:reveal.get()
    const opacity=MathUtils.smoothstep(p,.58,.86)
    if(material.current)material.current.opacity=opacity
    if(group.current)group.current.scale.setScalar(.88+opacity*.12)
  })
  return <mesh ref={group} position={[0,-.2,0]}>
    <latheGeometry args={[[[0,-.95],[.35,-.92],[.52,-.72],[.55,-.25],[.48,.18],[.31,.48],[.22,.68],[.2,.9],[0,.92]].map(([x,y])=>new Vector2(x,y)),64]}/>
    <meshStandardMaterial ref={material} color="#a76f50" roughness={.32} metalness={.08} transparent opacity={0}/>
  </mesh>
}
