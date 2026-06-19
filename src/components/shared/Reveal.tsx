'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Reusable scroll-reveal: fades + slides content up the first time it enters
// the viewport. Wrap any section/element. Respects reduced-motion via framer.
export default function Reveal({
  children,
  delay = 0,
  y = 28,
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
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
