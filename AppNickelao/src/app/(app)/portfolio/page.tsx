'use client'

import { useEffect, useState } from 'react'

interface Comment {
  id: string
  text: string
  createdAt: string
  user: { name: string; avatarUrl: string | null }
}

interface PortfolioImage {
  id: string
  imageUrl: string
  createdAt: string
  client: { name: string; lastName: string; avatarUrl: string | null }
  comments: Comment[]
  _count: { comments: number }
}

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<PortfolioImage | null>(null)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetch('/api/portfolio')
      .then(r => r.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  async function handleComment(imageId: string) {
    if (!comment.trim()) return
    setPosting(true)
    const res = await fetch(`/api/portfolio/${imageId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, comments: [...img.comments, newComment], _count: { comments: img._count.comments + 1 } }
          : img
      ))
      if (open?.id === imageId) {
        setOpen(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null)
      }
      setComment('')
    }
    setPosting(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F4E6]">
      {/* Header */}
      <div className="bg-[#1E2A27] px-5 pt-14 pb-5">
        <h1 className="text-[#F5F4E6] text-2xl font-bold">Portfolio</h1>
        <p className="text-[#A7A8A3] text-sm mt-1">Trabajos de nuestros barberos</p>
      </div>

      {loading && (
        <p className="text-center text-[#A7A8A3] py-16">Cargando…</p>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center py-16 px-6">
          <div className="text-5xl mb-4">✂️</div>
          <p className="text-[#1E2A27] font-semibold">Aún no hay fotos</p>
          <p className="text-[#A7A8A3] text-sm mt-1">Las fotos aparecerán aquí cuando los clientes suban sus cortes</p>
        </div>
      )}

      {/* Grid */}
      {!loading && images.length > 0 && (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {images.map(img => (
            <button
              key={img.id}
              onClick={() => setOpen(img)}
              className="relative aspect-square bg-[#E6E6E0] overflow-hidden"
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
              {img._count.comments > 0 && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                  <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  <span className="text-white text-[10px] font-bold">{img._count.comments}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-black">
            <button onClick={() => setOpen(null)} className="text-white p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#547832] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {open.client.avatarUrl
                  ? <img src={open.client.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : `${open.client.name[0]}${open.client.lastName[0]}`
                }
              </div>
              <p className="text-white text-sm font-semibold">{open.client.name} {open.client.lastName}</p>
            </div>
          </div>

          {/* Image */}
          <div className="aspect-square w-full bg-black flex-shrink-0">
            <img src={open.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Comments */}
          <div className="flex-1 bg-white overflow-y-auto">
            {open.comments.length === 0 && (
              <p className="text-center text-[#A7A8A3] text-sm py-6">Sin comentarios aún</p>
            )}
            {open.comments.map(c => (
              <div key={c.id} className="flex gap-3 px-4 py-3 border-b border-[#F5F4E6]">
                <div className="w-8 h-8 rounded-full bg-[#547832] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                  {c.user.avatarUrl
                    ? <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : c.user.name[0]
                  }
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1E2A27]">{c.user.name}</p>
                  <p className="text-sm text-[#1E2A27] mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="bg-white border-t border-[#E6E6E0] px-4 py-3 flex gap-3 items-center pb-safe">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment(open.id)}
              placeholder="Añade un comentario…"
              className="flex-1 bg-[#F5F4E6] rounded-full px-4 py-2.5 text-sm text-[#1E2A27] focus:outline-none"
            />
            <button
              onClick={() => handleComment(open.id)}
              disabled={posting || !comment.trim()}
              className="text-[#547832] font-bold text-sm disabled:opacity-40"
            >
              Publicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
