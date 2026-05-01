import { PrismaClient, ServiceCategory } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
})

const services = [
  // POPULARES
  { name: 'Corte tendencia o degradado', description: 'Cortes de cabello tendencia o degradados hasta nº0.5', duration: 30, price: 13, category: ServiceCategory.POPULARES },
  { name: 'Corte de cabello + diseño de barba', description: 'Corte de cabello y diseño de barba. No incluye cortes técnicos o pelo/barba larga', duration: 45, price: 20, category: ServiceCategory.POPULARES },
  { name: 'Corte de cabello o rapado', description: 'Cortes de cabello hasta el nº1 o rapados hasta nº6', duration: 25, price: 12, category: ServiceCategory.POPULARES },
  // CORTE
  { name: 'Afeitado de cabeza', description: 'Afeitado de cabeza con shaver y su respectivo cuidado', duration: 20, price: 10, category: ServiceCategory.CORTE },
  { name: 'Lavado de cabeza y peinado', description: 'Lavado de cabeza, masaje y peinado', duration: 10, price: 5, category: ServiceCategory.CORTE },
  { name: 'Corte jubilado y niños', description: 'Corte de cabello para jubilados y niños menores de 8 años', duration: 20, price: 11, category: ServiceCategory.CORTE },
  { name: 'Corte técnico o pelo largo', description: 'Corte de cabello con dificultad técnica o cabello largo. Incluye lavado', duration: 45, price: 17, category: ServiceCategory.CORTE },
  { name: 'Diseño de cuello y patillas', description: 'Arreglo y diseño de cuello y patillas para mantenimiento del corte', duration: 15, price: 7, category: ServiceCategory.CORTE },
  // BARBA
  { name: 'Diseño de la barba y/o degradado', description: 'Diseño de barba tendencia o degradados con su perfilado', duration: 20, price: 10, category: ServiceCategory.BARBA },
  { name: 'Afeitado clásico', description: 'Afeitado de barba clásico a navaja con masaje y cuidados', duration: 30, price: 12, category: ServiceCategory.BARBA },
  { name: 'Arreglo de barba', description: 'Barba rebajada a máquina y mantenimiento de su perfilado', duration: 15, price: 8, category: ServiceCategory.BARBA },
  { name: 'Diseño y cuidado de barba larga', description: 'Diseño, cuidados y mantenimiento de barba larga', duration: 30, price: 12, category: ServiceCategory.BARBA },
  // COMBINADOS
  { name: 'Afeitado de cabeza + diseño de barba', description: 'Afeitado de cabeza con diseño de barba. No incluye barba larga', duration: 35, price: 17, category: ServiceCategory.COMBINADOS },
  { name: 'Pack completo', description: 'Lavado + corte (no incluye corte técnico o pelo largo) + barba (no incluye barba larga)', duration: 55, price: 25, category: ServiceCategory.COMBINADOS },
  { name: 'Lavado + corte', description: 'Corte de cabello (no incluye corte técnico o pelo largo) más lavado de cabeza', duration: 35, price: 16, category: ServiceCategory.COMBINADOS },
]

const barbers = [
  { clerkId: 'barber_nick', email: 'nick@nickelao.com', name: 'Nick', lastName: 'Barber', location: 'FOZ' as const },
  { clerkId: 'barber_diego', email: 'diego@nickelao.com', name: 'Diego', lastName: 'Barber', location: 'FOZ' as const },
  { clerkId: 'barber_roberto', email: 'roberto@nickelao.com', name: 'Roberto', lastName: 'Barber', location: 'MONDONEDO' as const },
  { clerkId: 'barber_pepe', email: 'pepe@nickelao.com', name: 'Pepe', lastName: 'Barber', location: 'MONDONEDO' as const },
]

async function main() {
  console.log('Seeding services…')
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name } as never,
      update: service,
      create: service,
    })
  }
  console.log(`✓ ${services.length} servicios insertados`)

  console.log('Seeding barbers…')
  for (const b of barbers) {
    const user = await prisma.user.upsert({
      where: { clerkId: b.clerkId },
      update: { name: b.name, lastName: b.lastName, email: b.email },
      create: { clerkId: b.clerkId, email: b.email, name: b.name, lastName: b.lastName, role: 'BARBER' },
    })
    await prisma.barber.upsert({
      where: { userId: user.id },
      update: { location: b.location },
      create: { userId: user.id, location: b.location, isActive: true },
    })
  }
  console.log(`✓ ${barbers.length} peluqueros insertados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
