import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const chapters = [
  { eyebrow: 'CHAPTER 01 · ORIGIN', title: 'Every place\nhas a first light.', body: 'A story begins with a detail worth looking at twice. Hold the frame long enough for the quiet parts to appear.', theme: 'story-dawn', number: '01' },
  { eyebrow: 'CHAPTER 02 · MOVEMENT', title: 'Then the world\nbegins to shift.', body: 'Follow the line as it travels through the landscape. Let each movement reveal a new layer of the story.', theme: 'story-tide', number: '02' },
  { eyebrow: 'CHAPTER 03 · ARRIVAL', title: 'And finds its\nway forward.', body: 'The journey resolves into a new perspective. The ending becomes another place to begin.', theme: 'story-dusk', number: '03' },
]

export function PinnedStory() {
  const section = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  return <section className="pinned-story" ref={section}>
    <div className="pinned-story-stage">
      <div className="pinned-story-heading"><span>FIELD NOTES / 2025</span><span>A STORY IN THREE PARTS</span></div>
      <div className="story-copy">{chapters.map((chapter, index) => <StoryChapter key={chapter.number} chapter={chapter} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>)}</div>
      <div className="story-art">
        {chapters.map((chapter, index) => <StoryVisual key={chapter.number} chapter={chapter} index={index} progress={scrollYProgress} reduceMotion={reduceMotion}/>) }
      </div>
      <div className="pinned-story-footer"><span>SCROLL TO CONTINUE</span><div><motion.i style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}/></div><span>01 — 03</span></div>
    </div>
  </section>
}

function StoryChapter({ chapter, index, progress, reduceMotion }: { chapter: typeof chapters[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index / chapters.length
  const end = (index + 1) / chapters.length
  const opacity = useTransform(progress, [Math.max(0, start - .12), start, end - .08, end], [0, 1, 1, index === chapters.length - 1 ? 1 : 0])
  const y = useTransform(progress, [start, Math.min(1, start + .12)], [35, 0])
  return <motion.article className="story-chapter" style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}>
    <span>{chapter.eyebrow}</span><h2>{chapter.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h2><p>{chapter.body}</p><b>{chapter.number}</b>
  </motion.article>
}

function StoryVisual({ chapter, index, progress, reduceMotion }: { chapter: typeof chapters[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reduceMotion: boolean }) {
  const start = index / chapters.length
  const opacity = useTransform(progress, [Math.max(0, start - .1), start, start + .27, Math.min(1, start + .4)], [0, 1, 1, index === chapters.length - 1 ? 1 : 0])
  const y = useTransform(progress, [start, Math.min(1, start + .3)], [70, -25])
  return <motion.div className={`story-visual ${chapter.theme}`} style={{ opacity: reduceMotion ? (index === 0 ? 1 : 0) : opacity, y: reduceMotion ? 0 : y }}>
    <div className="story-landscape"><i/><i/><i/><b>{chapter.number}</b></div>
    <span>{chapter.eyebrow}</span>
  </motion.div>
}
