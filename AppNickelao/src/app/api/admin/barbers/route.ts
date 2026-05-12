import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN_GENERAL') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, location } = await req.json() as { name?: string; email?: string; location?: string }

  if (!name?.trim() || !email?.trim() || !location) {
    return NextResponse.json({ error: 'name, email y location son obligatorios' }, { status: 400 })
  }
  if (!['FOZ', 'MONDONEDO'].includes(location)) {
    return NextResponse.json({ error: 'Localización inválida' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'BARBER',
      barber: { create: { location: location as 'FOZ' | 'MONDONEDO', isActive: true } },
    },
    include: { barber: true },
  })

  return NextResponse.json({
    id: newUser.barber!.id,
    name: newUser.name ?? '',
    location: newUser.barber!.location,
    isActive: newUser.barber!.isActive,
  }, { status: 201 })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const barbers = await prisma.barber.findMany({
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(
    barbers.map(b => ({
      id: b.id,
      name: b.user.name ?? '',
      location: b.location,
      isActive: b.isActive,
    }))
  )
}
