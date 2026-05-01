import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const nextAppointment = await prisma.appointment.findFirst({
    where: { clientId: user.id, status: 'CONFIRMED', startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    include: {
      service: true,
      barber: { include: { user: true } },
    },
  })

  return (
    <main className="min-h-screen bg-brand-cream">
      <header className="bg-brand-dark px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/logo.jpeg" alt="Nickelao Barber" width={48} height={48} loading="eager" className="rounded-xl border border-brand-yellow/40" />
          <div>
            <h1 className="font-display text-xl font-bold text-brand-cream">Nickelao Barber</h1>
            <p className="text-brand-gray1 text-xs">Hola, {user.name} 👋</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 flex flex-col gap-4 max-w-lg mx-auto">
        <Link
          href="/reservas"
          className="bg-brand-yellow text-brand-dark font-bold rounded-2xl p-5 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div>
            <p className="text-lg font-display font-bold">Reservar cita</p>
            <p className="text-sm font-normal opacity-70 mt-0.5">Elige local, servicio y hora</p>
          </div>
          <span className="text-3xl">✂️</span>
        </Link>

        {nextAppointment ? (
          <div className="bg-white rounded-2xl p-5 border border-brand-gray3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-green mb-3">Próxima cita</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-brand-dark text-lg">{nextAppointment.service.name}</p>
                <p className="text-brand-gray1 text-sm mt-0.5">
                  {nextAppointment.barber.user.name} · {nextAppointment.barber.location === 'FOZ' ? 'Foz' : 'Mondoñedo'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-dark">
                  {new Date(nextAppointment.startTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-brand-gray1 text-sm">
                  {new Date(nextAppointment.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-brand-gray3 text-center">
            <p className="text-brand-gray1 text-sm">No tienes citas próximas</p>
          </div>
        )}

        <div className="bg-brand-dark rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-yellow mb-1">NickPoints</p>
            <p className="font-display text-3xl font-bold text-brand-cream">{user.points}</p>
            <p className="text-brand-gray1 text-xs mt-1">{100 - user.points} para corte gratis</p>
          </div>
          <div className="text-5xl opacity-20">⭐</div>
        </div>
      </div>
    </main>
  )
}
