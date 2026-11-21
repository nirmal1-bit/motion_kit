import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { CSSProperties } from 'react'

const finishes = [
  { id: 'moss', name: 'Moss', color: '#788c5a', metal: '#bd9b68' },
  { id: 'clay', name: 'Clay', color: '#ba7459', metal: '#d5b892' },
  { id: 'ink', name: 'Ink', color: '#3f4d5b', metal: '#a7b8c7' },
]
const details = [
  { id: 'shade', title: 'Hand-spun shade', copy: 'A soft, wide profile directs warm light down onto the page.' },
  { id: 'arm', title: 'Balanced stem', copy: 'A slender, adjustable stem holds the shade in an easy reading position.' },
  { id: 'base', title: 'Weighted base', copy: 'A low, stable base keeps the silhouette grounded on any desk.' },
]

function DeskLamp({ color, metal }: { color: string; metal: string }) {
  return <group position={[0, -.45, 0]}>
    <mesh position={[0, .13, 0]} scale={[.75, .12, .52]} castShadow receiveShadow><cylinderGeometry args={[.72, .85, .22, 64]}/><meshStandardMaterial color={metal} roughness={.28} metalness={.72}/></mesh>
    <mesh position={[0, 1.05, 0]} rotation={[0, 0, -.18]} castShadow><cylinderGeometry args={[.055, .075, 1.8, 32]}/><meshStandardMaterial color={metal} roughness={.25} metalness={.76}/></mesh>
    <mesh position={[0, 1.92, 0]} rotation={[0, 0, Math.PI]} castShadow><cylinderGeometry args={[.34, .78, .62, 64, 1, true]}/><meshStandardMaterial color={color} roughness={.34} metalness={.16} side={2}/></mesh>
    <mesh position={[0, 1.62, 0]} rotation={[0, 0, Math.PI]}><cylinderGeometry args={[.015, .34, .12, 48]}/><meshStandardMaterial color="#f4d89e" emissive="#f5c36f" emissiveIntensity={.65} roughness={.8}/></mesh>
    <mesh position={[0, 1.66, 0]}><sphereGeometry args={[.11, 24, 24]}/><meshStandardMaterial color="#fff0c7" emissive="#ffd98b" emissiveIntensity={1.5}/></mesh>
  </group>
}

export function ProductConfigurator() {
  const [finish, setFinish] = useState(finishes[0])
  const [detail, setDetail] = useState(details[0])
  return <section className="configurator-demo">
    <div className="configurator-top"><span>OBJECT 01 / TASK LAMP</span><span>DRAG TO INSPECT · SELECT A FINISH</span></div>
    <div className="configurator-body">
      <div className="configurator-view">
        <div className="configurator-glow"/>
        <Canvas shadows camera={{ position: [4, 3.1, 5.5], fov: 34 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#e9e9e1']}/><ambientLight intensity={.65}/><hemisphereLight args={['#fff6e8', '#77786e', 1.2]}/><directionalLight position={[2, 6, 4]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]}/><pointLight position={[-2, 2, -1]} intensity={1.5} color="#a8c6ff"/>
          <DeskLamp color={finish.color} metal={finish.metal}/><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.35, 0]} receiveShadow><planeGeometry args={[200, 200]}/><shadowMaterial transparent opacity={.16}/></mesh>
          <OrbitControls enablePan={false} minDistance={4} maxDistance={8} minPolarAngle={.5} maxPolarAngle={1.5}/><Environment preset="studio"/>
        </Canvas>
        {details.map((item, index) => <button key={item.id} className={`config-hotspot hotspot-${item.id} ${detail.id === item.id ? 'selected' : ''}`} onClick={() => setDetail(item)} aria-label={`Inspect ${item.title}`}><span>0{index + 1}</span><i/></button>)}
        <motion.div key={detail.id} className="config-detail-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><span>DETAIL / {detail.id.toUpperCase()}</span><strong>{detail.title}</strong><p>{detail.copy}</p></motion.div>
        <span className="configurator-drag-label">DRAG OBJECT TO ORBIT ↗</span>
      </div>
      <aside className="configurator-options"><span className="configurator-kicker">FORM / FUNCTION</span><h2>Light for<br/><em>the long view.</em></h2><p>A considered desk companion, shaped to make room for focus.</p><div className="config-options-label">FINISH <span>{finish.name.toUpperCase()}</span></div><div className="finish-swatches">{finishes.map((item) => <button key={item.id} className={finish.id === item.id ? 'chosen' : ''} onClick={() => setFinish(item)} aria-label={`Select ${item.name} finish`} style={{ '--swatch': item.color } as CSSProperties}/>)}</div><div className="configurator-spec"><span>HEIGHT <b>42 CM</b></span><span>LIGHT <b>2700 K</b></span><span>DESIGN <b>2025</b></span></div></aside>
    </div>
    <div className="configurator-bottom"><span>MATERIAL STUDY · REAL-TIME 3D</span><span>THREE.JS / REACT THREE FIBER</span></div>
  </section>
}
