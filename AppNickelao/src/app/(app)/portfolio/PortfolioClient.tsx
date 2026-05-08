'use client'

import { useState } from 'react'

interface Comment {
  id: string
  text: string
  createdAt: string
  user: { name: string | null; image: string | null }
}

export interface PortfolioImage {
  id: string
  imageUrl: string
  createdAt: string
  client: { name: string | null; image: string | null }
  review: { rating: number; text: string | null } | null
  comments: Comment[]
  _count: { comments: number }
}

function Avatar({ name, image, size = 8 }: { name: string | null; image: string | null; size?: number }) {
  const sz = `w-${size} h-${size}`
  return (
    <div className={`${sz} rounded-full bg-[#547832] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden`}>
      {image
        ? <img src={image} alt="" className="w-full h-full object-cover" />
        : name?.[0]?.toUpperCase() ?? '?'
      }
    </div>
  )
}

function formatRelative(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function PostCard({ img, onComment }: { img: PortfolioImage; onComment: (imageId: string, text: string) => Promise<void> }) {
  const [showComments, setShowComments] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setPosting(true)
    await onComment(img.id, text)
    setText('')
    setPosting(false)
    setShowComments(true)
  }

  return (
    <article className="bg-white border-b border-[#E6E6E0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={img.client.name} image={img.client.image} size={9} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1E2A27] leading-none">{img.client.name ?? 'Cliente'}</p>
          <p className="text-xs text-[#A7A8A3] mt-0.5">Nickelao Barber · {formatRelative(img.createdAt)}</p>
        </div>
        {img.review && (
          <span className="text-[#F2C230] text-sm shrink-0">
            {'★'.repeat(img.review.rating)}{'☆'.repeat(5 - img.review.rating)}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square w-full bg-[#E6E6E0]">
        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Review text */}
      {img.review?.text && (
        <p className="px-4 pt-3 pb-1 text-sm text-[#1E2A27]">
          <span className="font-semibold">{img.client.name ?? 'Cliente'}</span>
          {' '}{img.review.text}
        </p>
      )}

      {/* Actions row */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-4">
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-[#A7A8A3]"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {img._count.comments > 0 && (
            <span className="text-xs font-semibold">{img._count.comments}</span>
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && img.comments.length > 0 && (
        <div className="px-4 pb-2 flex flex-col gap-2">
          {img.comments.map(c => (
            <div key={c.id} className="flex gap-2 items-start">
              <Avatar name={c.user.name} image={c.user.image} size={6} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-[#1E2A27]">{c.user.name} </span>
                <span className="text-xs text-[#1E2A27]">{c.text}</span>
              </div>
              <span className="text-[10px] text-[#A7A8A3] shrink-0 mt-0.5">{formatRelative(c.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-[#F5F4E6]">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Añade un comentario…"
          className="flex-1 text-sm text-[#1E2A27] placeholder-[#A7A8A3] bg-transparent focus:outline-none py-1"
        />
        {text.trim() && (
          <button
            onClick={submit}
            disabled={posting}
            className="text-[#547832] text-sm font-bold shrink-0 disabled:opacity-40"
          >
            {posting ? '…' : 'Publicar'}
          </button>
        )}
      </div>
    </article>
  )
}

export default function PortfolioClient({ initialImages }: { initialImages: PortfolioImage[] }) {
  const [images, setImages] = useState<PortfolioImage[]>(initialImages)

  async function handleComment(imageId: string, text: string) {
    const res = await fetch(`/api/portfolio/${imageId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, comments: [...img.comments, newComment], _count: { comments: img._count.comments + 1 } }
          : img
      ))
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4E6]">
      <div className="bg-[#1E2A27] px-5 pt-6 pb-5">
        <h1 className="text-[#F5F4E6] text-2xl font-bold">Portfolio</h1>
        <p className="text-[#A7A8A3] text-sm mt-1">Trabajos de nuestros clientes</p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="text-5xl mb-4">✂️</div>
          <p className="text-[#1E2A27] font-semibold">Aún no hay fotos</p>
          <p className="text-[#A7A8A3] text-sm mt-1">Las fotos aparecerán aquí cuando los clientes suban sus cortes</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto">
          {images.map(img => (
            <PostCard key={img.id} img={img} onComment={handleComment} />
          ))}
        </div>
      )}
    </div>
  )
}
