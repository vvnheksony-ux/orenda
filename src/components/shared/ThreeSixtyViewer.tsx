'use client'

import dynamic from 'next/dynamic'
import { Suspense, useRef, useEffect, useCallback } from 'react'

const ReactPhotoSphereViewer = dynamic(
  () => import('react-photo-sphere-viewer').then((mod) => mod.ReactPhotoSphereViewer),
  { ssr: false }
)

interface ThreeSixtyViewerProps {
  src: string
  height?: string
  width?: string
  interactive?: boolean
  onPositionChange?: (lat: number, lng: number, viewer: unknown) => void
  onReady?: (viewer: unknown) => void
}

interface PSVViewer {
  rotate: (opts: { yaw: number; pitch: number }) => void
  getPosition: () => { yaw: number; pitch: number }
}

export default function ThreeSixtyViewer({
  src,
  height = '100%',
  width = '100%',
  interactive = true,
  onPositionChange,
  onReady,
}: ThreeSixtyViewerProps) {
  const viewerRef = useRef<PSVViewer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleReady = useCallback((viewer: unknown) => {
    viewerRef.current = viewer as PSVViewer
    onReady?.(viewer)
  }, [onReady])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      const viewer = viewerRef.current
      if (!viewer) return
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      if (absX > absY && absX > 2) {
        e.preventDefault()
        e.stopPropagation()
        const pos = viewer.getPosition()
        viewer.rotate({ yaw: pos.yaw + e.deltaX * 0.003, pitch: pos.pitch })
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div ref={containerRef} style={{ height, width }} className="relative bg-zinc-900 overflow-hidden psv-clean">
      <style>{`
        .psv-clean .psv-navbar,
        .psv-clean .psv-caption,
        .psv-clean .psv-zoom-range,
        .psv-clean .psv-button,
        .psv-clean .psv-loader,
        .psv-clean .psv-loader__text {
          display: none !important;
        }
      `}</style>
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          Loading...
        </div>
      }>
        <ReactPhotoSphereViewer
          src={src}
          height={height}
          width={width}
          littlePlanet={false}
          hideNavbarButton={true}
          defaultZoomLvl={0}
          navbar={false}
          onPositionChange={onPositionChange}
          onReady={handleReady}
        />
      </Suspense>
      {!interactive && (
        <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />
      )}
    </div>
  )
}
