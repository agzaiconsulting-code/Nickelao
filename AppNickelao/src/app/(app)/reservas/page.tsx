'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Location = 'FOZ' | 'MONDONEDO'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
}

interface Barber {
  id: string
  location: Location
  user: { id: string; name: string; lastName: string }
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const CATEGORIES = ['POPULARES', 'CORTE', 'BARBA', 'COMBINADOS']
const CATEGORY_LABEL: Record<string, string> = {
  POPULARES: 'Populares', CORTE: 'Corte', BARBA: 'Barba', COMBINADOS: 'Combinados',
}

function getNext14Days() {
  const days = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ReservasPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState<Location | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [service, setService] = useState<Service | null>(null)
  const [activeCategory, setActiveCategory] = useState('POPULARES')
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [barber, setBarber] = useState<Barber | 'auto' | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [slot, setSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)
  const days = getNext14Days()

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (!location) return
    fetch(`/api/barbers?location=${location}`).then(r => r.json()).then(setBarbers)
  }, [location])

  useEffect(() => {
    if (!date || !service) return
    if (barber === null) return

    const barbersToFetch = barber === 'auto' ? barbers : [barber]
    if (barbersToFetch.length === 0) return

    setLoadingSlots(true)
    setSlots([])
    setSlot(null)

    const target = barber === 'auto' ? barbersToFetch[0] : barber
    fetch(`/api/slots?barberId=${target.id}&date=${date}&serviceId=${service.id}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false))
  }, [date, service, barber, barbers])

  async function handleConfirm() {
    if (!service || !date || !slot || barber === null) return
    const targetBarber = barber === 'auto' ? barbers[0] : barber
    if (!targetBarber) return

    const startTime = new Date(`${date}T${slot}:00`)
    setBooking(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barberId: targetBarber.id, serviceId: service.id, startTime }),
    })
    setBooking(false)

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/home'), 2500)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1E2A27] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-6xl">✂️</div>
        <h2 className="text-[#F5F4E6] text-2xl font-bold">¡Reserva confirmada!</h2>
        <div className="bg-[#F2C230] text-[#1E2A27] font-bold px-6 py-3 rounded-2xl text-lg">
          +5 NickPoints ⭐
        </div>
        <p className="text-[#A7A8A3] text-sm">Redirigiendo a inicio…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F4E6]">
      {/* Header */}
      <div className="bg-[#1E2A27] px-5 pt-14 pb-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as typeof step)} className="text-[#A7A8A3] p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          )}
          <div>
            <p className="text-[#A7A8A3] text-xs font-medium uppercase tracking-widest">Paso {step} de 4</p>
            <h1 className="text-[#F5F4E6] text-xl font-bold">
              {step === 1 && 'Elige local'}
              {step === 2 && 'Elige servicio'}
              {step === 3 && 'Peluquero y fecha'}
              {step === 4 && 'Elige hora'}
            </h1>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#F2C230]' : 'bg-[#2a3a35]'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {/* STEP 1 — Location */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {(['FOZ', 'MONDONEDO'] as Location[]).map(loc => (
              <button
                key={loc}
                onClick={() => { setLocation(loc); setStep(2) }}
                className="bg-white rounded-2xl p-5 text-left border-2 border-transparent hover:border-[#547832] active:scale-95 transition-all shadow-sm"
              >
                <div className="text-3xl mb-2">{loc === 'FOZ' ? '🏪' : '🏬'}</div>
                <p className="font-bold text-[#1E2A27] text-lg">{loc === 'FOZ' ? 'Foz' : 'Mondoñedo'}</p>
                <p className="text-[#A7A8A3] text-sm mt-0.5">
                  {loc === 'FOZ' ? 'Nick y Diego' : 'Roberto y Pepe'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Service */}
        {step === 2 && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#1E2A27] text-[#F5F4E6] border-[#1E2A27]'
                      : 'bg-white text-[#A7A8A3] border-[#E6E6E0]'
                  }`}
                >
                  {CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {services.filter(s => s.category === activeCategory).map(s => (
                <button
                  key={s.id}
                  onClick={() => { setService(s); setStep(3) }}
                  className={`bg-white rounded-2xl p-4 text-left border-2 transition-all shadow-sm active:scale-95 ${
                    service?.id === s.id ? 'border-[#547832]' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#1E2A27] leading-snug">{s.name}</p>
                    <p className="font-bold text-[#547832] shrink-0">{s.price}€</p>
                  </div>
                  <p className="text-[#A7A8A3] text-xs mt-1 leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-[#A7A8A3] text-xs">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    {s.duration} min
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Barber + Date */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#547832] mb-2">Peluquero</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setBarber('auto')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    barber === 'auto' ? 'bg-[#1E2A27] text-[#F5F4E6] border-[#1E2A27]' : 'bg-white text-[#1E2A27] border-[#E6E6E0]'
                  }`}
                >
                  Autoasignación
                </button>
                {barbers.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBarber(b)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      barber !== 'auto' && (barber as Barber)?.id === b.id
                        ? 'bg-[#1E2A27] text-[#F5F4E6] border-[#1E2A27]'
                        : 'bg-white text-[#1E2A27] border-[#E6E6E0]'
                    }`}
                  >
                    {b.user.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#547832] mb-2">Fecha</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map(d => {
                  const str = toDateStr(d)
                  const isSelected = date === str
                  const isSun = d.getDay() === 0
                  return (
                    <button
                      key={str}
                      disabled={isSun}
                      onClick={() => { setDate(str); if (barber !== null) setStep(4) }}
                      className={`shrink-0 flex flex-col items-center px-3 py-3 rounded-xl border-2 min-w-[56px] transition-colors disabled:opacity-30 ${
                        isSelected ? 'bg-[#1E2A27] border-[#1E2A27] text-[#F5F4E6]' : 'bg-white border-[#E6E6E0] text-[#1E2A27]'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase">{DAYS[d.getDay()]}</span>
                      <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                      <span className="text-[10px]">{MONTHS[d.getMonth()]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {barber !== null && date && (
              <button
                onClick={() => setStep(4)}
                className="bg-[#547832] text-white font-bold py-3.5 rounded-2xl w-full"
              >
                Ver horarios disponibles
              </button>
            )}
          </div>
        )}

        {/* STEP 4 — Slots */}
        {step === 4 && (
          <div>
            {loadingSlots ? (
              <div className="text-center py-12 text-[#A7A8A3]">Cargando horarios…</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#1E2A27] font-semibold">Sin disponibilidad</p>
                <p className="text-[#A7A8A3] text-sm mt-1">Prueba con otro día o peluquero</p>
                <button onClick={() => setStep(3)} className="mt-4 text-[#547832] font-semibold text-sm">
                  Cambiar fecha
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#A7A8A3] mb-3">
                  {service?.duration} min · {service?.price}€
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSlot(s); setShowConfirm(true) }}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                        slot === s ? 'bg-[#1E2A27] text-[#F5F4E6] border-[#1E2A27]' : 'bg-white text-[#1E2A27] border-[#E6E6E0]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && slot && service && date && barber !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 bg-[#E6E6E0] rounded-full mx-auto mb-6" />
            <h2 className="font-bold text-[#1E2A27] text-xl mb-4">Confirmar reserva</h2>

            <div className="flex flex-col gap-3 mb-6">
              {[
                { label: 'Local', value: location === 'FOZ' ? 'Foz' : 'Mondoñedo' },
                { label: 'Servicio', value: service.name },
                { label: 'Peluquero', value: barber === 'auto' ? 'Autoasignación' : `${(barber as Barber).user.name}` },
                { label: 'Fecha', value: new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: 'Hora', value: slot },
                { label: 'Precio', value: `${service.price}€` },
                { label: 'Duración', value: `${service.duration} min` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[#A7A8A3] text-sm">{row.label}</span>
                  <span className="text-[#1E2A27] font-semibold text-sm">{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={booking}
              className="w-full bg-[#F2C230] text-[#1E2A27] font-bold py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {booking ? 'Reservando…' : 'Confirmar cita'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full text-[#A7A8A3] font-medium py-3 mt-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
