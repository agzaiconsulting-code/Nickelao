import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) return NextResponse.json({ error: 'No se encontró ninguna cuenta con ese email' }, { status: 404 })

  const store = await cookies()
  store.set('uid', user.id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}
