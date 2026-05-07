'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type BarberInfo = { id: string; name: string }
type ApptData = { id: string; barberId: string; startTime: string; endTime: string; client: { name: string; phone: string }; barber: string; service: { name: string; duration: number } }
type BlockData = { id: string; barberId: string; startTime: string; endTime: string; reason: string | null }
type DbService = { id: string; name: string; duration: number; price: number; category: string }
type UserResult = { id: string; name: string | null; phone: string | null; email: string; isBlocked: boolean; blockedReason: string | null; blockedAt: string | null }
type BarberConfig = { id: string; name: string; location: string; isActive: boolean }

const MONTHS_ES  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const MONTHS_CAP = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_SHORT  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAY_ABBR   = ['D','L','M','X','J','V','S']

const LOCATION_MAP: Record<string, string> = { Foz: 'FOZ', 'Mondoñedo': 'MONDONEDO' }

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}

function timeToMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minToTime(m: number) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }

function isoToHHMM(iso: string) {
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getTimeRows(date: Date): string[] {
  const dow = date.getDay()
  if (dow === 0) return []
  const rows: string[] = []
  if (dow === 6) {
    for (let m = 540; m < 780; m += 30) rows.push(minToTime(m))
  } else {
    for (let m = 570; m < 810; m += 30)  rows.push(minToTime(m))
    for (let m = 960; m < 1230; m += 30) rows.push(minToTime(m))
  }
  return rows
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── MonthPicker ─────────────────────────────────────────────────────────────

function MonthPicker({ anchor, selected, today, onSelect, onClose }: {
  anchor: DOMRect | null
  selected: Date
  today: Date
  onSelect: (d: Date) => void
  onClose: () => void
}) {
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const startPad = firstDay.getDay()
  const cells = Array.from({ length: Math.ceil((startPad + lastDay.getDate()) / 7) * 7 }, (_, i) => {
    const d = i - startPad + 1
    return (d >= 1 && d <= lastDay.getDate()) ? new Date(month.getFullYear(), month.getMonth(), d) : null
  })

  return (
    <div ref={ref}
      style={{ position: 'fixed', top: (anchor?.bottom ?? 60) + 8, left: anchor ? Math.max(8, anchor.left) : 8, zIndex: 200, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(16,26,22,0.18)', padding: '1rem', width: 240, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#f0efe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E2A27" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E2A27' }}>
          {MONTHS_CAP[month.getMonth()]} {month.getFullYear()}
        </span>
        <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#f0efe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E2A27" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: 4 }}>
        {DAY_ABBR.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#A7A8A3', padding: '0.1rem 0', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const isSel   = isSameDay(date, selected)
          const isToday = isSameDay(date, today)
          const isSun   = date.getDay() === 0
          return (
            <button key={i} onClick={() => { if (!isSun) { onSelect(new Date(date)); onClose() } }}
              style={{ aspectRatio: '1', borderRadius: 6, border: isSel ? '2px solid #1E2A27' : '1px solid transparent', background: isSel ? '#1E2A27' : isToday ? '#f0efe1' : 'transparent', color: isSel ? '#F5F4E6' : isSun ? '#ddd' : '#1E2A27', fontSize: '0.75rem', fontWeight: isSel || isToday ? 700 : 400, cursor: isSun ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── ApptPopup ────────────────────────────────────────────────────────────────

function ApptPopup({ appt, onClose, onDeleted }: { appt: ApptData; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const startHHMM = isoToHHMM(appt.startTime)
  const endHHMM   = isoToHHMM(appt.endTime)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, { method: 'DELETE' })
      if (res.ok) { onDeleted(); onClose() }
    } finally { setDeleting(false) }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: 'min(400px, 92vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.25)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1E2A27', margin: 0 }}>Detalle de cita</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { label: 'Cliente',   value: appt.client.name },
            { label: 'Teléfono', value: appt.client.phone || '—' },
            { label: 'Servicio', value: appt.service.name },
            { label: 'Peluquero', value: appt.barber },
            { label: 'Hora',     value: `${startHHMM} – ${endHHMM}` },
            { label: 'Duración', value: `${appt.service.duration} min` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #f0efe1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A7A8A3' }}>{label}</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1E2A27' }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          {confirm ? (
            <>
              <button onClick={() => setConfirm(false)} disabled={deleting}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #e0dfd0', background: 'transparent', color: '#1E2A27', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', background: '#c0392b', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                {deleting ? 'Eliminando…' : 'Confirmar'}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', background: '#1E2A27', color: '#F5F4E6', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                Cerrar
              </button>
              <button onClick={() => setConfirm(true)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #c0392b', background: 'transparent', color: '#c0392b', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SlotModal ────────────────────────────────────────────────────────────────

function SlotModal({ time, barberId, barberName, date, onClose, onSuccess }: {
  time: string
  barberId: string
  barberName: string
  date: Date
  onClose: () => void
  onSuccess: () => void
}) {
  const [tab, setTab] = useState<'reservar' | 'bloquear'>('reservar')
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
  const [services, setServices] = useState<DbService[]>([])
  const [serviceId, setServiceId] = useState('')
  const [duration, setDuration] = useState('30')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dateStr = toDateStr(date)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.ok ? r.json() : [])
      .then((data: DbService[]) => { setServices(data); if (data.length > 0) setServiceId(data[0].id) })
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setUserResults([]); return }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
        .then(r => r.ok ? r.json() : [])
        .then(setUserResults)
    }, 300)
  }, [query])

  const categoryLabel: Record<string, string> = {
    POPULARES: 'Populares',
    CORTE: 'Corte',
    BARBA: 'Barba',
    COMBINADOS: 'Combinados',
  }

  const grouped = services.reduce<Record<string, DbService[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  async function handleReservar() {
    if (!selectedUser || !serviceId) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedUser.id, barberId, serviceId, startTime: `${dateStr}T${time}:00.000Z` }),
      })
      if (res.ok) { onSuccess(); onClose() }
    } finally { setSaving(false) }
  }

  async function handleBloquear() {
    setSaving(true)
    const start = new Date(`${dateStr}T${time}:00.000Z`)
    const end = new Date(start.getTime() + parseInt(duration) * 60 * 1000)
    try {
      const res = await fetch('/api/admin/unavailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId, startTime: start.toISOString(), endTime: end.toISOString(), reason: reason || undefined }),
      })
      if (res.ok) { onSuccess(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', width: 'min(440px, 96vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.25)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1E2A27', fontWeight: 700 }}>Slot {time}</div>
            <div style={{ fontSize: '0.75rem', color: '#A7A8A3', marginTop: 2 }}>{barberName} · {dateStr}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999' }}>✕</button>
        </div>

        <div style={{ display: 'flex', background: '#f5f4e6', borderRadius: 8, padding: 3, marginBottom: '1.25rem' }}>
          {(['reservar', 'bloquear'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: tab === t ? '#1E2A27' : 'transparent', color: tab === t ? '#F5F4E6' : '#1E2A27', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              {t === 'reservar' ? 'Reservar cliente' : 'Bloquear horario'}
            </button>
          ))}
        </div>

        {tab === 'reservar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedUser(null) }}
              placeholder="Buscar cliente por nombre o email..."
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
            {userResults.length > 0 && !selectedUser && (
              <div style={{ border: '1px solid #e0dfd0', borderRadius: 8, overflow: 'hidden', maxHeight: 180, overflowY: 'auto' }}>
                {userResults.map(u => (
                  <button key={u.id} onClick={() => { setSelectedUser(u); setQuery(u.name ?? u.email); setUserResults([]) }}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', border: 'none', borderBottom: '1px solid #f0efe1', background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E2A27' }}>{u.name ?? u.email}</span>
                    <span style={{ fontSize: '0.75rem', color: '#A7A8A3' }}>{u.phone ?? ''}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', background: '#eef6e6', borderRadius: 8, fontSize: '0.85rem', color: '#1E2A27', fontWeight: 600 }}>
                <span style={{ color: '#547832' }}>✓</span> {selectedUser.name ?? selectedUser.email}
              </div>
            )}
            <select value={serviceId} onChange={e => setServiceId(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', background: '#fff', outline: 'none' }}>
              {Object.entries(grouped).map(([cat, svcs]) => (
                <optgroup key={cat} label={categoryLabel[cat] ?? cat}>
                  {svcs.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration}min — {s.price}€)</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button onClick={handleReservar} disabled={!selectedUser || !serviceId || saving}
              style={{ padding: '0.75rem', borderRadius: 8, border: 'none', background: !selectedUser || !serviceId ? '#e0dfd0' : '#1E2A27', color: !selectedUser || !serviceId ? '#A7A8A3' : '#F5F4E6', fontWeight: 600, fontSize: '0.88rem', cursor: !selectedUser || !serviceId ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando…' : 'Confirmar reserva'}
            </button>
          </div>
        )}

        {tab === 'bloquear' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select value={duration} onChange={e => setDuration(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', background: '#fff', outline: 'none' }}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 min</option>
              <option value="120">2 horas</option>
            </select>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Vacaciones, formación, etc."
              style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', outline: 'none' }} />
            <button onClick={handleBloquear} disabled={saving}
              style={{ padding: '0.75rem', borderRadius: 8, border: 'none', background: '#1E2A27', color: '#F5F4E6', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
              {saving ? 'Guardando…' : 'Bloquear horario'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── BlockClientModal ─────────────────────────────────────────────────────────

function BlockClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clients, setClients] = useState<UserResult[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [reason, setReason] = useState('No asistencia')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.ok ? r.json() : [])
      .then((data: UserResult[]) => setClients(data.filter(u => !u.isBlocked)))
  }, [])

  async function handleBlock() {
    if (!selectedId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: true, blockedReason: reason }),
      })
      if (res.ok) { onSuccess(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,26,22,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', width: 'min(420px, 96vw)', boxShadow: '0 24px 64px rgba(16,26,22,0.25)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1E2A27', margin: 0 }}>Bloquear cliente</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', outline: 'none', background: '#fff', color: selectedId ? '#1E2A27' : '#A7A8A3' }}>
            <option value="">Seleccionar cliente…</option>
            {clients.map(u => (
              <option key={u.id} value={u.id}>{u.name ?? u.email}{u.phone ? ` · ${u.phone}` : ''}</option>
            ))}
          </select>
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Motivo del bloqueo"
            style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e0dfd0', fontSize: '0.88rem', outline: 'none' }} />
          <button onClick={handleBlock} disabled={!selectedId || saving}
            style={{ padding: '0.75rem', borderRadius: 8, border: 'none', background: !selectedId ? '#e0dfd0' : '#c0392b', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: !selectedId ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando…' : 'Bloquear cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────────

function BlockedSection() {
  const [blocked, setBlocked] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/admin/users?blocked=true')
      .then(r => r.ok ? r.json() : [])
      .then(setBlocked)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function unblock(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: false }),
    })
    load()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1E2A27', margin: 0 }}>Clientes bloqueados</h2>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', background: '#1E2A27', color: '#F5F4E6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          Bloquear cliente
        </button>
      </div>
      {loading ? (
        <div style={{ color: '#A7A8A3', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>Cargando…</div>
      ) : blocked.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#A7A8A3', fontSize: '0.95rem' }}>No hay clientes bloqueados</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {blocked.map(u => (
            <div key={u.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #e0dfd0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#1E2A27', fontSize: '0.95rem' }}>{u.name ?? u.email}</div>
                <div style={{ fontSize: '0.78rem', color: '#A7A8A3', marginTop: 2 }}>{u.phone ?? ''}</div>
                <div style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: 4 }}>
                  {u.blockedReason ?? 'No asistencia'}
                  {u.blockedAt ? ` · ${new Date(u.blockedAt).toLocaleDateString('es-ES')}` : ''}
                </div>
              </div>
              <button onClick={() => unblock(u.id)}
                style={{ padding: '0.45rem 1rem', borderRadius: 8, border: '1.5px solid #1E2A27', background: 'transparent', color: '#1E2A27', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                Desbloquear
              </button>
            </div>
          ))}
        </div>
      )}
      {showModal && <BlockClientModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  )
}

function ConfigSection({ role }: { role: string }) {
  const [barbers, setBarbers] = useState<BarberConfig[]>([])
  const [loading, setLoading] = useState(true)
  const canToggle = role === 'ADMIN_GENERAL'

  function load() {
    setLoading(true)
    fetch('/api/admin/barbers')
      .then(r => r.ok ? r.json() : [])
      .then(setBarbers)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggle(b: BarberConfig) {
    await fetch(`/api/admin/barbers/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    })
    load()
  }

  async function moveLocation(b: BarberConfig, loc: string) {
    await fetch(`/api/admin/barbers/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: loc }),
    })
    load()
  }

  const foz = barbers.filter(b => b.location === 'FOZ')
  const mondo = barbers.filter(b => b.location === 'MONDONEDO')

  function BarberCard({ b }: { b: BarberConfig }) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #e0dfd0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1E2A27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2C230', fontSize: '1.1rem', fontWeight: 700, flexShrink: 0 }}>
          {(b.name[0] ?? '?').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#1E2A27', fontSize: '0.95rem' }}>{b.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
            <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.6rem', borderRadius: 100, background: b.isActive ? '#eef6e6' : '#f0efe1', color: b.isActive ? '#547832' : '#A7A8A3' }}>
              {b.isActive ? 'Activo' : 'Inactivo / Vacaciones'}
            </span>
            {canToggle && (
              <select value={b.location} onChange={e => moveLocation(b, e.target.value)}
                style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 6, border: '1.5px solid #e0dfd0', background: '#f8f8f4', color: '#1E2A27', cursor: 'pointer', outline: 'none' }}>
                <option value="FOZ">Foz</option>
                <option value="MONDONEDO">Mondoñedo</option>
              </select>
            )}
          </div>
        </div>
        <button onClick={() => canToggle && toggle(b)}
          title={canToggle ? undefined : 'Solo el administrador puede modificar'}
          style={{ padding: '0.45rem 1rem', borderRadius: 8, border: '1.5px solid', borderColor: b.isActive ? '#c0392b' : '#547832', background: 'transparent', color: b.isActive ? '#c0392b' : '#547832', fontSize: '0.82rem', fontWeight: 600, cursor: canToggle ? 'pointer' : 'not-allowed', opacity: canToggle ? 1 : 0.4, flexShrink: 0 }}>
          {b.isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1E2A27', marginBottom: '1.5rem' }}>Configuración</h2>
      {loading ? (
        <div style={{ color: '#A7A8A3', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>Cargando…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A7A8A3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Foz</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {foz.map(b => <BarberCard key={b.id} b={b} />)}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A7A8A3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Mondoñedo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mondo.map(b => <BarberCard key={b.id} b={b} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ user: { name?: string | null; role?: string } } | null>(null)
  const [activeSection, setActiveSection] = useState<'calendario' | 'bloqueados' | 'configuracion'>('calendario')
  const [local, setLocal] = useState('Foz')
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [popup, setPopup] = useState<ApptData | null>(null)
  const [slotModal, setSlotModal] = useState<{ time: string; barberId: string; barberName: string; date: Date } | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [monthAnchor, setMonthAnchor] = useState<DOMRect | null>(null)
  const [barbers, setBarbers] = useState<BarberInfo[]>([])
  const [appointments, setAppointments] = useState<ApptData[]>([])
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(false)
  const [calVersion, setCalVersion] = useState(0)
  const monthBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.user) { router.push('/'); return }
        if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(data.user.role)) { router.push('/'); return }
        setSession(data)
      })
      .catch(() => router.push('/'))
  }, [router])

  useEffect(() => {
    if (!session || activeSection !== 'calendario') return
    if (selectedDate.getDay() === 0) { setBarbers([]); setAppointments([]); setBlocks([]); return }
    setLoading(true)
    fetch(`/api/admin/appointments?date=${toDateStr(selectedDate)}&location=${LOCATION_MAP[local]}`)
      .then(r => r.ok ? r.json() : { barbers: [], appointments: [], blocks: [] })
      .then(data => { setBarbers(data.barbers ?? []); setAppointments(data.appointments ?? []); setBlocks(data.blocks ?? []) })
      .finally(() => setLoading(false))
  }, [session, selectedDate, local, calVersion, activeSection])

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#A7A8A3' }}>Cargando…</span>
      </div>
    )
  }

  const isSunday   = selectedDate.getDay() === 0
  const isSaturday = selectedDate.getDay() === 6
  const timeRows   = getTimeRows(selectedDate)

  const barberAppts: Record<string, ApptData[]> = {}
  barbers.forEach(b => { barberAppts[b.id] = appointments.filter(a => a.barberId === b.id) })

  const barberBlocks: Record<string, BlockData[]> = {}
  barbers.forEach(b => { barberBlocks[b.id] = blocks.filter(bl => bl.barberId === b.id) })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  function selectDay(d: Date) {
    setSelectedDate(new Date(d))
    if (!isSameDay(d, weekDays[0]) && !isSameDay(d, weekDays[6])) return
    setWeekStart(getMonday(d))
  }

  const tabs: { key: 'calendario' | 'bloqueados' | 'configuracion'; label: string }[] = [
    { key: 'calendario', label: 'Calendario' },
    { key: 'bloqueados', label: 'Bloqueados' },
    { key: 'configuracion', label: 'Configuración' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4E6', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1E2A27', padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(16,26,22,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#F5F4E6' }}>Nickelao — Admin</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: 100, background: 'rgba(242,194,48,0.18)', color: '#F2C230', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {session.user.role}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveSection(t.key)}
              style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', background: activeSection === t.key ? 'rgba(242,194,48,0.18)' : 'transparent', color: activeSection === t.key ? '#F2C230' : 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeSection === 'calendario' && ['Foz', 'Mondoñedo'].map(l => (
            <button key={l} onClick={() => setLocal(l)}
              style={{ padding: '0.35rem 0.9rem', borderRadius: 6, border: '1.5px solid', borderColor: local === l ? '#F2C230' : 'rgba(255,255,255,0.2)', background: local === l ? 'rgba(242,194,48,0.15)' : 'transparent', color: local === l ? '#F2C230' : 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
          <a href="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginLeft: '0.75rem' }}>← Volver</a>
        </div>
      </header>

      {/* Calendario section */}
      {activeSection === 'calendario' && (
        <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Day strip */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e0dfd0', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 160 }}>
              <button onClick={prevWeek}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#f0efe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E2A27" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button ref={monthBtnRef}
                onClick={() => { setMonthAnchor(monthBtnRef.current?.getBoundingClientRect() ?? null); setShowMonthPicker(v => !v) }}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E2A27', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0.2rem 0.4rem', borderRadius: 6 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0efe1')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                {MONTHS_CAP[weekStart.getMonth()]} {weekStart.getFullYear()} ▾
              </button>
              <button onClick={nextWeek}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#f0efe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1E2A27" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flex: 1, justifyContent: 'center' }}>
              {weekDays.map((d, i) => {
                const isSel   = isSameDay(d, selectedDate)
                const isToday = isSameDay(d, today)
                const isSun   = d.getDay() === 0
                return (
                  <button key={i} onClick={() => { if (!isSun) selectDay(d) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: 10, border: isSel ? '2px solid #1E2A27' : isToday ? '1.5px solid #b5d89a' : '1.5px solid transparent', background: isSel ? '#1E2A27' : isToday ? '#eef6e6' : '#f5f4e6', cursor: isSun ? 'default' : 'pointer', minWidth: 42, opacity: isSun ? 0.3 : 1 }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isSel ? '#F2C230' : '#A7A8A3' }}>{DAY_SHORT[d.getDay()]}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: isSel ? '#fff' : '#1E2A27', lineHeight: 1.3 }}>{d.getDate()}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ textAlign: 'right', minWidth: 160 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.92rem', fontWeight: 700, color: '#1E2A27' }}>
                {DAY_SHORT[selectedDate.getDay()]} {selectedDate.getDate()} de {MONTHS_ES[selectedDate.getMonth()]}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#A7A8A3', marginTop: '0.05rem' }}>
                {isSunday ? 'Cerrado' : isSaturday ? '09:00 – 13:00' : '09:30–13:30 · 16:00–20:30'} · {local}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            {isSunday ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🔒</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1E2A27' }}>Cerrado los domingos</div>
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
                <span style={{ color: '#A7A8A3', fontSize: '0.9rem' }}>Cargando citas…</span>
              </div>
            ) : (
              <div style={{ minWidth: barbers.length * 200 + 60 }}>
                <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${barbers.length}, 1fr)`, borderBottom: '2px solid #e0dfd0', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 9 }}>
                  <div style={{ borderRight: '1px solid #e0dfd0' }} />
                  {barbers.map(b => (
                    <div key={b.id} style={{ padding: '0.75rem 1rem', borderRight: '1px solid #e0dfd0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1E2A27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2C230', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                        {b.name[0]}
                      </div>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.92rem', fontWeight: 700, color: '#1E2A27' }}>{b.name}</span>
                    </div>
                  ))}
                </div>

                {timeRows.map(time => {
                  const ROW_H = 52
                  const slotMin = timeToMin(time)
                  const isNow = isSameDay(selectedDate, today) &&
                    today.getHours() * 60 + today.getMinutes() >= slotMin &&
                    today.getHours() * 60 + today.getMinutes() < slotMin + 30
                  return (
                    <div key={time} style={{ display: 'grid', gridTemplateColumns: `60px repeat(${barbers.length}, 1fr)`, borderBottom: '1px solid #eeeddf', background: isNow ? '#fffbea' : '#fff', minHeight: ROW_H }}>
                      <div style={{ padding: '0.65rem 0.4rem', borderRight: '1px solid #e0dfd0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isNow ? '#c8960c' : '#A7A8A3' }}>{time}</span>
                      </div>
                      {barbers.map(b => {
                        const appt = barberAppts[b.id]?.find(a => {
                          const aStart = timeToMin(isoToHHMM(a.startTime))
                          const aEnd   = timeToMin(isoToHHMM(a.endTime))
                          return slotMin >= aStart && slotMin < aEnd
                        })
                        const isFirstApptRow = appt && timeRows.find(t => {
                          const m = timeToMin(t)
                          return m >= timeToMin(isoToHHMM(appt.startTime)) && m < timeToMin(isoToHHMM(appt.endTime))
                        }) === time

                        const block = !appt ? barberBlocks[b.id]?.find(bl => {
                          const bStart = timeToMin(isoToHHMM(bl.startTime))
                          const bEnd   = timeToMin(isoToHHMM(bl.endTime))
                          return slotMin >= bStart && slotMin < bEnd
                        }) : undefined
                        const isFirstBlockRow = block && timeRows.find(t => {
                          const m = timeToMin(t)
                          return m >= timeToMin(isoToHHMM(block.startTime)) && m < timeToMin(isoToHHMM(block.endTime))
                        }) === time

                        // Calculate pixel height from actual duration
                        const apptH = appt ? Math.max((appt.service.duration / 30) * ROW_H - 4, 24) : 0
                        const blockDurMin = block ? timeToMin(isoToHHMM(block.endTime)) - timeToMin(isoToHHMM(block.startTime)) : 0
                        const blockH = block ? Math.max((blockDurMin / 30) * ROW_H - 4, 24) : 0

                        return (
                          <div key={b.id} style={{ position: 'relative', borderRight: '1px solid #e0dfd0', minHeight: ROW_H, background: block ? 'repeating-linear-gradient(45deg,#f5f4e6,#f5f4e6 4px,#ede9d8 4px,#ede9d8 8px)' : undefined, overflow: 'visible' }}>
                            {isFirstApptRow && appt ? (
                              <button onClick={() => setPopup(appt)}
                                style={{ position: 'absolute', top: 2, left: 4, right: 4, height: apptH, zIndex: 2, background: '#1E2A27', borderRadius: 8, padding: '0.4rem 0.6rem', border: 'none', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(30,42,39,0.15)', overflow: 'hidden' }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5F4E6', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {appt.client.name.split(' ')[0]}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#F2C230', marginTop: '0.15rem' }}>
                                  {isoToHHMM(appt.startTime)} · {appt.service.duration}min
                                </div>
                              </button>
                            ) : isFirstBlockRow && block ? (
                              <div style={{ position: 'absolute', top: 2, left: 4, right: 4, height: blockH, zIndex: 2, background: 'rgba(160,160,150,0.18)', borderRadius: 8, padding: '0.4rem 0.6rem', border: '1.5px solid #c8c9c4', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem', overflow: 'hidden' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A7A8A3' }}>🔒 Bloqueado</div>
                                  {block.reason && <div style={{ fontSize: '0.65rem', color: '#A7A8A3', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.reason}</div>}
                                  <div style={{ fontSize: '0.6rem', color: '#C8C9C4', marginTop: '0.1rem' }}>{isoToHHMM(block.startTime)} – {isoToHHMM(block.endTime)}</div>
                                </div>
                                <button
                                  onClick={async () => {
                                    const res = await fetch(`/api/admin/unavailability/${block.id}`, { method: 'DELETE' })
                                    if (res.ok) setCalVersion(v => v + 1)
                                  }}
                                  title="Eliminar bloqueo"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '0.85rem', lineHeight: 1, padding: '0.1rem', flexShrink: 0 }}>
                                  ✕
                                </button>
                              </div>
                            ) : !appt && !block ? (
                              <button onClick={() => setSlotModal({ time, barberId: b.id, barberName: b.name, date: selectedDate })}
                                style={{ position: 'absolute', inset: 0, border: '1.5px dashed transparent', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e0dfd0'; e.currentTarget.style.background = '#fafaf5' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}>
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {activeSection === 'bloqueados' && <BlockedSection />}
      {activeSection === 'configuracion' && <ConfigSection role={session.user.role ?? ''} />}

      {showMonthPicker && (
        <MonthPicker
          anchor={monthAnchor}
          selected={selectedDate}
          today={today}
          onSelect={d => { setSelectedDate(d); setWeekStart(getMonday(d)) }}
          onClose={() => setShowMonthPicker(false)}
        />
      )}

      {popup && <ApptPopup appt={popup} onClose={() => setPopup(null)} onDeleted={() => setCalVersion(v => v + 1)} />}

      {slotModal && (
        <SlotModal
          time={slotModal.time}
          barberId={slotModal.barberId}
          barberName={slotModal.barberName}
          date={slotModal.date}
          onClose={() => setSlotModal(null)}
          onSuccess={() => setCalVersion(v => v + 1)}
        />
      )}
    </div>
  )

  function prevWeek() { setWeekStart(w => { const n = new Date(w); n.setDate(w.getDate() - 7); return n }) }
  function nextWeek() { setWeekStart(w => { const n = new Date(w); n.setDate(w.getDate() + 7); return n }) }
}
