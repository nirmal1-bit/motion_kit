import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'

export type StackItem = { label: string; title: string; description: string; color: string; index?: string }

export function SwipeStack({ items }: { items: StackItem[] }) {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const x = useSpring(0, { stiffness: 320, damping: 28 })
  const rotate = useTransform(x, [-220, 220], [-10, 10])
  const next = () => { setActive((value) => (value + 1) % items.length); x.set(0) }
  const item = items[active]

  return <div className="stack-demo">
    <div className="stack-count"><span>DRAG TO EXPLORE</span><span>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></div>
    <div className="stack-stage"><div className="stack-under under-two"/><div className="stack-under under-one"/>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.article key={active} className={`stack-card ${item.color}`} style={{ x, rotate, touchAction: 'pan-y' }} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.75} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) next() }} onClick={next} initial={{ opacity: 0, scale: .94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, x: 250, rotate: 10 }} transition={{ type: 'spring', stiffness: 270, damping: 25 }}>
          <div className="stack-card-header"><span>{item.index ?? `FRAME / ${String(active + 1).padStart(2, '0')}`}</span><span>↗</span></div>
          <div className="stack-card-copy"><span>{item.label}</span><h3>{item.title}</h3><p>{item.description}</p></div>
          <div className="stack-card-footer"><span>CLICK OR SWIPE</span><span>✳</span></div>
        </motion.article>
      </AnimatePresence>
    </div>
    <div className="stack-controls"><span>Interactive card stack · drag gesture</span><button onClick={next}>Next card <b>→</b></button></div>
  </div>
}
