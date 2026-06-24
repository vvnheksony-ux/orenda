'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useFormFields, useDocumentInfo } from '@payloadcms/ui'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'

type RoomOption = { id: number; label: string }

// Visual hotspot editor mounted on the TourScenes edit screen.
//
// In a 360° photo, drag = rotate, so dragging a pin would fight the pan. Instead
// we use an "aim & drop" model: the editor spins the photo to centre a fixed
// crosshair on a doorway, then presses a button to drop (or move) a pin there.
// Pin positions come from the viewer's exact centre — no click-coordinate math.
type PSVViewer = { getPosition: () => { yaw: number; pitch: number } }

const toDeg = (rad: number) => (rad * 180) / Math.PI
const round = (n: number) => Math.round(n * 100) / 100

export default function HotspotEditorField() {
  const { addFieldRow, removeFieldRow, dispatchFields } = useForm()
  const { id: currentDocId } = useDocumentInfo()
  const viewerRef = useRef<PSVViewer | null>(null)

  const thumbId = useFormFields(
    ([fields]) => fields?.thumbnailImage?.value as number | string | undefined,
  )

  // Existing pins, read live from form state so they appear on the photo.
  const hotspots = useFormFields(([fields]) => {
    const rows = ((fields?.hotspots as { rows?: unknown[] } | undefined)?.rows) ?? []
    return rows.map((_, i) => ({
      pitch: Number((fields?.[`hotspots.${i}.pitch`]?.value as number) ?? 0),
      yaw: Number((fields?.[`hotspots.${i}.yaw`]?.value as number) ?? 0),
      label: (fields?.[`hotspots.${i}.label`]?.value as string) ?? '',
      target: (fields?.[`hotspots.${i}.targetScene`]?.value as number | null | undefined) ?? null,
    }))
  })

  // All tour scenes, used to populate each pin's "goes to room" dropdown.
  const [rooms, setRooms] = useState<RoomOption[]>([])
  useEffect(() => {
    let active = true
    fetch('/payload-api/tourScenes?limit=100&depth=0')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        const opts: RoomOption[] = (d?.docs ?? []).map((s: { id: number; sceneNumber?: number; title?: string }) => ({
          id: s.id,
          label: `#${s.sceneNumber ?? '?'} ${s.title ?? ''}`.trim(),
        }))
        setRooms(opts)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!thumbId) {
      setPanoramaUrl(null)
      return
    }
    let active = true
    fetch(`/payload-api/media/${thumbId}?depth=0`)
      .then((r) => r.json())
      .then((doc) => {
        if (active) setPanoramaUrl(doc?.url ?? doc?.thumbnailURL ?? null)
      })
      .catch(() => {
        if (active) setPanoramaUrl(null)
      })
    return () => {
      active = false
    }
  }, [thumbId])

  // The pitch/yaw (in degrees) currently centred under the crosshair.
  const centerPosition = (): { pitch: number; yaw: number } | null => {
    const pos = viewerRef.current?.getPosition()
    if (!pos) return null
    return { pitch: round(toDeg(pos.pitch)), yaw: round(toDeg(pos.yaw)) }
  }

  const addPinAtCenter = () => {
    const pos = centerPosition()
    if (!pos) return
    addFieldRow({
      path: 'hotspots',
      schemaPath: 'tourScenes.hotspots',
      data: { pitch: pos.pitch, yaw: pos.yaw },
    } as Parameters<typeof addFieldRow>[0])
  }

  const addPinAt = (pitch: number, yaw: number) => {
    addFieldRow({
      path: 'hotspots',
      schemaPath: 'tourScenes.hotspots',
      data: { pitch: round(pitch), yaw: round(yaw) },
    } as Parameters<typeof addFieldRow>[0])
  }

  const movePinToCenter = (index: number) => {
    const pos = centerPosition()
    if (!pos) return
    dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.pitch`, value: pos.pitch } as Parameters<typeof dispatchFields>[0])
    dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.yaw`, value: pos.yaw } as Parameters<typeof dispatchFields>[0])
  }

  const deletePin = (index: number) => {
    removeFieldRow({ path: 'hotspots', rowIndex: index } as Parameters<typeof removeFieldRow>[0])
  }

  const setPinRoom = (index: number, sceneId: number | null) => {
    dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.targetScene`, value: sceneId } as Parameters<typeof dispatchFields>[0])
  }

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <label className="field-label">360° Hotspot Editor</label>
      {!panoramaUrl ? (
        <div
          style={{
            padding: 16,
            borderRadius: 6,
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-elevation-500)',
            fontSize: 13,
          }}
        >
          Upload a 360° image in the <strong>Thumbnail Image</strong> field first, then come back here
          to place navigation pins.
        </div>
      ) : (
        <>
          <div style={{ height: 420, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <ThreeSixtyViewer
              src={panoramaUrl}
              hotspots={hotspots}
              enableMarkers
              numbered
              onPanoramaClick={addPinAt}
              onReady={(v) => { viewerRef.current = v as PSVViewer }}
            />
            {/* Fixed centre crosshair — aim it at a doorway, then press a button. */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 40,
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 2px rgba(0,0,0,0.6)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 2px rgba(0,0,0,0.6)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', border: '2px solid #b89148' }} />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <button type="button" className="btn btn--style-primary btn--size-small" onClick={addPinAtCenter}>
              ➕ Add pin at crosshair
            </button>
          </div>

          {hotspots.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hotspots.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--theme-elevation-50)',
                    fontSize: 13,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#b89148',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--theme-elevation-600)', flexShrink: 0 }}>opens room:</span>
                  <select
                    value={h.target ?? ''}
                    onChange={(e) => setPinRoom(i, e.target.value ? Number(e.target.value) : null)}
                    style={{
                      flex: 1,
                      minWidth: 180,
                      height: 34,
                      borderRadius: 6,
                      border: '1px solid var(--theme-elevation-150)',
                      background: 'var(--theme-input-bg)',
                      color: 'var(--theme-text)',
                      padding: '0 8px',
                    }}
                  >
                    <option value="">— choose a room —</option>
                    {rooms
                      .filter((r) => r.id !== currentDocId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                  </select>
                  <button type="button" className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }} onClick={() => movePinToCenter(i)}>
                    Move → crosshair
                  </button>
                  <button type="button" className="btn btn--style-error btn--size-small" style={{ margin: 0 }} onClick={() => deletePin(i)}>
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--theme-elevation-500)' }}>
            Spin the photo to aim the crosshair (✛) at a doorway, then click{' '}
            <strong>Add pin at crosshair</strong>. Each numbered pin matches the list below — just
            choose which room it opens. Add another pin for another room. (You can also tap directly
            on the photo to drop a pin.)
          </p>
        </>
      )}
    </div>
  )
}
