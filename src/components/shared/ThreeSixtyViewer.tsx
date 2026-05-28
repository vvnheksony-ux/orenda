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
}

export default function ThreeSixtyViewer({ src, height = '100%', width = '100%' }: ThreeSixtyViewerProps) {
  return (
    <div style={{ height, width }} className="relative bg-zinc-900 overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white/50">Loading 360° View...</div>}>
        <ReactPhotoSphereViewer
          src={src}
          height={height}
          width={width}
          littlePlanet={false}
          hideNavbarButton={true}
          defaultZoomLvl={0}
          navbar={[
            'zoom',
            'caption',
            'fullscreen',
          ]}
        />
      </Suspense>
    </div>
  )
}
