import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN_GENERAL') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalClients,
    newClientsThisMonth,
    blockedClients,
    apptThisMonth,
    apptLastMonth,
    apptByStatus,
    apptByLocation,
    topServices,
    barberStats,
    totalPoints,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),

    prisma.user.count({ where: { role: 'CLIENT', createdAt: { gte: startOfMonth } } }),

    prisma.user.count({ where: { role: 'CLIENT', isBlocked: true } }),

    prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),

    prisma.appointment.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),

    prisma.appointment.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startOfMonth } },
      _count: { id: true },
    }),

    prisma.appointment.findMany({
      where: { createdAt: { gte: startOfMonth } },
      include: { barber: { select: { location: true } } },
    }).then(appts => {
      const foz = appts.filter(a => a.barber.location === 'FOZ').length
      const mondo = appts.filter(a => a.barber.location === 'MONDONEDO').length
      return { FOZ: foz, MONDONEDO: mondo }
    }),

    prisma.appointment.groupBy({
      by: ['serviceId'],
      where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }).then(async (rows) => {
      const ids = rows.map(r => r.serviceId)
      const services = await prisma.service.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
      const nameById = Object.fromEntries(services.map(s => [s.id, s.name]))
      return rows.map(r => ({ name: nameById[r.serviceId] ?? '—', count: r._count.id }))
    }),

    prisma.barber.findMany({
      include: {
        user: { select: { name: true } },
        appointments: {
          where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
          select: { id: true },
        },
      },
    }).then(barbers => barbers.map(b => ({
      name: b.user.name ?? '—',
      location: b.location,
      isActive: b.isActive,
      appts: b.appointments.length,
    }))),

    prisma.user.aggregate({ _sum: { points: true } }).then(r => r._sum.points ?? 0),

    prisma.appointment.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        startTime: true,
        status: true,
        client: { select: { name: true } },
        service: { select: { name: true } },
        barber: { select: { location: true, user: { select: { name: true } } } },
      },
    }),
  ])

  const cancelledThisMonth = apptByStatus.find(s => s.status === 'CANCELLED')?._count.id ?? 0
  const cancellationRate = apptThisMonth > 0 ? Math.round((cancelledThisMonth / apptThisMonth) * 100) : 0
  const monthGrowth = apptLastMonth > 0 ? Math.round(((apptThisMonth - apptLastMonth) / apptLastMonth) * 100) : null

  const statusMap: Record<string, number> = {}
  for (const row of apptByStatus) statusMap[row.status] = row._count.id

  return NextResponse.json({
    clients: { total: totalClients, newThisMonth: newClientsThisMonth, blocked: blockedClients },
    appointments: {
      thisMonth: apptThisMonth,
      lastMonth: apptLastMonth,
      monthGrowth,
      cancellationRate,
      byStatus: statusMap,
      byLocation: apptByLocation,
    },
    topServices,
    barbers: barberStats,
    totalPoints,
    recentActivity,
  })
}
