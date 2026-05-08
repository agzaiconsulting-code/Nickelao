'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

// ── SESSION HOOK ──────────────────────────────────────────────────────────────

type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null; points?: number; role?: string }
type CurrentSession = { user: SessionUser } | null

const SESSION_KEY = 'nic_session_user'

function useCurrentSession(): { session: CurrentSession; reload: () => void } {
  const [session, setSession] = useState<CurrentSession>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
      if (cached) setSession(cached)
    } catch {}
  }, [])
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const s = data?.user ? (data as CurrentSession) : null
        setSession(s)
        if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
        else localStorage.removeItem(SESSION_KEY)
      })
      .catch(() => {})
  }, [tick])
  return { session, reload: () => setTick(t => t + 1) }
}

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

const INSTAGRAM_URL = 'https://www.instagram.com/nickhomebarber/'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function addDays(base: Date, n: number) {
  const d = new Date(base); d.setDate(base.getDate() + n); return d
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
function IconTikTok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

// ── AUTH MODAL ───────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '2.5rem', width: 'min(420px, 92vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.3)', textAlign: 'center' }}>
        <Image src="/logo.jpeg" alt="Logo" width={64} height={64} style={{ borderRadius: 12, objectFit: 'cover', border: '2px solid var(--sage-dark)', marginBottom: '1.25rem' }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--green-dark)', marginBottom: '0.4rem' }}>
          Bienvenido a Nickelao
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Inicia sesión o crea tu cuenta para gestionar tus reservas y acumular NickPoints.
        </p>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.9rem 1.5rem', borderRadius: 10, border: '1.5px solid #d4d3c4', background: 'white', color: '#3c4043', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.18s', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Redirigiendo...' : 'Continuar con Google'}
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── COMPLETE PROFILE MODAL ────────────────────────────────────────────────────

function CompleteProfileModal({ name, onDone }: { name: string; onDone: () => void }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { setErr('El teléfono es obligatorio'); return }
    setLoading(true); setErr('')
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
    })
    setLoading(false)
    if (res.ok) onDone()
    else setErr('Error al guardar. Inténtalo de nuevo.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '2.5rem', width: 'min(440px, 92vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.3)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--green-dark)', marginBottom: '0.4rem' }}>
          Un último paso
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Hola, <strong>{name}</strong>. Añade tu teléfono para confirmar las reservas por WhatsApp.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Teléfono</label>
            <input type="tel" placeholder="+34 600 000 000" value={phone} onChange={e => setPhone(e.target.value)} required
              style={{ padding: '0.75rem 1rem', borderRadius: 8, border: '1.5px solid #cccbba', background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text-dark)', outline: 'none' }} />
          </div>
          {err && <p style={{ fontSize: '0.82rem', color: '#c0392b' }}>{err}</p>}
          <button type="submit" disabled={loading}
            style={{ padding: '0.9rem', borderRadius: 8, border: 'none', background: 'var(--green-dark)', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── PROFILE MODAL ─────────────────────────────────────────────────────────────

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { session, reload } = useCurrentSession()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(u => {
      setName(u.name ?? '')
      setPhone(u.phone ?? '')
      setImageUrl(u.image ?? '')
    }).catch(() => {})
  }, [])

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr('')
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    setUploading(false)
    if (res.ok) { const { url } = await res.json(); setImageUrl(url) }
    else setErr('Error al subir la imagen.')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setErr('')
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, image: imageUrl || null }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); reload(); setTimeout(() => { setSaved(false); onClose() }, 800) }
    else {
      const body = await res.text().catch(() => '')
      setErr(`Error ${res.status}: ${body || 'sin respuesta'}`)
    }
  }

  const avatarSrc = imageUrl || session?.user?.image || ''
  const initials = (name || session?.user?.name || '?')[0]?.toUpperCase()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '2.5rem', width: 'min(460px, 94vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--green-dark)' }}>Mi perfil</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1 }}>✕</button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-dark)' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '1.8rem', fontWeight: 700 }}>{initials}</div>
            }
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>...</div>
            )}
          </div>
          <label style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--green-dark)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Cambiar foto
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Nombre y apellidos', value: name, set: setName, type: 'text', placeholder: 'Tu nombre completo' },
            { label: 'Teléfono', value: phone, set: setPhone, type: 'tel', placeholder: '+34 600 000 000' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)}
                style={{ padding: '0.72rem 1rem', borderRadius: 8, border: '1.5px solid #cccbba', background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text-dark)', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Email</label>
            <input type="email" value={session?.user?.email ?? ''} disabled
              style={{ padding: '0.72rem 1rem', borderRadius: 8, border: '1.5px solid #e0dfd0', background: '#f5f4e8', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text-light)', outline: 'none', cursor: 'not-allowed' }} />
          </div>
          {err && <p style={{ fontSize: '0.82rem', color: '#c0392b' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.8rem', borderRadius: 8, border: '1.5px solid #d4d3c4', background: 'transparent', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || uploading}
              style={{ flex: 2, padding: '0.8rem', borderRadius: 8, border: 'none', background: saved ? '#2ecc71' : 'var(--green-dark)', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: (saving || uploading) ? 'not-allowed' : 'pointer', opacity: (saving || uploading) ? 0.7 : 1, transition: 'background 0.3s' }}>
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <button onClick={() => signOut()}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', borderRadius: 8, border: '1.5px solid #d4d3c4', background: 'transparent', color: 'var(--text-light)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ── PROFILE BUTTON ─────────────────────────────────────────────────────────────

function ProfileButton({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { session } = useCurrentSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) {
    return (
      <button onClick={onOpenAuth}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, padding: '0.45rem 1.25rem', borderRadius: 6, border: '1.5px solid var(--green-dark)', color: 'var(--green-dark)', background: 'transparent', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--green-dark)' }}>
        Acceder
      </button>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--green-dark)', background: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
        aria-label="Perfil">
        {session.user.image
          ? <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '0.9rem', fontWeight: 700 }}>
              {session.user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
        }
      </button>
      {open && <ProfileModal onClose={() => setOpen(false)} />}
    </>
  )
}

// ── BOOKING SECTION ──────────────────────────────────────────────────────────

const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const LOC_MAP: Record<string, string> = { Foz: 'FOZ', 'Mondoñedo': 'MONDONEDO' }
const CAT_ORDER = ['POPULARES', 'CORTE', 'BARBA', 'COMBINADOS']
const CAT_LABELS: Record<string, string> = { POPULARES: 'Populares', CORTE: 'Corte', BARBA: 'Barba', COMBINADOS: 'Combinados' }

type DbService = { id: string; name: string; duration: number; price: number; category: string }
type DbBarber  = { id: string; name: string }

function BookingSection({ onAuthRequired, isLoggedIn }: { onAuthRequired: () => void; isLoggedIn: boolean }) {
  const [local, setLocal]               = useState('Foz')
  const [barberPref, setBarberPref]     = useState('auto')   // 'auto' | barberId
  const [serviceId, setServiceId]       = useState('')
  const [dayOffset, setDayOffset]       = useState(1)
  const [dayWindowStart, setDayWindowStart] = useState(0)
  const [selectedTime, setSelectedTime]     = useState<string | null>(null)
  const [timeFilter, setTimeFilter]         = useState<string | null>(null)
  const [showBarberPicker, setShowBarberPicker] = useState(false)
  const [toast, setToast]                   = useState(false)

  // DB state
  const [baseDate]                          = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [dbServices, setDbServices]         = useState<DbService[]>([])
  const [dbBarbers,  setDbBarbers]          = useState<DbBarber[]>([])
  const [slotBarberMap, setSlotBarberMap]   = useState<Record<string, string>>({})
  const [slotsLoading, setSlotsLoading]     = useState(false)
  const [booking, setBooking]               = useState(false)
  const [slotsVersion, setSlotsVersion]     = useState(0)

  // Load services once
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.ok ? r.json() : [])
      .then((data: DbService[]) => setDbServices(data))
      .catch(() => {})
  }, [])

  // Load barbers when local changes
  useEffect(() => {
    fetch(`/api/barbers?location=${LOC_MAP[local]}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: DbBarber[]) => { setDbBarbers(data); setBarberPref('auto'); setSelectedTime(null) })
      .catch(() => {})
  }, [local])

  // Load slots when service / barber / day changes (or after a booking)
  useEffect(() => {
    if (!serviceId || dbBarbers.length === 0) { setSlotBarberMap({}); return }
    const svc = dbServices.find(s => s.id === serviceId)
    if (!svc) return
    const targets = barberPref === 'auto' ? dbBarbers : dbBarbers.filter(b => b.id === barberPref)
    if (targets.length === 0) return
    const ids = targets.map(b => b.id).join(',')
    const date = addDays(baseDate, dayOffset)
    setSlotsLoading(true)
    fetch(`/api/slots?barberIds=${ids}&date=${toDateStr(date)}&duration=${svc.duration}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { time: string; barberId: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach(({ time, barberId }) => { map[time] = barberId })
        setSlotBarberMap(map)
      })
      .catch(() => setSlotBarberMap({}))
      .finally(() => setSlotsLoading(false))
  }, [serviceId, barberPref, dayOffset, dbBarbers, dbServices, baseDate, slotsVersion])

  // Derived
  const selectedService = dbServices.find(s => s.id === serviceId) ?? null
  const durMin          = selectedService?.duration ?? 0
  const selectedDate    = addDays(baseDate, dayOffset)
  const allSlots        = Object.keys(slotBarberMap).sort()
  const filteredSlots   = allSlots.filter(t => {
    if (!timeFilter) return true
    const h = parseInt(t.split(':')[0])
    if (timeFilter === 'Mañana') return h < 14
    if (timeFilter === 'Tarde')  return h >= 14 && h < 20
    return false
  })

  const assignedBarberId = selectedTime
    ? slotBarberMap[selectedTime]
    : (barberPref === 'auto' ? null : barberPref)
  const assignedBarber = dbBarbers.find(b => b.id === assignedBarberId)

  // 7-day strip (today+1 → today+7+window)
  const dayStrip = Array.from({ length: 7 }, (_, i) => {
    const off  = dayWindowStart + i + 1
    const date = addDays(baseDate, off)
    return { off, date }
  })

  function getEndTime(start: string, minutes: number) {
    const [h, m] = start.split(':').map(Number)
    const total  = h * 60 + m + minutes
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  async function handleBook() {
    if (!selectedTime || !selectedService || !assignedBarberId) return
    const dateStr   = toDateStr(addDays(baseDate, dayOffset))
    const startTime = `${dateStr}T${selectedTime}:00.000Z`
    setBooking(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: assignedBarberId, serviceId, startTime, autoAssigned: barberPref === 'auto' }),
      })
      if (res.ok) {
        setSelectedTime(null)
        setSlotsVersion(v => v + 1)
        setToast(true); setTimeout(() => setToast(false), 3500)
      }
    } finally {
      setBooking(false)
    }
  }

  // Group DB services by category for the dropdown
  const servicesByCat: Record<string, DbService[]> = {}
  dbServices.forEach(s => { (servicesByCat[s.category] ??= []).push(s) })

  return (
    <section id="reservas" style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.6rem' }}>Cita previa</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Reserva tu cita</h2>
          {!isLoggedIn && (
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(242,194,48,0.12)', border: '1px solid var(--gold)', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem', color: 'var(--green-dark)', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span>Inicia sesión para reservar. <button onClick={onAuthRequired} style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}>Acceder</button></span>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div style={{ background: '#fff', border: '1px solid #e0dfd0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 32px rgba(30,42,39,0.09)' }}>

          {/* ── Local + service ── */}
          <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #eeeddf', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '0.45rem' }}>Local</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {Object.keys(LOC_MAP).map(l => (
                  <button key={l} onClick={() => { setLocal(l); setSelectedTime(null) }}
                    style={{ padding: '0.45rem 1rem', borderRadius: 8, border: '1.5px solid', borderColor: local === l ? 'var(--green-dark)' : '#d4d3c4', background: local === l ? 'var(--green-dark)' : 'transparent', color: local === l ? 'var(--cream)' : 'var(--text-mid)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', marginBottom: '0.45rem' }}>Servicio</div>
              <select value={serviceId} onChange={e => { setServiceId(e.target.value); setSelectedTime(null) }}
                style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 8, border: `1.5px solid ${serviceId ? 'var(--green-dark)' : '#d4d3c4'}`, background: '#fafaf5', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: serviceId ? 'var(--text-dark)' : 'var(--text-light)', outline: 'none', cursor: 'pointer' }}>
                <option value="">— Elige un servicio —</option>
                {CAT_ORDER.filter(c => servicesByCat[c]).map(cat => (
                  <optgroup key={cat} label={CAT_LABELS[cat]}>
                    {servicesByCat[cat].map(s => (
                      <option key={s.id} value={s.id}>{s.name} · {s.duration}min · {s.price}€</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {!serviceId || !selectedService ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>✂️</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--green-dark)', marginBottom: '0.35rem' }}>Elige un servicio para continuar</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Los horarios aparecerán según la duración del servicio.</div>
            </div>
          ) : (<>

            {/* ── Month title ── */}
            <div style={{ padding: '1.25rem 1.75rem 0.5rem', textAlign: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-dark)' }}>
                {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
            </div>

            {/* ── Day strip ── */}
            <div style={{ padding: '0.5rem 0.75rem 1rem', borderBottom: '1px solid #eeeddf' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <button onClick={() => { setDayWindowStart(w => Math.max(0, w - 7)); setSelectedTime(null) }} disabled={dayWindowStart === 0}
                  style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: dayWindowStart === 0 ? 'default' : 'pointer', color: dayWindowStart === 0 ? '#ccc' : 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div style={{ flex: 1, display: 'flex', gap: '0.3rem' }}>
                  {dayStrip.map(({ off, date }) => {
                    const isSel = off === dayOffset
                    const isSun = date.getDay() === 0
                    return (
                      <button key={off} onClick={() => { if (!isSun) { setDayOffset(off); setSelectedTime(null) } }}
                        style={{ flex: 1, minWidth: 0, padding: '0.55rem 0.15rem', borderRadius: 10, border: `1.5px solid ${isSel ? 'var(--green-dark)' : '#e0dfd0'}`, background: isSel ? 'var(--green-dark)' : 'transparent', color: isSel ? 'var(--cream)' : isSun ? '#ccc' : 'var(--text-dark)', cursor: isSun ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.18rem', transition: 'all 0.18s', opacity: isSun ? 0.45 : 1 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{DAY_ABBR[date.getDay()]}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>{date.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => { setDayWindowStart(w => w + 7); setSelectedTime(null) }}
                  style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>

            {/* ── Time filter tabs ── */}
            <div style={{ padding: '1rem 1.75rem 0.5rem' }}>
              <div style={{ display: 'inline-flex', background: '#f0efe1', borderRadius: 10, padding: '0.2rem', gap: '0.1rem' }}>
                {([null, 'Mañana', 'Tarde'] as (string | null)[]).map(f => (
                  <button key={f ?? 'all'} onClick={() => setTimeFilter(f)}
                    style={{ padding: '0.38rem 0.85rem', borderRadius: 8, border: 'none', background: timeFilter === f ? '#fff' : 'transparent', color: timeFilter === f ? 'var(--green-dark)' : 'var(--text-light)', fontSize: '0.82rem', fontWeight: timeFilter === f ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', boxShadow: timeFilter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap' }}>
                    {f ?? 'Todos'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Time slots ── */}
            <div style={{ padding: '0.5rem 1.75rem 1.25rem' }}>
              {slotsLoading ? (
                <div style={{ padding: '1.25rem 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>Cargando horarios…</div>
              ) : filteredSlots.length === 0 ? (
                <div style={{ padding: '1.25rem 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>Sin horarios disponibles para esta franja</div>
              ) : (
                <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {filteredSlots.map(time => {
                    const isSel = selectedTime === time
                    return (
                      <button key={time}
                        onClick={() => isLoggedIn ? setSelectedTime(isSel ? null : time) : onAuthRequired()}
                        style={{ flexShrink: 0, padding: '0.58rem 1rem', borderRadius: 10, border: `1.5px solid ${isSel ? 'var(--green-dark)' : '#d4d3c4'}`, background: isSel ? 'var(--green-dark)' : 'transparent', color: isSel ? 'var(--cream)' : 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
                        {time}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Summary ── */}
            <div style={{ borderTop: '1px solid #eeeddf' }}>
              {/* Service row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem 1.75rem', borderBottom: '1px solid #eeeddf' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>{selectedService.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                    {selectedTime ? `${selectedTime} – ${getEndTime(selectedTime, durMin)}` : `${durMin} min`}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{selectedService.price.toFixed(2)} €</div>
              </div>

              {/* Barber row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.75rem', borderBottom: '1px solid #eeeddf' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Peluquero:</span>
                  {barberPref !== 'auto' && assignedBarber && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '0.7rem', fontWeight: 700 }}>
                      {assignedBarber.name[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {barberPref === 'auto' ? 'Autoasignación' : (assignedBarber?.name ?? 'Autoasignación')}
                  </span>
                </div>
                <button onClick={() => setShowBarberPicker(p => !p)}
                  style={{ padding: '0.32rem 0.8rem', borderRadius: 8, border: '1.5px solid #d4d3c4', background: 'transparent', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-mid)', cursor: 'pointer' }}>
                  Cambiar
                </button>
              </div>

              {/* Barber picker */}
              {showBarberPicker && (
                <div style={{ padding: '0.75rem 1.75rem', borderBottom: '1px solid #eeeddf', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[{ id: 'auto', name: 'Autoasignación' }, ...dbBarbers].map(b => (
                    <button key={b.id} onClick={() => { setBarberPref(b.id); setSelectedTime(null); setShowBarberPicker(false) }}
                      style={{ padding: '0.4rem 0.9rem', borderRadius: 8, border: '1.5px solid', borderColor: barberPref === b.id ? 'var(--green-dark)' : '#d4d3c4', background: barberPref === b.id ? 'var(--green-dark)' : 'transparent', color: barberPref === b.id ? 'var(--cream)' : 'var(--text-mid)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Total + CTA */}
              <div style={{ padding: '1rem 1.75rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Total:</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-dark)' }}>{selectedService.price.toFixed(2)} €</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{durMin}min</span>
                </div>
                <button onClick={isLoggedIn ? handleBook : onAuthRequired}
                  disabled={(isLoggedIn && !selectedTime) || booking}
                  style={{ width: '100%', padding: '0.95rem', borderRadius: 10, border: 'none', background: (isLoggedIn && selectedTime && !booking) ? 'var(--green-dark)' : '#b0c4b0', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 700, cursor: (isLoggedIn && selectedTime && !booking) ? 'pointer' : 'not-allowed', transition: 'background 0.2s', letterSpacing: '0.01em' }}>
                  {booking ? 'Reservando…' : isLoggedIn ? 'Confirmar reserva' : '🔒 Acceder para reservar'}
                </button>
              </div>
            </div>
          </>)}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 300, background: 'var(--green-dark)', color: 'var(--cream)', padding: '1rem 1.5rem', borderRadius: 10, fontSize: '0.88rem', fontWeight: 500, borderLeft: '4px solid var(--gold)', boxShadow: '0 8px 32px rgba(16,26,22,0.25)' }}>
          ✓ Reserva confirmada en {local} — ¡Hasta pronto!
        </div>
      )}
    </section>
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
          <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 300, maxWidth: 500 }}>Todos los precios incluyen IVA. Consulta disponibilidad antes de reservar.</p>
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
  const { session } = useCurrentSession()
  const [authOpen, setAuthOpen] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [aboutIdx, setAboutIdx] = useState(0)
  const [aboutLightbox, setAboutLightbox] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/users/me').then(r => r.json()).then(u => {
      if (!u.phone) setShowCompleteProfile(true)
    }).catch(() => {})
  }, [session?.user?.id])
  const [contactForm, setContactForm] = useState({ name: '', email: '', msg: '' })
  const [contactSent, setContactSent] = useState(false)

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

  function openAuth() { setAuthOpen(true) }

  function handleContact(e: React.FormEvent) {
    e.preventDefault()
    setContactSent(true)
    setTimeout(() => setContactSent(false), 3000)
    setContactForm({ name: '', email: '', msg: '' })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-dark); line-height: 1.6; }
        @media (max-width: 768px) {
          .landing-nav { display: none !important; }
          .landing-booking-grid { grid-template-columns: 1fr !important; }
          .landing-about-grid { grid-template-columns: 1fr !important; }
          .landing-contact-grid { grid-template-columns: 1fr !important; }
          .landing-footer-inner { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero h1 { font-size: 2.4rem !important; }
          .booking-layout { grid-template-columns: 1fr !important; }
          .calendar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .booking-panel { position: static !important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flex: 1 }}>
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--sage-dark)' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Nickelao Barber</span>
        </a>
        <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 2, justifyContent: 'center' }}>
          {[['#reservas', 'Reserva'], ['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-mid)', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: 6, transition: 'background 0.18s, color 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--sage-light)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-dark)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)' }}>
              {label}
            </a>
          ))}
        </nav>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', alignItems: 'center' }}>
          <div className="header-desktop-links" style={{ gap: '0.6rem', alignItems: 'center' }}>
            {session?.user?.role && ['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(session.user.role) && (
              <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: 6, border: '1.5px solid var(--gold-dark)', color: 'var(--gold-dark)', background: 'transparent', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold-dark)' }}>
                Panel Admin
              </a>
            )}
            {session?.user?.role === 'CLIENT' && (
              <>
                {[['Mis citas', '/mis-citas'], ['Portfolio', '/portfolio']].map(([label, href]) => (
                  <a key={href} href={href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: 6, border: '1.5px solid var(--green)', color: 'var(--green)', background: 'transparent', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--green)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)' }}>
                    {label}
                  </a>
                ))}
              </>
            )}
          </div>
          <div className="header-profile-btn" style={{ display: 'flex', alignItems: 'center' }}>
            <ProfileButton onOpenAuth={openAuth} />
          </div>
        </div>
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
            {[['#reservas', 'Reserva'], ['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                {label}
              </a>
            ))}
            <div style={{ borderBottom: '2.5px solid #c8c9c4', margin: '0 0 0.25rem' }} />
            {session?.user?.role === 'CLIENT' && (
              [['Mis citas', '/mis-citas'], ['Portfolio', '/portfolio']].map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setMobileMenu(false)}
                  style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, color: 'var(--green-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                  {label}
                </Link>
              ))
            )}
            {session?.user?.role && ['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(session.user.role) && (
              <Link href="/admin" onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                Panel Admin
              </Link>
            )}
            <div style={{ margin: '1rem 2rem 0.25rem' }}>
              {!session?.user ? (
                <button onClick={() => { setMobileMenu(false); openAuth() }} style={{ width: '100%', padding: '0.75rem', background: 'var(--green-dark)', border: 'none', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Acceder / Registrarse</button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <button onClick={() => { setMobileMenu(false); setProfileOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    {session.user.image
                      ? <img src={session.user.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-dark)' }} />
                      : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontWeight: 700 }}>{session.user.name?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{session.user.name}</span>
                  </button>
                  <button onClick={() => { setMobileMenu(false); signOut() }} style={{ background: 'none', border: '1px solid #d4d3c4', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer' }}>Salir</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: 'var(--green-dark)', minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(50,70,60,0.35) 60px, rgba(50,70,60,0.35) 62px)' }} />
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
            <button onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: 8, border: 'none', background: 'var(--gold)', color: 'var(--green-dark)', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.01em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}>
              Reservar cita
            </button>
            <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 500, padding: '0.85rem 2rem', borderRadius: 8, border: '1.5px solid rgba(210,225,210,0.4)', background: 'transparent', color: 'var(--cream)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cream)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(210,225,210,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
              Ver servicios
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING */}
      <BookingSection onAuthRequired={() => openAuth()} isLoggedIn={!!session?.user} />

      {/* SERVICES */}
      <ServicesSection />

      {/* ABOUT */}
      <section id="nosotros" style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="landing-about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            {/* ── SLIDER QUIÉNES SOMOS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                <button onClick={aboutPrev} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }} aria-label="Foto anterior">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={aboutNext} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }} aria-label="Foto siguiente">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 100, pointerEvents: 'none', zIndex: 2 }}>
                  {aboutIdx + 1} / {ABOUT_IMAGES.length}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {ABOUT_IMAGES.map((src, i) => (
                  <button key={i} onClick={() => setAboutIdx(i)} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === aboutIdx ? '#547832' : 'transparent'}`, opacity: i === aboutIdx ? 1 : 0.6, padding: 0, cursor: 'pointer', background: 'none' }}>
                    <Image src={src} alt={`Miniatura ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
                  </button>
                ))}
              </div>
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
                { icon: <IconLocation />, label: 'Dirección', value: 'Foz - Av. da Mariña, 26 · Mondoñedo - Praza da Catedral, 13' },
                { icon: <IconMail />, label: 'Email', value: 'nickelaobarbershop@gmail.com' },
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
                  Lun – Vie: 09:30 – 13:30 , 16:00 - 20:30<br />Sábados: 09:00 – 13:00<br />Domingos: Cerrado
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
        <div className="landing-footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(70,100,70,0.5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Image src="/logo.jpeg" alt="Logo" width={38} height={38} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--gold-dark)' }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--cream)' }}>Nickelao Barber</span>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>Barbería profesional donde la tradición<br />y el estilo se encuentran.</p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(80,110,80,0.4)' }}>
              <iframe
                src="https://maps.google.com/maps?q=HP9R%2B3G+Foz,Spain&output=embed&z=17"
                width="100%"
                height="130"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '1rem' }}>Navegación</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['#reservas', 'Reservar cita'], ['#servicios', 'Servicios'], ['#nosotros', 'Quiénes somos'], ['#contacto', 'Contacto']].map(([href, label]) => (
                <li key={href}><a href={href} style={{ fontSize: '0.85rem', color: 'rgba(175,195,173,0.9)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '1rem' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['#', 'Foz - Av. da Mariña, 26 · Mondoñedo - Praza da Catedral, 13'], ['mailto:nickelaobarbershop@gmail.com', 'nickelaobarbershop@gmail.com'], ['#', '@nickelaobarber']].map(([href, label]) => (
                <li key={label}><a href={href} style={{ fontSize: '0.85rem', color: 'rgba(175,195,173,0.9)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '1rem' }}>Síguenos en RR.SS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'rgba(175,195,173,0.9)', transition: 'color 0.18s', fontSize: '0.85rem' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>
                <span style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(80,110,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconInstagram /></span>
                Instagram
              </a>
              <a href="https://www.tiktok.com/@nickhomebarber?_r=1&_t=ZN-963sEBBWEWx" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'rgba(175,195,173,0.9)', transition: 'color 0.18s', fontSize: '0.85rem' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(175,195,173,0.9)'}>
                <span style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(80,110,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconTikTok /></span>
                TikTok
              </a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(120,150,118,0.8)' }}>
          <span>© 2026 Nickelao Barber. Todos los derechos reservados.</span>
          <span>Hecho con cuidado en Galicia</span>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {showCompleteProfile && session?.user?.name && (
        <CompleteProfileModal
          name={session.user.name}
          onDone={() => setShowCompleteProfile(false)}
        />
      )}
    </>
  )
}
