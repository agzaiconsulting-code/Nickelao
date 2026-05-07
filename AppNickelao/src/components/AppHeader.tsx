'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ProfileModal from './ProfileModal'

type SessionUser = { name?: string | null; image?: string | null; role?: string }

const NAV_LINKS = [
  ['/#reservas', 'Reserva'],
  ['/#servicios', 'Servicios'],
  ['/#nosotros', 'Quiénes somos'],
  ['/#contacto', 'Contacto'],
]

const SESSION_KEY = 'nic_session_user'

export default function AppHeader() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') } catch { return null }
  })
  const [mobileMenu, setMobileMenu] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        const u = data?.user ?? null
        setUser(u)
        if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u))
        else localStorage.removeItem(SESSION_KEY)
      })
      .catch(() => {})
  }, [])

  const isBarber = user?.role && ['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flex: 1 }}>
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--sage-dark)' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Nickelao Barber</span>
        </a>

        <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 2, justifyContent: 'center' }}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-mid)', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: 6, transition: 'background 0.18s, color 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--sage-light)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-dark)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)' }}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', alignItems: 'center' }}>
          {isBarber && (
            <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: 6, border: '1.5px solid var(--gold-dark)', color: 'var(--gold-dark)', background: 'transparent', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold-dark)' }}>
              Panel Admin
            </a>
          )}
          {user?.role === 'CLIENT' && (
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
          {user ? (
            <button onClick={() => setProfileOpen(true)}
              style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--green-dark)', background: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
              aria-label="Perfil">
              {user.image
                ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                : <div style={{ width: '100%', height: '100%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '0.9rem', fontWeight: 700 }}>
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
              }
            </button>
          ) : (
            <button onClick={() => signIn('google')}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, padding: '0.45rem 1.25rem', borderRadius: 6, border: '1.5px solid var(--green-dark)', color: 'var(--green-dark)', background: 'transparent', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--green-dark)' }}>
              Acceder
            </button>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button className="landing-hamburger" onClick={() => setMobileMenu(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
          aria-label="Menú">
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', transform: mobileMenu ? 'rotate(45deg) translate(0px, 7px)' : '' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', opacity: mobileMenu ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--green-dark)', transition: 'all 0.25s', transform: mobileMenu ? 'rotate(-45deg) translate(0px, -7px)' : '' }} />
        </button>
      </header>

      {/* Menú móvil */}
      {mobileMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileMenu(false)}>
          <div style={{ position: 'absolute', top: 72, left: 0, right: 0, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '1rem 0' }}
            onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                {label}
              </a>
            ))}
            <div style={{ margin: '1rem 2rem 0.25rem' }}>
              {!user ? (
                <button onClick={() => { setMobileMenu(false); signIn('google') }}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--green-dark)', border: 'none', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>
                  Acceder / Registrarse
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenu(false); setProfileOpen(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--green-dark)', flexShrink: 0 }}>
                      {user.image
                        ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontWeight: 700 }}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                      }
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{user.name}</span>
                  </button>
                  {user.role === 'CLIENT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {[['Mis citas', '/mis-citas'], ['Portfolio', '/portfolio']].map(([label, href]) => (
                        <a key={href} href={href} onClick={() => setMobileMenu(false)}
                          style={{ display: 'block', padding: '0.75rem 0', fontSize: '1rem', fontWeight: 500, color: 'var(--green-dark)', textDecoration: 'none', borderTop: '1px solid var(--cream-mid)' }}>
                          {label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  )
}
