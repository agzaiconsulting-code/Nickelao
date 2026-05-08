import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import MisCitasClient from './MisCitasClient'

export default async function MisCitasPage() {
  let user
  try { user = await getCurrentUser() } catch { user = null }
  if (!user) redirect('/')

  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: user.id },
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        service: { select: { name: true, duration: true, price: true } },
        barber: { select: { location: true, user: { select: { name: true } } } },
        review: { select: { id: true } },
      },
    })

    const serialized = appointments.map(a => ({
      ...a,
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
    }))

    return <MisCitasClient initialAppointments={serialized} initialPoints={user.points} />
  } catch {
    return <MisCitasClient initialAppointments={[]} initialPoints={user.points} />
  }
}
