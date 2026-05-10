'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Props {
  onClose: () => void
  onSaved?: () => void
}

export default function ProfileModal({ onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(u => {
      setName(u.name ?? '')
      setPhone(u.phone ?? '')
      setEmail(u.email ?? '')
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
    if (res.ok) {
      setSaved(true)
      onSaved?.()
      setTimeout(() => { setSaved(false); onClose() }, 800)
    } else {
      const body = await res.text().catch(() => '')
      setErr(`Error ${res.status}: ${body || 'sin respuesta'}`)
    }
  }

  const initials = (name || '?')[0]?.toUpperCase()

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '2.5rem', width: 'min(460px, 94vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--green-dark)' }}>Mi perfil</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            {imageUrl
              ? <img src={imageUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-dark)' }} />
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
                style={{ padding: '0.72rem 1rem', borderRadius: 8, border: '1.5px solid #cccbba', background: 'white', fontFamily: "'Barlow', sans-serif", fontSize: '0.88rem', color: 'var(--text-dark)', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>Email</label>
            <input type="email" value={email} disabled
              style={{ padding: '0.72rem 1rem', borderRadius: 8, border: '1.5px solid #e0dfd0', background: '#f5f4e8', fontFamily: "'Barlow', sans-serif", fontSize: '0.88rem', color: 'var(--text-light)', outline: 'none', cursor: 'not-allowed' }} />
          </div>
          {err && <p style={{ fontSize: '0.82rem', color: '#c0392b' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.8rem', borderRadius: 8, border: '1.5px solid #d4d3c4', background: 'transparent', color: 'var(--text-mid)', fontFamily: "'Barlow', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || uploading}
              style={{ flex: 2, padding: '0.8rem', borderRadius: 8, border: 'none', background: saved ? '#2ecc71' : 'var(--green-dark)', color: 'var(--cream)', fontFamily: "'Barlow', sans-serif", fontSize: '0.88rem', fontWeight: 600, cursor: (saving || uploading) ? 'not-allowed' : 'pointer', opacity: (saving || uploading) ? 0.7 : 1, transition: 'background 0.3s' }}>
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <button onClick={() => signOut()}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', borderRadius: 8, border: '1.5px solid #d4d3c4', background: 'transparent', color: 'var(--text-light)', fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
