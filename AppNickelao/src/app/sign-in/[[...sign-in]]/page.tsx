'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (res.ok) {
      const redirect = params.get('redirect_url') ?? '/home'
      router.push(redirect)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al iniciar sesión')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
      <div>
        <label className="text-[#A7A8A3] text-xs font-medium block mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          className="w-full bg-[#2a3a35] border border-[#3a4a45] rounded-xl px-4 py-3.5 text-[#F5F4E6] placeholder-[#A7A8A3] focus:outline-none focus:border-[#F2C230] text-sm"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-[#F2C230] text-[#1E2A27] font-bold py-4 rounded-2xl text-base disabled:opacity-50 mt-2"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#1E2A27] flex flex-col items-center py-16 px-6 overflow-y-auto">
      <div className="flex flex-col items-center gap-3 mb-10">
        <Image
          src="/logo.jpeg"
          alt="Nickelao Barber"
          width={88}
          height={88}
          loading="eager"
          className="rounded-2xl border-2 border-[#F2C230]"
        />
        <h1 className="text-[#F5F4E6] text-2xl font-bold tracking-wide">
          Nickelao Barber
        </h1>
        <p className="text-[#A7A8A3] text-sm">Foz · Mondoñedo</p>
      </div>
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  )
}
