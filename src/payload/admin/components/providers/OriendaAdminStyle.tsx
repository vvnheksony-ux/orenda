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
        /* Hide Payload's default NavHamburger (replaced by custom right-edge pill) */
        .nav-toggler { display: none !important; }
        /* Remove all breadcrumbs across the admin panel (bong kaneka request). */
        .step-nav,
        nav.step-nav,
        .doc-header__breadcrumbs { display: none !important; }
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
        .upload--has-many__draggable-rows {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          align-items: flex-start !important;
          gap: 1rem !important;
          margin-bottom: 1rem !important;
        }
        .upload--has-many__dragItem {
          position: relative !important;
          width: fit-content !important;
        }
        .upload--has-many__dragItem .icon--drag-handle {
          position: absolute !important;
          top: 50% !important;
          right: -1.75rem !important;
          z-index: 3 !important;
          transform: translateY(-50%) !important;
          color: #8c8982 !important;
          background: rgba(255, 255, 255, 0.92) !important;
          border-radius: 999px !important;
          box-shadow: 0 8px 18px rgba(43, 40, 35, 0.16) !important;
        }
        .upload--has-many__dragItem .upload-field-card,
        .upload-field-card {
          position: relative !important;
          align-items: stretch !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
          width: fit-content !important;
          min-width: 0 !important;
        }
        .upload-relationship-details {
          position: relative !important;
          align-items: stretch !important;
          width: fit-content !important;
        }
        .upload-relationship-details__imageAndDetails {
          gap: 0 !important;
          position: relative !important;
        }
        .upload-relationship-details__imageAndDetails .upload-relationship-details__thumbnail.thumbnail {
          max-width: 20rem !important;
          min-width: 20rem !important;
          width: 20rem !important;
          min-height: 20rem !important;
          max-height: 20rem !important;
          height: 20rem !important;
          cursor: pointer !important;
          border-radius: 0.75rem !important;
          background: transparent !important;
          box-shadow: 0 10px 30px rgba(43, 40, 35, 0.12) !important;
        }
        .upload-relationship-details__imageAndDetails .upload-relationship-details__thumbnail.thumbnail img {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          cursor: pointer !important;
        }
        .upload-relationship-details__actions {
          position: absolute !important;
          top: 0.75rem !important;
          right: 0.75rem !important;
          z-index: 2 !important;
          display: flex !important;
          gap: 0.5rem !important;
        }
        .upload-relationship-details__actions .btn {
          margin: 0 !important;
          width: 2.25rem !important;
          height: 2.25rem !important;
          min-width: 2.25rem !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.92) !important;
          color: #2b2823 !important;
          box-shadow: 0 8px 18px rgba(43, 40, 35, 0.22) !important;
          backdrop-filter: blur(8px) !important;
        }
        .upload-relationship-details__actions .btn:hover {
          background: #fff !important;
          color: #b89148 !important;
        }
        .upload-relationship-details__actions .btn__content {
          justify-content: center !important;
        }
        .upload-relationship-details__actions .btn__label {
          display: none !important;
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
