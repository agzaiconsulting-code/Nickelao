'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', lastName: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/home')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al registrarse')
    }
  }

  const inputCls = 'w-full bg-[#2a3a35] border border-[#3a4a45] rounded-xl px-4 py-3.5 text-[#F5F4E6] placeholder-[#A7A8A3] focus:outline-none focus:border-[#F2C230] text-sm'
  const labelCls = 'text-[#A7A8A3] text-xs font-medium block mb-1.5'

  return (
    <main className="min-h-screen bg-[#1E2A27] flex flex-col items-center py-16 px-6 overflow-y-auto">
      <div className="flex flex-col items-center gap-3 mb-10">
        <Image src="/logo.jpeg" alt="Nickelao Barber" width={88} height={88} loading="eager" className="rounded-2xl border-2 border-[#F2C230]" />
        <h1 className="text-[#F5F4E6] text-2xl font-bold tracking-wide">Nickelao Barber</h1>
        <p className="text-[#A7A8A3] text-sm">Foz · Mondoñedo</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input type="text" value={form.name} onChange={set('name')} required placeholder="Nombre" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Apellidos</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} required placeholder="Apellidos" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={form.email} onChange={set('email')} required placeholder="tu@email.com" className={inputCls} />
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !form.name || !form.email}
          className="w-full bg-[#F2C230] text-[#1E2A27] font-bold py-4 rounded-2xl text-base disabled:opacity-50 mt-2"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-[#A7A8A3] text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/sign-in" className="text-[#F2C230] font-medium">Inicia sesión</Link>
        </p>
      </form>
    </main>
  )
}
