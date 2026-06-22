'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

// Shared scroll-reveal motion language for the whole site: a calm fade + short
// slide-up, triggered once when the element enters the viewport. Respects
// prefers-reduced-motion automatically via framer. Tuned to 2025 best practice
// (transform/opacity only, ~0.5s, smooth ease-out, stagger groups by ~0.07s).

const DEFAULT_Y = 18

// Single element: fades + slides up the first time it scrolls into view.
export default function Reveal({
  children,
  delay = 0,
  y = DEFAULT_Y,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// Group container: reveals its <RevealItem> children one-by-one (staggered
// cascade) as the group enters view. Use for rows of cards / stacked blocks.
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  )
}

// One staggered child of a RevealGroup. Inherits the group's hidden/show label.
export function RevealItem({
  children,
  className,
  y = DEFAULT_Y,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}
