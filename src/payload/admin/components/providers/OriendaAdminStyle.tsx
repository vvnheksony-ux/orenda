'use client'

import { useEffect, useRef, useState } from 'react'

export default function OriendaAdminStyle({ children }: { children: React.ReactNode }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'IMG' &&
        target.closest('.upload-relationship-details__thumbnail')
      ) {
        const src = (target as HTMLImageElement).src
        if (src) {
          imgRef.current = target as HTMLImageElement
          setLightboxSrc(src)
        }
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    if (!lightboxSrc) return
    const close = () => setLightboxSrc(null)
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [lightboxSrc])

  return (
    <>
      <style>{`
        .app-header__account { display: none !important; }
        .app-header__localizer {
          right: calc(var(--gutter-h) + 4px) !important;
        }
        .localizer-button {
          background-color: #c39a43 !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
        }
        .localizer-button__label,
        .localizer-button__current-label {
          color: #fff !important;
        }
        .upload-relationship-details__details {
          display: none !important;
        }
        .upload-relationship-details__imageAndDetails {
          gap: 0 !important;
        }
        .upload-relationship-details__imageAndDetails .upload-relationship-details__thumbnail.thumbnail {
          max-width: 20rem !important;
          min-width: 20rem !important;
          width: 20rem !important;
          min-height: 20rem !important;
          max-height: 20rem !important;
          height: 20rem !important;
          cursor: pointer !important;
        }
        .upload-relationship-details__imageAndDetails .upload-relationship-details__thumbnail.thumbnail img {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          cursor: pointer !important;
        }
        .upload-field-card {
          width: fit-content !important;
          min-width: 20rem !important;
          max-width: 100% !important;
        }
        .collection-edit .render-fields,
        .global-edit .render-fields {
          display: flex !important;
          flex-direction: column !important;
        }
        .collection-edit .render-fields > .field-type.upload,
        .collection-edit .render-fields > .row:has(.field-type.upload),
        .global-edit .render-fields > .field-type.upload,
        .global-edit .render-fields > .row:has(.field-type.upload) {
          order: -1 !important;
        }
        .btn--style-primary {
          --bg-color: #b89148 !important;
          --hover-bg: #a37d3e !important;
          --color: #fff !important;
          --hover-color: #fff !important;
        }
        .orienda-lightbox-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 99999 !important;
          background: rgba(0,0,0,0.85) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: zoom-out !important;
        }
        .orienda-lightbox-overlay img {
          max-width: 90vw !important;
          max-height: 90vh !important;
          object-fit: contain !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 32px rgba(0,0,0,0.5) !important;
        }
      `}</style>
      {lightboxSrc && (
        <div className="orienda-lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="" />
        </div>
      )}
      {children}
    </>
  )
}
