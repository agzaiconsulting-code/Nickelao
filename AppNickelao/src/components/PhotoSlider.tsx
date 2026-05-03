'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface PhotoSliderProps {
  photos: string[]
}

export function PhotoSlider({ photos }: PhotoSliderProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() => setCurrent(i => (i === 0 ? photos.length - 1 : i - 1)), [photos.length])
  const next = useCallback(() => setCurrent(i => (i === photos.length - 1 ? 0 : i + 1)), [photos.length])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  const btnStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Slider principal */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', background: '#ccc' }}>
        <Image
          key={current}
          src={photos[current]}
          alt={`Foto ${current + 1} de ${photos.length}`}
          fill
          style={{ objectFit: 'cover', cursor: 'zoom-in' }}
          sizes="(max-width: 768px) 100vw, 550px"
          onClick={() => setLightbox(true)}
        />
        <button onClick={prev} style={{ ...btnStyle, left: 12 }} aria-label="Foto anterior">
          <ChevronLeft />
        </button>
        <button onClick={next} style={{ ...btnStyle, right: 12 }} aria-label="Foto siguiente">
          <ChevronRight />
        </button>
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 100, pointerEvents: 'none' }}>
          {current + 1} / {photos.length}
        </div>
      </div>

      {/* Miniaturas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {photos.map((src, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
              border: `2px solid ${i === current ? '#547832' : 'transparent'}`,
              opacity: i === current ? 1 : 0.6, padding: 0, cursor: 'pointer', background: 'none',
            }}
          >
            <Image src={src} alt={`Miniatura ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            style={{ position: 'relative', width: '100%', maxWidth: 900, padding: '0 56px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative', aspectRatio: '4/3' }}>
              <Image src={photos[current]} alt={`Foto ${current + 1}`} fill style={{ objectFit: 'contain' }} sizes="90vw" />
            </div>
            <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft />
            </button>
            <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight />
            </button>
            <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 }}>
              Cerrar ✕
            </button>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }}>
              {current + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
