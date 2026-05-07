'use client'

import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

type SessionUser = { name?: string | null; image?: string | null; role?: string }

export default function AppHeader() {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => { if (data?.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#F5F4E6', borderBottom: '1px solid #e0dfd0',
      padding: '0 1.5rem', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <Image src="/logo.jpeg" alt="Nickelao Barber" width={38} height={38} style={{ borderRadius: 7, objectFit: 'cover', border: '2px solid #1E2A27' }} />
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#1E2A27', whiteSpace: 'nowrap' }}>Nickelao Barber</span>
      </a>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid #1E2A27', flexShrink: 0 }}>
            {user.image
              ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : <div style={{ width: '100%', height: '100%', background: '#1E2A27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F4E6', fontWeight: 700, fontSize: '0.85rem' }}>
                  {user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
            }
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ background: 'none', border: '1px solid #C8C9C4', color: '#A7A8A3', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, borderRadius: 6, padding: '0.35rem 0.75rem', cursor: 'pointer' }}
          >
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
