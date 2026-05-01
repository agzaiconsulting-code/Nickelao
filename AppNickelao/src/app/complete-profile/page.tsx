'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', lastName: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.lastName) { setError('Nombre y apellidos son obligatorios'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      router.push('/home')
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1E2A27] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={72} height={72} className="rounded-xl border-2 border-[#F2C230]" />
          <h1 className="text-[#F5F4E6] text-2xl font-bold">Completa tu perfil</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { key: 'name', label: 'Nombre', placeholder: 'Tu nombre' },
            { key: 'lastName', label: 'Apellidos', placeholder: 'Tus apellidos' },
            { key: 'phone', label: 'Teléfono', placeholder: '+34 600 000 000' },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#F2C230]">{f.label}</label>
              <input
                type={f.key === 'phone' ? 'tel' : 'text'}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="bg-[#2a3a35] text-[#F5F4E6] placeholder-[#A7A8A3] border border-[#3a4a45] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F2C230]"
              />
            </div>
          ))}
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F2C230] text-[#1E2A27] font-bold rounded-xl py-4 text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Continuar'}
          </button>
        </form>
      </div>
    </main>
  )
}
