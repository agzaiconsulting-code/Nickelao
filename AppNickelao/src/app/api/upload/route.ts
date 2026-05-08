import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
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

  const ext = file.name.split('.').pop() ?? 'jpg'
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
