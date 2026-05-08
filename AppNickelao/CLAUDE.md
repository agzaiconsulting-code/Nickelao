# CLAUDE.md — Nickelao Barber App

## Comandos

- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Test: `npm test` / individual: `npm test src/lib/example.test.ts`
- Lint: `npm run lint`
- Seed BD: `npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts`

---

## Stack real (rama `prelive`)

- **Next.js 16** App Router · TypeScript · Tailwind CSS **v3** (`tailwind.config.ts`)
- **NextAuth v4** — Google OAuth · sesión por cookie `next-auth.session-token`
- **Prisma + Supabase** (PostgreSQL con pgBouncer) · `src/lib/prisma.ts`
- **Autenticación**: `getCurrentUser()` en `src/lib/auth.ts` — devuelve usuario desde sesión + BD
- Capacitor (iOS/Android) — pendiente

> Tailwind v4 se instala por defecto con `create-next-app` — este proyecto usa **v3**. No actualizar.

---

## Design System

```
#1E2A27  dark-green  — fondo hero, headers, paneles
#547832  green       — acentos, botones secundarios
#F2C230  yellow      — CTAs, badges, NickPoints
#F5F4E6  cream       — fondo base
#A7A8A3  gray-1      — texto secundario
#C8C9C4  gray-2      — bordes, separadores
#e0dfd0  border      — bordes suaves (usado en admin)
```

Logo: `public/logo.jpeg`. Fuentes: Playfair Display (títulos) + DM Sans (UI).
El panel `/admin` usa **inline styles** exclusivamente (sin Tailwind).

---

## Locales y equipo

| Local | Barberos |
|---|---|
| Foz (`FOZ`) | Nick, Diego |
| Mondoñedo (`MONDONEDO`) | Roberto, Pepe |

**Horario real:** Lun–Vie 09:30–13:30 y 16:00–20:30 · Sáb 09:00–13:00 · Dom cerrado

---

## Roles (`src/types/next-auth.d.ts`)

| Rol | Acceso |
|---|---|
| `CLIENT` | Reservas, mis citas, perfil, portafolio, NickPoints |
| `BARBER` | Panel admin (calendario + bloqueados), sin mis citas ni NickPoints |
| `ADMIN_SHOP` | Todo BARBER + bloquear clientes |
| `ADMIN_GENERAL` | Todo ADMIN_SHOP + cambiar roles, activar/desactivar peluqueros, cambiar peluquero de local |

---

## Convención UTC

> Los tiempos se almacenan y comparan como **UTC tratado como hora local española** en todo el sistema. El navegador envía `${dateStr}T${HH:MM}:00.000Z`, el servidor consulta con límites UTC del día, y `isoToHHMM` usa `getUTCHours()`/`getUTCMinutes()`. Uniformemente "incorrecto" por offset pero consistente.

---

## Páginas implementadas

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Landing pública con formulario de reservas integrado |
| `/home` | ✅ | Home clientes — próxima cita + CTA reservar |
| `/reservas` | ✅ | Flujo de 4 pasos: local → servicio → peluquero → slot |
| `/mis-citas` | ✅ | Próximas (cancelar >12h) + historial |
| `/perfil` | ✅ | Datos usuario, foto, NickPoints |
| `/portfolio` | ✅ | Grid fotos + comentarios |
| `/admin` | ✅ | Panel admin (ver abajo) |
| `/sign-in`, `/sign-up` | ✅ | NextAuth Google OAuth |
| `/complete-profile` | ✅ | Recoge teléfono tras primer login |
| `/agenda` | ⚠️ | Vista peluquero individual — parcialmente implementada |

---

## Panel de administración (`/admin`)

Tres tabs: **Calendario · Bloqueados · Configuración**

### Calendario
- Selector semanal de días + picker de mes
- Columnas por peluquero del local seleccionado
- Filas cada 30 min según horario real
- **Citas** (fondo oscuro): click → popup con detalle + botón eliminar (con confirmación)
- **Bloqueos** (fondo rayado gris): click ✕ → elimina directamente
- **Slot vacío**: click → `SlotModal` con dos tabs:
  - *Reservar cliente*: buscar cliente + seleccionar servicio → `POST /api/admin/book`
  - *Bloquear horario*: duración + motivo → `POST /api/admin/unavailability`

### Bloqueados
- Lista de clientes bloqueados con motivo y fecha
- Botón "Bloquear cliente": desplegable con todos los clientes + campo motivo
- Botón "Desbloquear" por cliente

### Configuración
- Tarjetas por peluquero agrupadas por local
- **Activar/Desactivar** (solo `ADMIN_GENERAL`)
- **Cambiar de peluquería** — selector Foz/Mondoñedo (solo `ADMIN_GENERAL`)
- Peluqueros y `ADMIN_SHOP` ven la sección en modo solo lectura

---

## APIs implementadas

### Públicas / cliente
| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth Google OAuth |
| `/api/barbers` | GET | Barberos activos por local (`?location=FOZ\|MONDONEDO`) |
| `/api/services` | GET | Catálogo de servicios |
| `/api/slots` | GET | Slots disponibles (`?barberIds=&date=&duration=`) |
| `/api/appointments` | POST | Crear reserva (cliente autenticado) |
| `/api/appointments/[id]/cancel` | PATCH | Cancelar propia reserva (>12h) |
| `/api/users/me` | GET/PATCH | Perfil propio |
| `/api/users/complete-profile` | POST | Guardar teléfono tras registro |
| `/api/portfolio` | GET/POST | Fotos portafolio |
| `/api/reviews` | POST | Reseña con foto |
| `/api/agenda` | GET | Agenda del peluquero autenticado |

### Admin (`BARBER` / `ADMIN_SHOP` / `ADMIN_GENERAL`)
| Endpoint | Método | Descripción |
|---|---|---|
| `/api/admin/appointments` | GET | Citas + bloqueos del día por local |
| `/api/admin/appointments/[id]` | DELETE | Eliminar cualquier cita |
| `/api/admin/unavailability` | POST | Crear bloque de indisponibilidad |
| `/api/admin/unavailability/[id]` | DELETE | Eliminar bloque |
| `/api/admin/book` | POST | Crear reserva para un cliente |
| `/api/admin/barbers` | GET | Todos los peluqueros con config |
| `/api/admin/barbers/[id]` | PATCH | Cambiar `isActive` o `location` (solo `ADMIN_GENERAL`) |
| `/api/admin/users` | GET | Buscar clientes (`?q=` / `?blocked=true`) |
| `/api/admin/users/[id]` | PATCH | Bloquear/desbloquear cliente |

---

## Archivos clave

| Archivo | Descripción |
|---|---|
| `src/lib/slots.ts` | Cálculo de slots disponibles con horario real |
| `src/lib/auth.ts` | `getCurrentUser()` — sesión + BD |
| `src/lib/prisma.ts` | Cliente Prisma singleton |
| `prisma/schema.prisma` | Esquema BD: User, Barber, Service, Appointment, UnavailabilityBlock, Review, Portfolio |
| `prisma/seed.ts` | Seed: 15 servicios + 4 peluqueros |
| `src/app/admin/page.tsx` | Panel admin completo (inline styles, ~800 líneas) |
| `src/app/page.tsx` | Landing + BookingSection (formulario reservas) |
| `ClaudeDesign/index.html` | Prototipo visual de referencia (no migrar directamente) |
| `serviciosJSON.txt` | Catálogo de servicios con precios y duraciones |

---

## Estado actual (rama `prelive`)

**Implementado:**
- Auth completa (Google OAuth, roles, complete-profile)
- BD: esquema Prisma + seed con servicios y peluqueros
- Flujo de reservas cliente (landing + `/reservas`)
- Home, mis citas (cancelación >12h), perfil, portafolio
- Panel admin completo: calendario, bloqueados, configuración
- Bloqueos de horario que impiden reservas de clientes
- Eliminación de citas y bloqueos desde el calendario

**Pendiente:**
- NickPoints (contabilizar asistencia real)
- Notificaciones push (24h y 5h antes)
- Vista `/agenda` completa para peluqueros
- Capacitor (iOS/Android)

---

## Gotchas

- UTC = hora España en todo el sistema (ver convención arriba). No convertir zonas horarias.
- Cancelación cliente: regla 12h solo en `/api/appointments/[id]/cancel`. El admin no tiene esa restricción → usa `/api/admin/appointments/[id]` (DELETE).
- Panel admin: solo inline styles, sin clases Tailwind. Paleta hardcodeada.
- `prisma generate` falla si el dev server está corriendo (bloqueo de DLL en Windows). Parar el servidor antes de `npm run build`.
- Peluqueros desactivados (`isActive: false`) no aparecen en el selector de reservas ni en el calendario.
- `autoasignación` de peluquero: asigna al que tenga más slots libres en la fecha elegida.

Piensa antes de actuar. Lee los archivos antes de escribir código. Edita solo lo que cambia. Sin preámbulos ni resúmenes.
