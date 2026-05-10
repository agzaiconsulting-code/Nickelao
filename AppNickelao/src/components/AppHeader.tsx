'use client'

import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import ProfileModal from './ProfileModal'

type SessionUser = { name?: string | null; image?: string | null; role?: string }
type MobileMenuExtra = { label: string; onClick: () => void; active?: boolean }

const NAV_LINKS = [
  ['/#reservas', 'Reserva'],
  ['/#servicios', 'Servicios'],
  ['/#nosotros', 'Quiénes somos'],
  ['/#contacto', 'Contacto'],
]

export default function AppHeader({ initialUser, mobileMenuExtra }: { initialUser?: SessionUser | null; mobileMenuExtra?: MobileMenuExtra[] }) {
  const user = initialUser ?? null
  const [mobileMenu, setMobileMenu] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isBarber = user?.role && ['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--cream)', borderBottom: '1px solid var(--cream-mid)', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flex: 1 }}>
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid var(--sage-dark)' }} />
          <Image src="/HeaderLogo.png" alt="Nickelao Barber" width={130} height={36} style={{ objectFit: 'contain' }} />
        </Link>

        <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 2, justifyContent: 'center' }}>
          {NAV_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-mid)', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: 6, transition: 'background 0.18s, color 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--sage-light)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-dark)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)' }}>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', alignItems: 'center' }}>
          <div className="header-desktop-links" style={{ gap: '0.6rem', alignItems: 'center' }}>
            {mobileMenuExtra ? (
              mobileMenuExtra.map(item => (
                <button key={item.label} onClick={item.onClick}
                  style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: 6, border: 'none', background: item.active ? 'rgba(30,42,39,0.1)' : 'transparent', color: item.active ? 'var(--green-dark)' : 'var(--text-mid)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                  {item.label}
                </button>
              ))
            ) : (
              <>
                {isBarber && (
                  <Link href="/admin" style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: 6, border: '1.5px solid var(--gold-dark)', color: 'var(--gold-dark)', background: 'transparent', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold-dark)' }}>
                    Panel Admin
                  </Link>
                )}
                {user?.role === 'CLIENT' && (
                  [['Mis citas', '/mis-citas'], ['Portfolio', '/portfolio']].map(([label, href]) => (
                    <Link key={href} href={href} style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: 6, border: '1.5px solid var(--green)', color: 'var(--green)', background: 'transparent', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--green)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)' }}>
                      {label}
                    </Link>
                  ))
                )}
              </>
            )}
          </div>
          <div className="header-profile-btn" style={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <button onClick={() => setProfileOpen(true)}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--green-dark)', background: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                aria-label="Perfil">
                {user.image
                  ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '0.9rem', fontWeight: 700 }}>
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                }
              </button>
            ) : (
              <button onClick={() => signIn('google')}
                style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', fontWeight: 600, padding: '0.45rem 1.25rem', borderRadius: 6, border: '1.5px solid var(--green-dark)', color: 'var(--green-dark)', background: 'transparent', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--green-dark)' }}>
                Acceder
              </button>
            )}
          </div>
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
              <Link key={href} href={href} onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                {label}
              </Link>
            ))}
            <div style={{ borderBottom: '2.5px solid #c8c9c4', margin: '0 0 0.25rem' }} />
            {user?.role === 'CLIENT' && (
              <>
                {[['Mis citas', '/mis-citas'], ['Portfolio', '/portfolio']].map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setMobileMenu(false)}
                    style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, color: 'var(--green-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                    {label}
                  </Link>
                ))}
              </>
            )}
            {mobileMenuExtra ? (
              mobileMenuExtra.map(item => (
                <button key={item.label} onClick={() => { setMobileMenu(false); item.onClick() }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, color: 'var(--green-dark)', background: item.active ? 'var(--sage-light)' : 'none', border: 'none', borderBottom: '1px solid var(--cream-mid)', cursor: 'pointer', fontFamily: "'Barlow', sans-serif" }}>
                  {item.label}
                </button>
              ))
            ) : (
              isBarber && (
                <Link href="/admin" onClick={() => setMobileMenu(false)}
                  style={{ display: 'block', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-dark)', textDecoration: 'none', borderBottom: '1px solid var(--cream-mid)' }}>
                  Panel Admin
                </Link>
              )
            )}
            <div style={{ padding: '1rem 2rem' }}>
              {!user ? (
                <button onClick={() => { setMobileMenu(false); signIn('google') }}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--green-dark)', border: 'none', color: 'var(--cream)', fontFamily: "'Barlow', sans-serif", fontSize: '0.88rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>
                  Acceder / Registrarse
                </button>
              ) : (
                <button onClick={() => { setMobileMenu(false); setProfileOpen(true) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--green-dark)', flexShrink: 0 }}>
                    {user.image
                      ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontWeight: 700 }}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{user.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  )
}
