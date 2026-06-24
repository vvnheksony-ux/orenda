'use client'

import { useEffect } from 'react'

// Single source of truth for how fast every auto-scroll marquee moves.
// Speed is in pixels/second, so all marquees move at the SAME visual speed
// regardless of how wide their content is (duration = distance / speed).
const PX_PER_SEC = 40

/**
 * Mounted once (in SiteLayout). Finds every `.marquee-track` on the page and
 * sets its animation-duration based on its width, so all marquees share one
 * consistent speed. Re-runs when content width changes (ResizeObserver) and
 * when new marquees mount (MutationObserver, rAF-debounced).
 */
export default function MarqueeSpeed() {
  useEffect(() => {
    const setDuration = (el: HTMLElement) => {
      // Tracks hold doubled content and animate by 50%, so distance = half width.
      const distance = el.scrollWidth / 2
      if (distance > 0) el.style.animationDuration = `${(distance / PX_PER_SEC).toFixed(1)}s`
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setDuration(entry.target as HTMLElement)
    })
    const observed = new WeakSet<Element>()

    const scan = () => {
      document.querySelectorAll<HTMLElement>('.marquee-track').forEach((el) => {
        if (!observed.has(el)) { observed.add(el); ro.observe(el) }
        setDuration(el)
      })
    }
    scan()

    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(scan)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf) }
  }, [])

  return null
}
