import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

const targets = [
  { id: 'left', label: 'ORBIT A', x: -.27, y: -.13, symbol: '○' },
  { id: 'top', label: 'ORBIT B', x: .02, y: -.28, symbol: '✳' },
  { id: 'right', label: 'ORBIT C', x: .28, y: -.08, symbol: '◇' },
]

export function DraggableMomentum() {
  const bounds = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-260, 260], [-24, 24])
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState('center')
  const [dragging, setDragging] = useState(false)

  const settle = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragging(false)
    const rect = bounds.current?.getBoundingClientRect()
    if (!rect) return
    const candidates = [
      { id: 'left', x: -rect.width * .25, y: -rect.height * .12 },
      { id: 'top', x: rect.width * .02, y: -rect.height * .27 },
      { id: 'right', x: rect.width * .25, y: -rect.height * .08 },
      { id: 'center', x: 0, y: 0 },
    ]
    const nearest = candidates.reduce<{ id: string; x: number; y: number; distance: number }>((best, target) => {
      const distance = Math.hypot(x.get() - target.x, y.get() - target.y)
      return distance < best.distance ? { ...target, distance } : best
    }, { ...candidates[0], distance: Infinity })
    setActive(nearest.id)
    const speed = reduceMotion ? 0 : .16
    animate(x, nearest.x, { type: 'spring', stiffness: 170, damping: 19, velocity: info.velocity.x * speed })
    animate(y, nearest.y, { type: 'spring', stiffness: 170, damping: 19, velocity: info.velocity.y * speed })
  }

  const moveWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 70 : 28
    let dx = 0
    let dy = 0
    if (event.key === 'ArrowLeft') dx = -step
    if (event.key === 'ArrowRight') dx = step
    if (event.key === 'ArrowUp') dy = -step
    if (event.key === 'ArrowDown') dy = step
    if (event.key === 'Home' || event.key === 'Escape') { dx = -x.get(); dy = -y.get() }
    if (dx || dy) {
      event.preventDefault()
      setActive('moving')
      animate(x, Math.max(-260, Math.min(260, x.get() + dx)), { type: 'spring', stiffness: 190, damping: 20 })
      animate(y, Math.max(-180, Math.min(180, y.get() + dy)), { type: 'spring', stiffness: 190, damping: 20 })
    }
  }

  return <section className="momentum-demo">
    <div className="momentum-heading"><span>DIRECT MANIPULATION / 01</span><span>DRAG · RELEASE · SETTLE</span></div>
    <div className="momentum-copy"><h2>Give it a little<br/><em>momentum.</em></h2><p>Drag the object and let go. Its release speed carries it toward the nearest resting point.</p></div>
    <div className="momentum-field" ref={bounds}>
      <div className="momentum-grid"/>
      {targets.map((target) => <div key={target.id} className={`momentum-target target-${target.id} ${active === target.id ? 'target-active' : ''}`}><span>{target.symbol}</span><small>{target.label}</small></div>)}
      <motion.div className={`momentum-object ${dragging ? 'is-dragging' : ''}`} drag dragConstraints={bounds} dragElastic={.16} dragMomentum={false} style={{ x, y, rotate }} whileTap={{ scale: .95 }} onDragStart={() => { setDragging(true); setActive('moving') }} onDragEnd={settle} onKeyDown={moveWithKeyboard} role="button" tabIndex={0} aria-label="Draggable object. Use arrow keys to move, Home or Escape to reset." aria-grabbed={dragging}>
        <div className="momentum-object-core"><i/><i/><b>m.</b></div><span className="momentum-object-label">{dragging ? 'IN MOTION' : 'DRAG ME'}</span>
      </motion.div>
    </div>
    <div className="momentum-footer"><span>RELEASE VELOCITY → SPRING SETTLE</span><span>KEYBOARD: ARROWS · RESET: HOME</span></div>
  </section>
}
