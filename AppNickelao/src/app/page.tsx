'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

// ── DATA ─────────────────────────────────────────────────────────────────────

const SERVICES: Record<string, { nombre: string; descripcion: string; duracion_min: number; precio_eur: number }[]> = {
  Populares: [
    { nombre: 'Corte tendencia o degradado', descripcion: 'Cortes de cabello tendencia o degradados hasta nº0.5', duracion_min: 30, precio_eur: 13 },
    { nombre: 'Corte de cabello + diseño de barba', descripcion: 'Corte de cabello y diseño de barba. No incluye cortes técnicos o pelo/barba larga', duracion_min: 45, precio_eur: 20 },
    { nombre: 'Corte de cabello o rapado', descripcion: 'Cortes de cabello hasta el nº1 o rapados hasta nº6', duracion_min: 25, precio_eur: 12 },
  ],
  Corte: [
    { nombre: 'Corte tendencia o degradado', descripcion: 'Cortes de cabello tendencia o degradados hasta nº0.5', duracion_min: 30, precio_eur: 13 },
    { nombre: 'Afeitado de cabeza', descripcion: 'Afeitado de cabeza con shaver y su respectivo cuidado', duracion_min: 20, precio_eur: 10 },
    { nombre: 'Lavado de cabeza y peinado', descripcion: 'Lavado de cabeza, masaje y peinado', duracion_min: 10, precio_eur: 5 },
    { nombre: 'Corte de cabello o rapado', descripcion: 'Cortes de cabello hasta el nº1 o rapados hasta nº6', duracion_min: 25, precio_eur: 12 },
    { nombre: 'Corte jubilado y niños', descripcion: 'Corte de cabello para jubilados y niños menores de 8 años', duracion_min: 20, precio_eur: 11 },
    { nombre: 'Corte técnico o pelo largo', descripcion: 'Corte de cabello con dificultad técnica o cabello largo. Incluye lavado', duracion_min: 45, precio_eur: 17 },
    { nombre: 'Diseño de cuello y patillas', descripcion: 'Arreglo y diseño de cuello y patillas para mantenimiento del corte', duracion_min: 15, precio_eur: 7 },
  ],
  Barba: [
    { nombre: 'Diseño de la barba y/o degradado', descripcion: 'Diseño de barba tendencia o degradados con su perfilado', duracion_min: 20, precio_eur: 10 },
    { nombre: 'Afeitado clásico', descripcion: 'Afeitado de barba clásico a navaja con masaje y cuidados', duracion_min: 30, precio_eur: 12 },
    { nombre: 'Arreglo de barba', descripcion: 'Barba rebajada a máquina y mantenimiento de su perfilado', duracion_min: 15, precio_eur: 8 },
    { nombre: 'Diseño y cuidado de barba larga', descripcion: 'Diseño, cuidados y mantenimiento de barba larga', duracion_min: 30, precio_eur: 12 },
  ],
  Combinados: [
    { nombre: 'Corte de cabello + diseño de barba', descripcion: 'Corte de cabello y diseño de barba. No incluye cortes técnicos o pelo/barba larga', duracion_min: 45, precio_eur: 20 },
    { nombre: 'Afeitado de cabeza + diseño de barba', descripcion: 'Afeitado de cabeza con diseño de barba. No incluye barba larga', duracion_min: 35, precio_eur: 17 },
    { nombre: 'Pack completo', descripcion: 'Lavado + corte (no incluye corte técnico o pelo largo) + barba (no incluye barba larga)', duracion_min: 55, precio_eur: 25 },
    { nombre: 'Lavado + corte', descripcion: 'Corte de cabello (no incluye corte técnico o pelo largo) más lavado de cabeza', duracion_min: 35, precio_eur: 16 },
  ],
}

const ABOUT_IMAGES = [
  '/05ad044bdb6847c391c7690566a972-nick-home-biz-photo-8777a9bf17f94e57bddf25132b92f5-booksy.jpeg',
  '/61dfbe29b5d44ef3b926e35b445ac1-nick-home-barberia-biz-photo-839b40cd5a41454ab857411f660b5e-booksy.jpeg',
  '/8d8ec92edf2f4d75b6094242c3b68d-nick-home-biz-photo-7c4a9ec3f0df4a89bb2f0e7ae7a93e-booksy.jpeg',
  '/bb0fad36327d43cabe45ae40cb65b9-nick-home-barberia-biz-photo-8b230acdabb24db4aaee2c70a4ffa9-booksy.jpeg',
  '/d9c5880943c14fe8bbc7b1f30c4aab-nick-home-barberia-biz-photo-e66e3340cd3e4bad869148a688b5eb-booksy.jpeg',
]

const BOOKSY_URL = 'https://booksy.com/es-es/165087_nick-home-barberia_barberia_62861_foz#ba_s=seo'
const INSTAGRAM_URL = 'https://www.instagram.com/nickhomebarber/'

// ── ICONS ────────────────────────────────────────────────────────────────────

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12a19.79 19.79 0 0 1-3-8.63A2 2 0 0 1 3.44 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 7.13 7.13l1.32-1.32a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}


// ── SERVICES SECTION ─────────────────────────────────────────────────────────

function ServicesSection() {
  const [activeTab, setActiveTab] = useState('Populares')
  const tabs = Object.keys(SERVICES)
  return (
    <section id="servicios" style={{ padding: '5rem 2rem', background: '#f0efe1' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.6rem' }}>Tarifas</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Nuestros servicios</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 300, maxWidth: 500 }}>Todos los precios incluyen IVA. Reserva tu cita en Booksy.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.2rem', borderRadius: 100, border: '1.5px solid', borderColor: activeTab === tab ? 'var(--green-dark)' : '#d4d3c4', background: activeTab === tab ? 'var(--green-dark)' : 'transparent', color: activeTab === tab ? 'var(--cream)' : 'var(--text-mid)', cursor: 'pointer', transition: 'all 0.18s' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {SERVICES[activeTab].map((s, i) => (
            <div key={i} style={{ background: 'var(--cream)', border: '1px solid #e8e7d9', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(30,42,39,0.10)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sage-dark)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e7d9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, color: 'var(--green-dark)', lineHeight: 1.3 }}>{s.nombre}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-dark)', whiteSpace: 'nowrap' }}>{s.precio_eur}€</div>
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-light)', lineHeight: 1.55 }}>{s.descripcion}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>
                <IconClock /><span>{s.duracion_min} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', msg: '' })
  const [contactSent, setContactSent] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [aboutIdx, setAboutIdx] = useState(0)
  const [aboutLightbox, setAboutLightbox] = useState(false)

  const aboutPrev = useCallback(() => setAboutIdx(i => (i === 0 ? ABOUT_IMAGES.length - 1 : i - 1)), [])
  const aboutNext = useCallback(() => setAboutIdx(i => (i === ABOUT_IMAGES.length - 1 ? 0 : i + 1)), [])

  useEffect(() => {
    if (!aboutLightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  aboutPrev()
      if (e.key === 'ArrowRight') aboutNext()
      if (e.key === 'Escape')     setAboutLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aboutLightbox, aboutPrev, aboutNext])

  function handleContact(e: React.FormEvent) {
    e.preventDefault()
    setContactSent(true)
    setTimeout(() => setContactSent(false), 3000)
    setContactForm({ name: '', email: '', msg: '' })
  }

  return (
    <>
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--sage-dark)' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Nickelao Barber</span>
        </a>
        {/* Nav desktop — centrada con posición absoluta */}
        <nav className="landing-nav" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {[['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-mid)', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: 6, transition: 'background 0.18s, color 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--sage-light)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-dark)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)' }}>
              {label}
            </a>
          ))}
        </nav>
        {/* Hamburguesa (solo móvil) */}
        <button
          className="landing-hamburger"
          onClick={() => setMobileMenu(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
          aria-label="Menú"
        >
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', transform: mobileMenu ? 'rotate(45deg) translate(0px, 7px)' : '' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', opacity: mobileMenu ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', transform: mobileMenu ? 'rotate(-45deg) translate(0px, -7px)' : '' }} />
        </button>
      </header>

      {/* Menú mobile */}
      {mobileMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileMenu(false)}>
          <div
            style={{ position: 'absolute', top: 72, left: 0, right: 0, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '1rem 0' }}
            onClick={e => e.stopPropagation()}
          >
            {[['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}
              >
                {label}
              </a>
            ))}
            <a
              href={BOOKSY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenu(false)}
              style={{ display: 'block', margin: '1rem 2rem 0.25rem', padding: '0.75rem 1.5rem', background: 'var(--gold)', color: 'var(--green-dark)', fontWeight: 600, fontSize: '0.92rem', borderRadius: 8, textAlign: 'center', textDecoration: 'none' }}
            >
              Reservar cita
            </a>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: 'var(--green-dark)', minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(50,70,60,0.35) 60px, rgba(50,70,60,0.35) 62px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(242,194,48,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.35rem 0.9rem', borderRadius: 100, marginBottom: '1.5rem' }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor" /></svg>
            Citas disponibles hoy
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Image src="/logo.jpeg" alt="Logo" width={90} height={90} style={{ borderRadius: 16, objectFit: 'cover', border: '3px solid var(--gold)' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.1, marginBottom: '1rem' }}>
            Tu mejor <span style={{ color: 'var(--gold)' }}>versión</span><br />empieza aquí
          </h1>
          <p style={{ color: 'rgba(220,230,218,0.9)', fontSize: '1.05rem', fontWeight: 300, marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Barbería de confianza en Foz y Mondoñedo.<br />Cortes de precisión, afeitados clásicos y mucho más.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BOOKSY_URL} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: 8, border: 'none', background: 'var(--gold)', color: 'var(--green-dark)', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.01em', textDecoration: 'none', display: 'inline-block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLAnchorElement).style.transform = '' }}>
              Reservar cita
            </a>
            <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 500, padding: '0.85rem 2rem', borderRadius: 8, border: '1.5px solid rgba(210,225,210,0.4)', background: 'transparent', color: 'var(--cream)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cream)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(210,225,210,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
              Ver servicios
            </button>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <ServicesSection />

      {/* ABOUT */}
      <section id="nosotros" style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="landing-about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            {/* ── SLIDER QUIÉNES SOMOS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Imagen principal */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', background: '#ccc' }}>
                <Image
                  key={aboutIdx}
                  src={ABOUT_IMAGES[aboutIdx]}
                  alt={`Foto ${aboutIdx + 1} de ${ABOUT_IMAGES.length}`}
                  fill
                  style={{ objectFit: 'cover', cursor: 'zoom-in' }}
                  sizes="(max-width: 768px) 100vw, 550px"
                  onClick={() => setAboutLightbox(true)}
                />
                <button
                  onClick={aboutPrev}
                  style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                  aria-label="Foto anterior"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={aboutNext}
                  style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                  aria-label="Foto siguiente"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 100, pointerEvents: 'none', zIndex: 2 }}>
                  {aboutIdx + 1} / {ABOUT_IMAGES.length}
                </div>
              </div>
              {/* Miniaturas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {ABOUT_IMAGES.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setAboutIdx(i)}
                    style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === aboutIdx ? '#547832' : 'transparent'}`, opacity: i === aboutIdx ? 1 : 0.6, padding: 0, cursor: 'pointer', background: 'none' }}
                  >
                    <Image src={src} alt={`Miniatura ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
                  </button>
                ))}
              </div>
              {/* Lightbox */}
              {aboutLightbox && (
                <div onClick={() => setAboutLightbox(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: 900, padding: '0 56px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                      <Image src={ABOUT_IMAGES[aboutIdx]} alt={`Foto ${aboutIdx + 1}`} fill style={{ objectFit: 'contain' }} sizes="90vw" />
                    </div>
                    <button onClick={aboutPrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={aboutNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => setAboutLightbox(false)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 }}>
                      Cerrar ✕
                    </button>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }}>
                      {aboutIdx + 1} / {ABOUT_IMAGES.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.6rem' }}>Nuestra historia</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', color: 'var(--green-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>Tradición y estilo<br />en cada corte</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '1rem' }}>
                En Nickelao Barber llevamos más de 8 años cuidando la imagen de nuestros clientes en Foz y Mondoñedo. Combinamos técnicas clásicas de barbería con las últimas tendencias para que cada visita sea una experiencia, no solo un servicio.
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: '1rem' }}>
                Nuestro equipo — Nick y Diego en Foz, Roberto y Pepe en Mondoñedo — trabaja con precisión y pasión. Cada corte, cada afeitado y cada diseño de barba está pensado para resaltar lo mejor de ti.
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>
                Dos locales en la Costa da Mariña, el mismo estándar de calidad y el mismo trato cercano que nos ha convertido en la barbería de confianza de la zona.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--cream-mid)' }}>
                {[{ n: '8+', label: 'Años de experiencia' }, { n: '2', label: 'Locales en Galicia' }, { n: '15+', label: 'Servicios disponibles' }].map(s => (
                  <div key={s.n}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--green-dark)', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" style={{ padding: '5rem 2rem', background: '#f0efe1' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.6rem' }}>Habla con nosotros</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: 'var(--green-dark)' }}>Contacto</h2>
          </div>
          <div className="landing-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--green-dark)', marginBottom: '1.5rem' }}>Encuéntranos</h3>
              {[
                { icon: <IconLocation />, label: 'Dirección', value: 'Foz · Mondoñedo, Galicia' },
                { icon: <IconPhone />, label: 'Teléfono', value: '+34 600 000 000' },
                { icon: <IconMail />, label: 'Email', value: 'hola@nickelaobarber.com' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '0.6rem' }}>Horario</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
                  Lun – Vie: 09:00 – 20:00<br />Sábados: 09:00 – 15:00<br />Domingos: Cerrado
                </div>
              </div>
            </div>
            <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={contactForm[f.key as keyof typeof contactForm]} onChange={e => setContactForm(cf => ({ ...cf, [f.key]: e.target.value }))}
                    style={{ padding: '0.75rem 1rem', borderRadius: 8, border: '1.5px solid #cccbba', background: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text-dark)', outline: 'none', resize: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Mensaje</label>
                <textarea rows={5} placeholder="¿En qué podemos ayudarte?" value={contactForm.msg} onChange={e => setContactForm(cf => ({ ...cf, msg: e.target.value }))}
                  style={{ padding: '0.75rem 1rem', borderRadius: 8, border: '1.5px solid #cccbba', background: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text-dark)', outline: 'none', resize: 'none' }} />
              </div>
              <button type="submit" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: 8, border: 'none', background: 'var(--green-dark)', color: 'var(--cream)', cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.2s' }}>
                {contactSent ? '✓ Mensaje enviado' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--green-dark)', color: 'rgba(190,205,188,0.9)', padding: '3rem 2rem 2rem' }}>
        <div className="landing-footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(70,100,70,0.5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Image src="/logo.jpeg" alt="Logo" width={38} height={38} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--gold-dark)' }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--cream)' }}>Nickelao Barber</span>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>Barbería profesional donde la tradición<br />y el estilo se encuentran.</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid rgba(80,110,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(180,200,178,0.9)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold-dark)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(80,110,80,0.6)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(180,200,178,0.9)' }}>
                <IconInstagram />
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '1rem' }}>Navegación</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
                <li key={href}><a href={href} style={{ fontSize: '0.85rem', color: 'rgba(175,195,173,0.9)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>{label}</a></li>
              ))}
              <li>
                <a href={BOOKSY_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'rgba(175,195,173,0.9)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>Reservar cita</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '1rem' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['#', 'Foz · Mondoñedo, Galicia'], ['tel:+34600000000', '+34 600 000 000'], ['mailto:hola@nickelaobarber.com', 'hola@nickelaobarber.com'], [INSTAGRAM_URL, '@nickhomebarber']].map(([href, label]) => (
                <li key={label}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} style={{ fontSize: '0.85rem', color: 'rgba(175,195,173,0.9)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(120,150,118,0.8)' }}>
          <span>© 2026 Nickelao Barber. Todos los derechos reservados.</span>
          <span>Hecho con cuidado en Galicia</span>
        </div>
      </footer>
    </>
  )
}
