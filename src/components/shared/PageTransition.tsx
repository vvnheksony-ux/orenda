'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

// Gentle fade-in of the page's main content on every route change. Keyed by
// pathname so it re-runs on navigation. Wraps only the page body (not the
// navbar/footer), and respects prefers-reduced-motion.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
    >
      {children}
    </motion.div>
  )
}
