'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  name: string
  lastName: string
  email: string
  phone: string | null
  points: number
  avatarUrl: string | null
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', lastName: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        setUser(data)
        setForm({ name: data.name, lastName: data.lastName, phone: data.phone ?? '' })
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setUser(updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F4E6] flex items-center justify-center">
        <p className="text-[#A7A8A3]">Cargando…</p>
      </div>
    )
  }

  const initials = `${user.name[0]}${user.lastName[0]}`.toUpperCase()
  const progress = Math.min((user.points / 100) * 100, 100)

  return (
    <div className="min-h-screen bg-[#F5F4E6]">
      {/* Header */}
      <div className="bg-[#1E2A27] px-5 pt-14 pb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-[#547832] flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div className="text-center">
            <p className="text-[#F5F4E6] text-xl font-bold">{user.name} {user.lastName}</p>
            <p className="text-[#A7A8A3] text-sm mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
        {/* NickPoints */}
        <div className="bg-[#1E2A27] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F2C230]">NickPoints</p>
              <p className="text-3xl font-bold text-[#F5F4E6] mt-1">{user.points} <span className="text-base font-normal text-[#A7A8A3]">/ 100</span></p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <div className="h-2 bg-[#2a3a35] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F2C230] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[#A7A8A3] text-xs mt-2">
            {user.points >= 100 ? '¡Tienes un corte gratis! Avisa al peluquero.' : `${100 - user.points} puntos para corte gratis`}
          </p>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E6E0]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#547832]">Datos personales</p>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-[#547832] font-semibold">
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Nombre</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm text-[#1E2A27] focus:outline-none focus:border-[#547832]"
                />
              </div>
              <div>
                <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Apellido</label>
                <input
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm text-[#1E2A27] focus:outline-none focus:border-[#547832]"
                />
              </div>
              <div>
                <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  type="tel"
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm text-[#1E2A27] focus:outline-none focus:border-[#547832]"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-[#E6E6E0] text-[#A7A8A3] font-semibold py-3 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#547832] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nombre', value: `${user.name} ${user.lastName}` },
                { label: 'Email', value: user.email },
                { label: 'Teléfono', value: user.phone ?? 'No añadido' },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-xs text-[#A7A8A3] font-medium mb-0.5">{row.label}</p>
                  <p className="text-[#1E2A27] text-sm font-medium">{row.value}</p>
                </div>
              ))}
              {saved && <p className="text-xs text-[#547832] font-medium">✓ Cambios guardados</p>}
            </div>
          )}
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={async () => { await fetch('/api/auth/signout', { method: 'POST' }); router.push('/sign-in') }}
          className="w-full border border-[#E6E6E0] text-[#A7A8A3] font-semibold py-4 rounded-2xl text-sm bg-white"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
