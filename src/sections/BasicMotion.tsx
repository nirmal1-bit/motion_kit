import { useState } from 'react'

export function BasicMotion() {
  const [active, setActive] = useState(0)
  return <div className="basic-motion-demo">
    <div className="basic-motion-top"><span>CSS INTERACTION STUDY</span><span>HOVER · PRESS · SELECT</span></div>
    <div className="basic-motion-cards">{['Hover', 'Press', 'Select'].map((label, index) => <button key={label} className={`basic-motion-card basic-motion-card-${index + 1} ${active === index ? 'is-active' : ''}`} onClick={() => setActive(index)}><span>STATE / 0{index + 1}</span><i>✳</i><strong>{label}</strong><small>{index === 0 ? 'Move over the card' : index === 1 ? 'Press and hold' : 'Choose this state'}</small></button>)}</div>
    <div className="basic-motion-bottom"><span>NO LIBRARY REQUIRED</span><span>CLICK A CARD TO SELECT ↗</span></div>
  </div>
}
