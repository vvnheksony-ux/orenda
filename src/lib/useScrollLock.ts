import { useEffect } from 'react'

// Shared, reference-counted background-scroll lock for all popups/modals.
// Using a counter means overlapping locks (e.g. mobile drawer + a sign-in
// modal) can't capture each other's locked state and leave the page frozen —
// only the first lock applies and only the last release restores.
let lockCount = 0
let savedScrollY = 0
let savedStyles: Record<string, string> | null = null

function applyLock() {
  savedScrollY = window.scrollY
  const scrollbarW = window.innerWidth - document.documentElement.clientWidth
  const html = document.documentElement
  const body = document.body
  savedStyles = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
  }
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${savedScrollY}px`
  body.style.width = '100%'
  if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
}

function releaseLock() {
  const html = document.documentElement
  const body = document.body
  html.style.overflow = savedStyles?.htmlOverflow ?? ''
  body.style.overflow = savedStyles?.bodyOverflow ?? ''
  body.style.position = savedStyles?.bodyPosition ?? ''
  body.style.top = savedStyles?.bodyTop ?? ''
  body.style.width = savedStyles?.bodyWidth ?? ''
  body.style.paddingRight = savedStyles?.bodyPaddingRight ?? ''
  savedStyles = null
  window.scrollTo(0, savedScrollY)
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockCount += 1
    if (lockCount === 1) applyLock()
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) releaseLock()
    }
  }, [active])
}
