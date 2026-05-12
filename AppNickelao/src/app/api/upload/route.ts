import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rateLimit'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export async function POST(req: Request) {
  if (!rateLimit(getIp(req), 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('[upload] Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  const supabase = createClient(url, key)

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: jpeg, png, webp, gif' }, { status: 400 })
  }

  const rawExt = (file.name.split('.').pop() ?? '').toLowerCase()
  const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : 'jpg'
  const path = `portfolio/${user.id}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('nickelao')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload] Supabase storage error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 500 })
  }

  const { data } = supabase.storage.from('nickelao').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
