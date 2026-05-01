'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface AppointmentItem {
  id: string
  startTime: string
  endTime: string
  status: string
  client: { name: string; lastName: string; phone: string | null; avatarUrl: string | null }
  service: { name: string; duration: number; price: number; category: string }
}

interface BlockItem {
  id: string
  startTime: string
  endTime: string
  reason: string | null
}

type DayData = { appointments: AppointmentItem[]; blocks: BlockItem[] }

const HOUR_HEIGHT = 60 // px per hour
const START_HOUR = 9
const END_HOUR = 20

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function minutesFromMidnight(dateStr: string) {
  const d = new Date(dateStr)
  return d.getHours() * 60 + d.getMinutes()
}

function dayLabel(d: Date) {
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isToday(d: Date) {
  return toDateStr(d) === toDateStr(new Date())
}

export default function AgendaPage() {
  const router = useRouter()
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const days = [today, tomorrow]

  const [data, setData] = useState<Record<string, DayData>>({})
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [showPlus, setShowPlus] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null)
  const [showUnavModal, setShowUnavModal] = useState(false)
  const [unavForm, setUnavForm] = useState({ date: toDateStr(today), startTime: '09:00', endTime: '10:00', reason: '' })
  const [savingUnav, setSavingUnav] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetches = days.map(d => {
      const str = toDateStr(d)
      return fetch(`/api/agenda?date=${str}`)
        .then(r => {
          if (r.status === 403) { setForbidden(true); return null }
          return r.json()
        })
        .then(json => json && setData(prev => ({ ...prev, [str]: json })))
    })
    Promise.all(fetches).finally(() => setLoading(false))

    // Scroll to current time on mount
    setTimeout(() => {
      if (scrollRef.current) {
        const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes()
        const offset = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT - 100
        scrollRef.current.scrollTop = Math.max(0, offset)
      }
    }, 100)
  }, [])

  async function handleAddUnavailability() {
    setSavingUnav(true)
    const startTime = new Date(`${unavForm.date}T${unavForm.startTime}:00`)
    const endTime = new Date(`${unavForm.date}T${unavForm.endTime}:00`)
    const res = await fetch('/api/agenda/unavailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime, endTime, reason: unavForm.reason || null }),
    })
    setSavingUnav(false)
    if (res.ok) {
      const block = await res.json()
      const dateStr = toDateStr(new Date(block.startTime))
      setData(prev => ({
        ...prev,
        [dateStr]: {
          appointments: prev[dateStr]?.appointments ?? [],
          blocks: [...(prev[dateStr]?.blocks ?? []), block],
        },
      }))
      setShowUnavModal(false)
    }
  }

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4E6] flex items-center justify-center">
        <p className="text-[#A7A8A3]">Cargando agenda…</p>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-[#F5F4E6] flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-[#1E2A27] font-bold text-lg">Acceso restringido</p>
        <p className="text-[#A7A8A3] text-sm">Esta sección es solo para peluqueros.</p>
        <button onClick={() => router.push('/home')} className="text-[#547832] font-semibold text-sm">
          Ir a inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F4E6] flex flex-col">
      {/* Header */}
      <div className="bg-[#1E2A27] px-5 pt-14 pb-4 flex-shrink-0">
        <h1 className="text-[#F5F4E6] text-2xl font-bold">Agenda</h1>
        <div className="flex gap-4 mt-1">
          {days.map(d => (
            <p key={toDateStr(d)} className={`text-sm font-medium ${isToday(d) ? 'text-[#F2C230]' : 'text-[#A7A8A3]'}`}>
              {isToday(d) ? 'Hoy' : 'Mañana'} · {d.getDate()} {d.toLocaleDateString('es-ES', { month: 'short' })}
            </p>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time labels */}
        <div className="w-12 flex-shrink-0 bg-white border-r border-[#E6E6E0] overflow-hidden">
          <div style={{ height: totalHeight + 32, paddingTop: 16 }}>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
              <div key={i} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-[#A7A8A3] font-medium">{String(START_HOUR + i).padStart(2, '0')}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Days columns */}
        <div ref={scrollRef} className="flex flex-1 overflow-y-auto overflow-x-hidden">
          {days.map(d => {
            const str = toDateStr(d)
            const dayData = data[str] ?? { appointments: [], blocks: [] }
            const isSun = d.getDay() === 0
            const isSat = d.getDay() === 6

            return (
              <div key={str} className="flex-1 relative border-r border-[#E6E6E0] last:border-r-0">
                {/* Sticky day header */}
                <div className={`sticky top-0 z-10 text-center py-2 text-xs font-bold border-b border-[#E6E6E0] ${
                  isToday(d) ? 'bg-[#1E2A27] text-[#F2C230]' : 'bg-white text-[#A7A8A3]'
                }`}>
                  {dayLabel(d)}
                </div>

                {/* Closed overlay */}
                {isSun && (
                  <div className="absolute inset-0 top-8 bg-[#F5F4E6]/80 flex items-center justify-center z-20">
                    <p className="text-[#A7A8A3] text-xs font-medium">Cerrado</p>
                  </div>
                )}

                {/* Hour grid lines */}
                <div className="relative" style={{ height: totalHeight }}>
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-[#E6E6E0]"
                      style={{ top: i * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div
                      key={`h${i}`}
                      className="absolute left-0 right-0 border-t border-[#E6E6E0]/50"
                      style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday(d) && (() => {
                    const now = new Date()
                    const mins = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60
                    if (mins < 0 || mins > (END_HOUR - START_HOUR) * 60) return null
                    const top = (mins / 60) * HOUR_HEIGHT
                    return (
                      <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top }}>
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 -ml-1" />
                        <div className="flex-1 h-px bg-red-500" />
                      </div>
                    )
                  })()}

                  {/* Unavailability blocks */}
                  {dayData.blocks.map(block => {
                    const startMins = minutesFromMidnight(block.startTime) - START_HOUR * 60
                    const endMins = minutesFromMidnight(block.endTime) - START_HOUR * 60
                    const duration = endMins - startMins
                    const top = (startMins / 60) * HOUR_HEIGHT
                    const height = (duration / 60) * HOUR_HEIGHT
                    return (
                      <div
                        key={block.id}
                        className="absolute left-1 right-1 rounded-lg bg-[#E6E6E0] border border-[#C8C9C4] overflow-hidden px-2 py-1"
                        style={{ top, height: Math.max(height, 24) }}
                      >
                        <p className="text-[10px] font-semibold text-[#A7A8A3] truncate">
                          {block.reason ?? 'Bloqueado'}
                        </p>
                      </div>
                    )
                  })}

                  {/* Appointments */}
                  {dayData.appointments.map(appt => {
                    const startMins = minutesFromMidnight(appt.startTime) - START_HOUR * 60
                    const endMins = minutesFromMidnight(appt.endTime) - START_HOUR * 60
                    const duration = endMins - startMins
                    const top = (startMins / 60) * HOUR_HEIGHT
                    const height = (duration / 60) * HOUR_HEIGHT
                    const isCompleted = appt.status === 'COMPLETED'

                    return (
                      <button
                        key={appt.id}
                        onClick={() => setSelectedAppt(appt)}
                        className={`absolute left-1 right-1 rounded-lg overflow-hidden px-2 py-1 text-left border ${
                          isCompleted
                            ? 'bg-[#547832]/20 border-[#547832]/40'
                            : 'bg-[#1E2A27] border-[#1E2A27]'
                        }`}
                        style={{ top, height: Math.max(height, 32) }}
                      >
                        <p className={`text-[11px] font-bold truncate ${isCompleted ? 'text-[#547832]' : 'text-[#F5F4E6]'}`}>
                          {appt.client.name} {appt.client.lastName}
                        </p>
                        {height > 40 && (
                          <p className={`text-[10px] truncate ${isCompleted ? 'text-[#547832]/70' : 'text-[#A7A8A3]'}`}>
                            {appt.service.name}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowPlus(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#F2C230] rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <svg width="24" height="24" fill="none" stroke="#1E2A27" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {/* FAB menu */}
      {showPlus && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPlus(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E6E6E0] rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-[#1E2A27] text-lg mb-4">Añadir</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowPlus(false); router.push('/reservas') }}
                className="flex items-center gap-4 p-4 bg-[#F5F4E6] rounded-2xl"
              >
                <div className="w-10 h-10 bg-[#1E2A27] rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="#F5F4E6" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#1E2A27]">Reservar cliente</p>
                  <p className="text-[#A7A8A3] text-xs">Crear cita a nombre de un cliente</p>
                </div>
              </button>
              <button
                onClick={() => { setShowPlus(false); setShowUnavModal(true) }}
                className="flex items-center gap-4 p-4 bg-[#F5F4E6] rounded-2xl"
              >
                <div className="w-10 h-10 bg-[#C8C9C4] rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="#1E2A27" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#1E2A27]">Añadir indisponibilidad</p>
                  <p className="text-[#A7A8A3] text-xs">Bloquear un horario</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelectedAppt(null)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E6E6E0] rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#547832] flex items-center justify-center font-bold text-white text-lg overflow-hidden">
                {selectedAppt.client.avatarUrl
                  ? <img src={selectedAppt.client.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : `${selectedAppt.client.name[0]}${selectedAppt.client.lastName[0]}`
                }
              </div>
              <div>
                <p className="font-bold text-[#1E2A27] text-lg">{selectedAppt.client.name} {selectedAppt.client.lastName}</p>
                {selectedAppt.client.phone && (
                  <a href={`tel:${selectedAppt.client.phone}`} className="text-[#547832] text-sm font-medium">
                    {selectedAppt.client.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'Servicio', value: selectedAppt.service.name },
                { label: 'Duración', value: `${selectedAppt.service.duration} min` },
                { label: 'Precio', value: `${selectedAppt.service.price}€` },
                { label: 'Hora', value: `${new Date(selectedAppt.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} – ${new Date(selectedAppt.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` },
                { label: 'Estado', value: selectedAppt.status === 'COMPLETED' ? 'Completada' : 'Confirmada' },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#A7A8A3] text-sm">{row.label}</span>
                  <span className="text-[#1E2A27] font-semibold text-sm">{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedAppt(null)}
              className="w-full border border-[#E6E6E0] text-[#A7A8A3] font-semibold py-3.5 rounded-2xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Unavailability modal */}
      {showUnavModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 bg-[#E6E6E0] rounded-full mx-auto mb-5" />
            <h3 className="font-bold text-[#1E2A27] text-lg mb-4">Añadir bloqueo</h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Fecha</label>
                <input
                  type="date"
                  value={unavForm.date}
                  onChange={e => setUnavForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#547832]"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Desde</label>
                  <input
                    type="time"
                    value={unavForm.startTime}
                    onChange={e => setUnavForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#547832]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Hasta</label>
                  <input
                    type="time"
                    value={unavForm.endTime}
                    onChange={e => setUnavForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#547832]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#A7A8A3] font-medium mb-1 block">Motivo (opcional)</label>
                <input
                  value={unavForm.reason}
                  onChange={e => setUnavForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Vacaciones, formación…"
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#547832]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowUnavModal(false)}
                className="flex-1 border border-[#E6E6E0] text-[#A7A8A3] font-semibold py-3.5 rounded-2xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUnavailability}
                disabled={savingUnav}
                className="flex-1 bg-[#1E2A27] text-[#F5F4E6] font-bold py-3.5 rounded-2xl disabled:opacity-50"
              >
                {savingUnav ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
