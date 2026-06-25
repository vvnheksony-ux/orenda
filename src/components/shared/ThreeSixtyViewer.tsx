'use client'

import dynamic from 'next/dynamic'
import { Suspense, useRef, useEffect, useCallback, useState, useMemo } from 'react'

const ReactPhotoSphereViewer = dynamic(
  () => import('react-photo-sphere-viewer').then((mod) => mod.ReactPhotoSphereViewer),
  { ssr: false }
)

export interface ViewerHotspot {
  pitch: number
  yaw: number
  label?: string
  targetSceneNumber?: number | null
}

interface ThreeSixtyViewerProps {
  src: string
  height?: string
  width?: string
  interactive?: boolean
  onPositionChange?: (lat: number, lng: number, viewer: unknown) => void
  onReady?: (viewer: unknown) => void
  // Navigation pins to render on the panorama.
  hotspots?: ViewerHotspot[]
  // Fired when a pin is clicked (front-end navigation).
  onHotspotClick?: (targetSceneNumber: number | null, index: number) => void
  // Fired when an empty spot on the panorama is clicked — lets the admin editor
  // place a new pin at that pitch/yaw (in degrees). A click (tap) never pans, so
  // this does not conflict with drag-to-rotate.
  onPanoramaClick?: (pitch: number, yaw: number) => void
  // Render markers even with no hotspots yet (admin editor needs the plugin loaded).
  enableMarkers?: boolean
  // Show each pin's number inside the dot (admin editor, to match the pin list).
  numbered?: boolean
}

interface PSVViewer {
  rotate: (opts: { yaw: number; pitch: number }) => void
  getPosition: () => { yaw: number; pitch: number }
  getPlugin: (plugin: unknown) => any
  addEventListener: (event: string, cb: (e: any) => void) => void
  removeEventListener: (event: string, cb: (e: any) => void) => void
  dataHelper?: { viewerCoordsToSphericalCoords: (p: { x: number; y: number }) => { yaw: number; pitch: number } | null }
}

const toDeg = (rad: number) => (rad * 180) / Math.PI

export default function ThreeSixtyViewer({
  src,
  height = '100%',
  width = '100%',
  interactive = true,
  onPositionChange,
  onReady,
  hotspots,
  onHotspotClick,
  onPanoramaClick,
  enableMarkers = false,
  numbered = false,
}: ThreeSixtyViewerProps) {
  const viewerRef = useRef<PSVViewer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Keep latest callbacks/hotspots without re-creating the viewer.
  const hotspotsRef = useRef(hotspots)
  const onHotspotClickRef = useRef(onHotspotClick)
  const onPanoramaClickRef = useRef(onPanoramaClick)
  const numberedRef = useRef(numbered)
  // Feed the viewer a STABLE initial src and handle later src changes ourselves
  // with a cross-fade — the library otherwise swaps with a hidden loader → white flash.
  const initialSrcRef = useRef(src)
  const lastSrcRef = useRef(src)
  hotspotsRef.current = hotspots
  onHotspotClickRef.current = onHotspotClick
  onPanoramaClickRef.current = onPanoramaClick
  numberedRef.current = numbered

  // The markers plugin touches the DOM, so load it only on the client.
  const [markersPlugin, setMarkersPlugin] = useState<unknown>(null)
  const markersMode = Boolean((hotspots && hotspots.length > 0) || onPanoramaClick || enableMarkers)

  useEffect(() => {
    if (!markersMode) return
    let active = true
    import('@photo-sphere-viewer/markers-plugin').then((m) => {
      if (active) setMarkersPlugin(() => m.MarkersPlugin)
    })
    // Marker styling/CSS side-effect.
    import('@photo-sphere-viewer/markers-plugin/index.css').catch(() => {})
    return () => {
      active = false
    }
  }, [markersMode])

  const buildMarkers = useCallback(() => {
    const list = hotspotsRef.current ?? []
    const numbered = numberedRef.current
    return list.map((h, index) => ({
      id: `hotspot-${index}`,
      position: { yaw: `${h.yaw}deg`, pitch: `${h.pitch}deg` },
      html: numbered
        ? `<div class="tour-pin" role="button"><span class="tour-pin__num">${index + 1}</span></div>`
        : `<div class="tour-pin" role="button" aria-label="${(h.label ?? 'Go to room').replace(/"/g, '')}">${h.label ? `<span class="tour-pin__label">${h.label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>` : ''}<span class="tour-pin__dot"></span></div>`,
      size: numbered ? { width: 48, height: 48 } : { width: 44, height: 44 },
      anchor: 'center center',
      // Public pins show the name permanently (label above the dot); only the
      // numbered admin pins keep the hover tooltip.
      tooltip: numbered ? (h.label || undefined) : undefined,
      data: { targetSceneNumber: h.targetSceneNumber ?? null, index },
    }))
  }, [])

  // Keep the `plugins` prop a STABLE reference. The library re-creates the entire
  // viewer (a fresh panorama load → white flash) whenever the plugins array identity
  // changes. Markers are updated imperatively via setMarkers (effect below), so this
  // only needs to change when the plugin module actually finishes loading.
  const pluginsConfig = useMemo(
    () => (markersMode && markersPlugin ? ([[markersPlugin, { markers: buildMarkers() }]] as any) : undefined),
    [markersMode, markersPlugin, buildMarkers],
  )

  const handleReady = useCallback(
    (viewer: unknown) => {
      const v = viewer as PSVViewer
      viewerRef.current = v
      onReady?.(viewer)

      if (markersMode && markersPlugin) {
        try {
          const mp = v.getPlugin(markersPlugin)
          if (mp) {
            mp.setMarkers(buildMarkers())
            mp.addEventListener('select-marker', (e: any) => {
              const data = e?.marker?.config?.data ?? e?.marker?.data
              if (data) onHotspotClickRef.current?.(data.targetSceneNumber ?? null, data.index ?? 0)
            })
          }
        } catch {
          /* plugin not ready — markers simply won't render */
        }
      }

      // Click-to-place support for the admin editor. A tap (no drag) fires this;
      // ignore clicks that landed on an existing marker.
      v.addEventListener('click', (e: any) => {
        if (!onPanoramaClickRef.current) return
        if (e?.data?.marker) return
        const { yaw, pitch } = e?.data ?? {}
        if (typeof yaw === 'number' && typeof pitch === 'number') {
          onPanoramaClickRef.current(toDeg(pitch), toDeg(yaw))
        }
      })
    },
    [onReady, markersMode, markersPlugin, buildMarkers]
  )

  // Refresh markers when the hotspot list changes (e.g. editor adds a pin).
  useEffect(() => {
    const v = viewerRef.current
    if (!v || !markersMode || !markersPlugin) return
    try {
      const mp = v.getPlugin(markersPlugin)
      mp?.setMarkers(buildMarkers())
    } catch {
      /* noop */
    }
  }, [hotspots, markersMode, markersPlugin, buildMarkers])

  // Cross-fade to a new panorama when src changes (instead of the library's
  // hidden-loader swap that flashes white). Old image stays until the new fades in.
  useEffect(() => {
    if (src === lastSrcRef.current) return
    lastSrcRef.current = src
    const v = viewerRef.current as (PSVViewer & { setPanorama?: (p: string, o?: object) => Promise<unknown> }) | null
    // showLoader:false keeps the current panorama visible during download, then the
    // viewer's default fade swaps it in — so it changes gradually, no white flash.
    try { void v?.setPanorama?.(src, { showLoader: false, transition: { effect: 'fade', duration: 1000 } }) } catch { /* noop */ }
  }, [src])

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

  // In markers mode, wait for the plugin so the viewer is built with it.
  const waitingForPlugin = markersMode && !markersPlugin

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
        .tour-pin {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative;
        }
        .tour-pin__label {
          position: absolute; bottom: calc(50% + 16px); left: 50%; transform: translateX(-50%);
          white-space: nowrap; pointer-events: none;
          background: #b89148; color: #fffaf0;
          border: 1px solid rgba(255,255,255,0.45);
          padding: 3px 11px; border-radius: 9px;
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; line-height: 1.3; letter-spacing: 0.2px;
          box-shadow: 0 3px 12px rgba(59,45,23,0.40);
        }
        .tour-pin__dot {
          width: 18px; height: 18px; border-radius: 9999px;
          background: #b89148; border: 3px solid #fff;
          box-shadow: 0 0 0 4px rgba(184,145,72,0.35);
          animation: tour-pin-pulse 2s ease-out infinite;
        }
        @keyframes tour-pin-pulse {
          0% { box-shadow: 0 0 0 2px rgba(184,145,72,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(184,145,72,0); }
          100% { box-shadow: 0 0 0 2px rgba(184,145,72,0); }
        }
        .tour-pin__num {
          width: 26px; height: 26px; border-radius: 9999px;
          background: #b89148; border: 2px solid #fff; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; line-height: 1;
          box-shadow: 0 0 0 4px rgba(184,145,72,0.30);
        }
      `}</style>
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          Loading...
        </div>
      }>
        {!waitingForPlugin && (
          <ReactPhotoSphereViewer
            src={initialSrcRef.current}
            height={height}
            width={width}
            littlePlanet={false}
            hideNavbarButton={true}
            defaultZoomLvl={0}
            navbar={false}
            plugins={pluginsConfig}
            onPositionChange={onPositionChange}
            onReady={handleReady}
          />
        )}
      </Suspense>
      {!interactive && (
        <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />
      )}
    </div>
  )
}
