import { useEffect } from 'react'

// Locks background scroll (html + body) while `active` is true, and restores
// the previous scroll position when released. Uses position:fixed so the
// background can't move even on mobile. Shared by all app popups/modals.
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const scrollY = window.scrollY
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    const htmlEl = document.documentElement
    const bodyEl = document.body
    const prev = {
      htmlOverflow: htmlEl.style.overflow,
      bodyOverflow: bodyEl.style.overflow,
      bodyPosition: bodyEl.style.position,
      bodyTop: bodyEl.style.top,
      bodyWidth: bodyEl.style.width,
      bodyPaddingRight: bodyEl.style.paddingRight,
    }
    htmlEl.style.overflow = 'hidden'
    bodyEl.style.overflow = 'hidden'
    bodyEl.style.position = 'fixed'
    bodyEl.style.top = `-${scrollY}px`
    bodyEl.style.width = '100%'
    if (scrollbarW > 0) bodyEl.style.paddingRight = `${scrollbarW}px`
    return () => {
      htmlEl.style.overflow = prev.htmlOverflow
      bodyEl.style.overflow = prev.bodyOverflow
      bodyEl.style.position = prev.bodyPosition
      bodyEl.style.top = prev.bodyTop
      bodyEl.style.width = prev.bodyWidth
      bodyEl.style.paddingRight = prev.bodyPaddingRight
      window.scrollTo(0, scrollY)
    }
  }, [active])
}
