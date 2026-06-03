'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ReactPhotoSphereViewer = dynamic(
  () => import('react-photo-sphere-viewer').then((mod) => mod.ReactPhotoSphereViewer),
  { ssr: false }
)

interface ThreeSixtyViewerProps {
  src: string
  height?: string
  width?: string
  /** Called on every camera move: lat = pitch (vertical), lng = yaw (horizontal) */
  onPositionChange?: (lat: number, lng: number, viewer: unknown) => void
  onReady?: (viewer: unknown) => void
}

export default function ThreeSixtyViewer({
  src,
  height = '100%',
  width = '100%',
  onPositionChange,
  onReady,
}: ThreeSixtyViewerProps) {
  return (
    <div style={{ height, width }} className="relative bg-zinc-900 overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          Loading 360° View...
        </div>
      }>
        <ReactPhotoSphereViewer
          src={src}
          height={height}
          width={width}
          littlePlanet={false}
          hideNavbarButton={true}
          defaultZoomLvl={0}
          navbar={['zoom', 'caption', 'fullscreen']}
          onPositionChange={onPositionChange}
          onReady={onReady}
        />
      </Suspense>
    </div>
  )
}
