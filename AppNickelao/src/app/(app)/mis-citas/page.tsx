'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  service: { name: string; duration: number; price: number }
  barber: { location: string; user: { name: string; lastName: string } }
  review: null | { id: string }
}

function hoursUntil(dateStr: string) {
  return (new Date(dateStr).getTime() - Date.now()) / 3_600_000
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function formatTime(str: string) {
  return new Date(str).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function MisCitasPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'proximas' | 'historial'>('proximas')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewImage, setReviewImage] = useState<File | null>(null)
  const [reviewPreview, setReviewPreview] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(data => setAppointments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a =>
    a.status === 'CONFIRMED' && new Date(a.startTime) > new Date()
  )
  const past = appointments.filter(a =>
    a.status === 'COMPLETED' || (a.status !== 'CONFIRMED' && new Date(a.startTime) <= new Date())
  )

  async function handleCancel(id: string) {
    setCancellingId(id)
    setError('')
    const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' })
    setCancellingId(null)
    setConfirmCancel(null)
    if (res.ok) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
    } else {
      const data = await res.json()
      if (data.error === 'too_soon') setError('No puedes cancelar con menos de 12h de antelación.')
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setReviewImage(file)
    setReviewPreview(URL.createObjectURL(file))
  }

  async function handleReviewSubmit() {
    if (!reviewAppointment) return
    setSubmittingReview(true)

    let imageUrl: string | null = null

    if (reviewImage) {
      const formData = new FormData()
      formData.append('file', reviewImage)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        imageUrl = url
      }
    }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: reviewAppointment.id, text: reviewText, imageUrl }),
    })

    setSubmittingReview(false)

    if (res.ok) {
      setReviewSuccess(true)
      setAppointments(prev => prev.map(a =>
        a.id === reviewAppointment.id ? { ...a, review: { id: 'submitted' } } : a
      ))
      setTimeout(() => {
        setReviewAppointment(null)
        setReviewText('')
        setReviewImage(null)
        setReviewPreview(null)
        setReviewSuccess(false)
      }, 1800)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4E6]">
      <div className="bg-[#1E2A27] px-5 pt-14 pb-5">
        <h1 className="text-[#F5F4E6] text-2xl font-bold">Mis citas</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-[#E6E6E0]">
        {(['proximas', 'historial'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
              tab === t ? 'border-[#547832] text-[#547832]' : 'border-transparent text-[#A7A8A3]'
            }`}
          >
            {t === 'proximas' ? `Próximas (${upcoming.length})` : `Historial (${past.length})`}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-3 border border-red-200">
            {error}
          </div>
        )}

        {loading && <p className="text-center text-[#A7A8A3] py-12">Cargando…</p>}

        {/* Próximas */}
        {!loading && tab === 'proximas' && (
          <div className="flex flex-col gap-3">
            {upcoming.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#1E2A27] font-semibold">No tienes citas próximas</p>
                <button
                  onClick={() => router.push('/reservas')}
                  className="mt-4 bg-[#F2C230] text-[#1E2A27] font-bold px-6 py-3 rounded-xl text-sm"
                >
                  Reservar cita
                </button>
              </div>
            )}
            {upcoming.map(a => {
              const hours = hoursUntil(a.startTime)
              const canCancel = hours > 12
              return (
                <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6E6E0]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#1E2A27] text-base">{a.service.name}</p>
                      <p className="text-[#A7A8A3] text-xs mt-0.5">
                        {a.barber.user.name} · {a.barber.location === 'FOZ' ? 'Foz' : 'Mondoñedo'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#547832]">{a.service.price}€</p>
                      <p className="text-[#A7A8A3] text-xs">{a.service.duration} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#F5F4E6] rounded-xl px-3 py-2 mb-3">
                    <svg width="14" height="14" fill="none" stroke="#547832" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <span className="text-[#1E2A27] text-sm font-medium">{formatDate(a.startTime)}</span>
                    <span className="text-[#A7A8A3] text-sm">·</span>
                    <span className="text-[#1E2A27] text-sm font-medium">{formatTime(a.startTime)}</span>
                  </div>

                  {canCancel ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/reservas?reprogramar=${a.id}`)}
                        className="flex-1 border border-[#547832] text-[#547832] font-semibold py-2.5 rounded-xl text-sm"
                      >
                        Reprogramar
                      </button>
                      <button
                        onClick={() => setConfirmCancel(a.id)}
                        className="flex-1 border border-[#C8C9C4] text-[#A7A8A3] font-semibold py-2.5 rounded-xl text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#A7A8A3] text-center">
                      No se puede cancelar (menos de 12h)
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Historial */}
        {!loading && tab === 'historial' && (
          <div className="flex flex-col gap-3">
            {past.length === 0 && (
              <p className="text-center text-[#A7A8A3] py-12">No tienes citas anteriores</p>
            )}
            {past.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6E6E0]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-[#1E2A27]">{a.service.name}</p>
                    <p className="text-[#A7A8A3] text-xs mt-0.5">
                      {a.barber.user.name} · {formatDate(a.startTime)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    a.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                    'bg-[#F5F4E6] text-[#A7A8A3]'
                  }`}>
                    {a.status === 'COMPLETED' ? 'Completada' :
                     a.status === 'CANCELLED' ? 'Cancelada' : 'Pasada'}
                  </span>
                </div>

                {a.status === 'COMPLETED' && !a.review && (
                  <button
                    onClick={() => setReviewAppointment(a)}
                    className="w-full mt-2 bg-[#F2C230] text-[#1E2A27] font-bold py-2.5 rounded-xl text-sm"
                  >
                    Añadir reseña y foto · +5 pts ⭐
                  </button>
                )}
                {a.review && (
                  <p className="text-xs text-[#547832] font-medium text-center mt-2">✓ Reseña enviada</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirm modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E2A27] text-lg mb-2">¿Cancelar cita?</h3>
            <p className="text-[#A7A8A3] text-sm mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 border border-[#E6E6E0] text-[#A7A8A3] font-semibold py-3 rounded-xl"
              >
                Volver
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={cancellingId === confirmCancel}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {cancellingId === confirmCancel ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewAppointment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-[#E6E6E0] rounded-full mx-auto mb-5" />

            {reviewSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">⭐</div>
                <h3 className="font-bold text-[#1E2A27] text-xl">¡Gracias por tu reseña!</h3>
                <p className="text-[#547832] font-bold mt-2">+5 NickPoints añadidos</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-[#1E2A27] text-lg mb-1">Añadir reseña</h3>
                <p className="text-[#A7A8A3] text-sm mb-5">{reviewAppointment.service.name} · {formatDate(reviewAppointment.startTime)}</p>

                {/* Image picker */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-video bg-[#F5F4E6] rounded-2xl border-2 border-dashed border-[#C8C9C4] flex flex-col items-center justify-center mb-4 overflow-hidden"
                >
                  {reviewPreview ? (
                    <img src={reviewPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg width="28" height="28" fill="none" stroke="#A7A8A3" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <p className="text-[#A7A8A3] text-sm">Añadir foto del corte</p>
                      <p className="text-[#C8C9C4] text-xs mt-0.5">Toca para seleccionar</p>
                    </>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                {/* Text */}
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="¿Cómo fue tu experiencia? (opcional)"
                  rows={3}
                  className="w-full border border-[#E6E6E0] rounded-xl px-4 py-3 text-sm text-[#1E2A27] resize-none focus:outline-none focus:border-[#547832] mb-4"
                />

                <button
                  onClick={handleReviewSubmit}
                  disabled={submittingReview}
                  className="w-full bg-[#F2C230] text-[#1E2A27] font-bold py-4 rounded-2xl text-base disabled:opacity-50"
                >
                  {submittingReview ? 'Enviando…' : 'Enviar reseña · +5 pts ⭐'}
                </button>
                <button
                  onClick={() => setReviewAppointment(null)}
                  className="w-full text-[#A7A8A3] font-medium py-3 mt-1 text-sm"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
