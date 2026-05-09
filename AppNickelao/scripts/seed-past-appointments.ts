import { PrismaClient, AppointmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

const CLIENT_ID  = 'cmot4g50o00082ea4or0a3wr8'

// Barbers
const NICK  = 'cmolnkvsk000h1n806pyje6df'
const DIEGO = 'cmolnkvx9000k1n8070t0mizp'

// Services
const CORTE_DEGRADADO  = 'cmolmnxw900005bs9xzoq9k76' // 30min, 13€
const CORTE_BARBA      = 'cmolmnxzi00015bs9iyw5hi5u' // 45min, 20€
const CORTE_RAPADO     = 'cmolmny1400025bs9osn3lnnk' // 25min, 12€
const DISENO_BARBA     = 'cmolmnyao00085bs9mfr8i9j5' // 20min, 10€
const PACK_COMPLETO    = 'cmolmnyio000d5bs97b14homx' // 55min, 25€
const AFEITADO_CLASICO = 'cmolmnyc900095bs9m0617bbu' // 30min, 12€
const LAVADO_CORTE     = 'cmolmnyka000e5bs9cxob6sbi' // 35min, 16€

function dt(dateStr: string, hour: number, minute = 0) {
  return new Date(`${dateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00.000Z`)
}

async function main() {
  const appointments = [
    {
      clientId: CLIENT_ID, barberId: NICK, serviceId: CORTE_DEGRADADO,
      startTime: dt('2025-04-02', 10), endTime: dt('2025-04-02', 10, 30),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: DIEGO, serviceId: CORTE_BARBA,
      startTime: dt('2025-04-15', 11), endTime: dt('2025-04-15', 11, 45),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: NICK, serviceId: PACK_COMPLETO,
      startTime: dt('2025-04-28', 9, 30), endTime: dt('2025-04-28', 10, 25),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: NICK, serviceId: CORTE_DEGRADADO,
      startTime: dt('2025-03-10', 16), endTime: dt('2025-03-10', 16, 30),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: DIEGO, serviceId: DISENO_BARBA,
      startTime: dt('2025-03-22', 10, 30), endTime: dt('2025-03-22', 10, 50),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: NICK, serviceId: LAVADO_CORTE,
      startTime: dt('2025-02-14', 17), endTime: dt('2025-02-14', 17, 35),
      status: AppointmentStatus.COMPLETED,
    },
    {
      clientId: CLIENT_ID, barberId: NICK, serviceId: CORTE_RAPADO,
      startTime: dt('2025-01-20', 9, 30), endTime: dt('2025-01-20', 9, 55),
      status: AppointmentStatus.CANCELLED,
    },
    {
      clientId: CLIENT_ID, barberId: DIEGO, serviceId: AFEITADO_CLASICO,
      startTime: dt('2025-05-02', 11), endTime: dt('2025-05-02', 11, 30),
      status: AppointmentStatus.COMPLETED,
    },
  ]

  for (const data of appointments) {
    const a = await prisma.appointment.create({ data })
    console.log(`Created: ${a.id} — ${data.startTime.toISOString().slice(0,10)} ${data.status}`)
  }

  console.log('\nDone — 8 past appointments created.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
