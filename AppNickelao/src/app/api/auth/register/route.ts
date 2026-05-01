import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { name, lastName, email, phone } = await req.json()
  if (!name || !lastName || !email) {
    return NextResponse.json({ error: 'Nombre, apellidos y email son obligatorios' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: {
      clerkId: `local_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name,
      lastName,
      phone: phone ?? null,
    },
  })

  const store = await cookies()
  store.set('uid', user.id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
