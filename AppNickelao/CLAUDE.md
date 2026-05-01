# CLAUDE.md — Nickelao Barber App

## Commands

- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Test: `npm test` / single: `npm test src/lib/example.test.ts`
- Lint: `npm run lint`

## Stack

Next.js 16 App Router · TypeScript · Tailwind CSS v3 · Clerk (auth) · Supabase (DB + Storage) · Capacitor (iOS/Android)

- `create-next-app` instala Tailwind v4 por defecto — este proyecto usa **v3** (`tailwind.config.ts`)
- `jest.config.ts` requiere `ts-node` como devDependency
- UI/UX Pro Max skill instalado en `.claude/skills/ui-ux-pro-max/`

---

## Qué es

**Nickelao Barber** — app de gestión de reservas para una barbería con dos locales (Foz y Mondoñedo, Galicia). Las reservas se gestionan a través de **Booksy** (la API aún no está disponible; usar mock hasta entonces).

---

## Design System

```
Fuentes:  [por definir — elegante barbería moderna]
Paleta:
  --dark-green:  #1E2A27   ← fondo hero, headers, paneles oscuros
  --green:       #547832   ← acentos verdes, botones secundarios
  --yellow:      #F2C230   ← CTAs principales, badges, NickPoints
  --cream:       #F5F4E6   ← fondo base
  --gray-1:      #A7A8A3   ← texto secundario
  --gray-2:      #C8C9C4   ← bordes, separadores
  --gray-3:      #E6E6E0   ← fondos alternativos
```

Logo: `public/logo.jpeg` (poste de barbero — verde/amarillo/crema sobre fondo sage).
Estética: barbería premium moderna. Sin efectos excesivos. Limpio y funcional.

---

## Locales y equipo

| Local | Barberos |
|---|---|
| Foz | Nick, Diego |
| Mondoñedo | Roberto, Pepe |

Horario: Lun–Vie 09:00–20:00 · Sáb 09:00–15:00 · Dom cerrado

---

## Roles de usuario

### CLIENTE
- Ver calendario: sus reservas con nombre propio; las demás aparecen bloqueadas
- Reservar slots disponibles
- Acceso a: Home, Mis citas, Reservas, Perfil, Portafolio
- Sistema de NickPoints

### PELUQUERO
- Vista principal: su propia agenda (estilo Booksy — 2 días con scroll vertical)
- Ve nombres de clientes en las reservas
- Puede reservar citas a nombre de un cliente
- Puede añadir indisponibilidad (bloquea slot vía API Booksy)
- Botón "+" flotante → reservar cliente | añadir indisponibilidad
- Puede acceder al perfil de clientes desde cada reserva
- **No tiene**: Mis citas, NickPoints

### ADMIN PELUQUERÍA
- Todo lo de PELUQUERO
- Puede solicitar bloqueo de clientes por no asistencia (desde su perfil)

### ADMIN GENERAL
- Todo lo de ADMIN PELUQUERÍA
- Puede editar roles de cualquier usuario
- Puede activar/desactivar peluqueros (vacaciones, baja)

---

## Estructura de páginas

### `/` — Login/Register
- Logo + nombre de la barbería
- Botón "Continuar con Google" (Clerk)
- Al registrarse: formulario con Nombre, Apellido, Teléfono, Email

### `/home` — Home (clientes)
- Header con imagen/logo de la peluquería
- CTA "Reservar cita" → `/reservas`
- Próxima cita del usuario (si existe)

### `/mis-citas` — Mis citas (solo clientes)
- **Próximas**: fecha, hora, local, peluquero
  - Botones Reprogramar / Cancelar (solo si quedan > 12h)
  - Reprogramar: nuevo flujo de reserva → cancela la antigua + crea la nueva (vía Booksy API)
  - Cancelar: popup de confirmación → cancela vía Booksy API
  - Si < 12h: mensaje informativo, no se puede cancelar ni reprogramar
- **Historial**: citas pasadas
  - Se puede subir foto + reseña del corte → gana 5 NickPoints

### `/reservas` — Reservas
Flujo de 4 pasos:
1. **Local** → Foz | Mondoñedo
2. **Servicio** → desplegable con catálogo
3. **Peluquero** → Nick/Diego (Foz) | Roberto/Pepe (Mondoñedo) | Autoasignación (más disponible)
4. **Slot** → calendario del día con slots disponibles (petición a Booksy API por duración del servicio)
   - Al seleccionar slot → botón "Reservar"
   - Segunda confirmación con resumen de la cita
   - Confirmar → petición a Booksy API + guardar en DB + mostrar "+5 NickPoints" + redirigir a Home

### `/perfil` — Perfil (clientes)
- Foto de perfil (tap para cambiar desde galería)
- Nombre y apellidos
- Teléfono
- Email
- NickPoints acumulados

### `/portfolio` — Portafolio
- Grid estilo Instagram con fotos subidas por usuarios
- Se puede comentar en cada imagen

### `/agenda` — Agenda (solo peluqueros/admins)
- Vista 2 días con scroll vertical (estilo Booksy)
- Cada peluquero ve solo su propia agenda
- Nombre del cliente visible en cada reserva
- Tap en reserva → perfil del cliente
- Botón "+" flotante → reservar cliente | añadir indisponibilidad

---

## Catálogo de servicios

Ver `serviciosJSON.txt` para datos completos. Cuatro categorías:
- **Populares**: Corte tendencia/degradado (13€/30min), Corte+barba (20€/45min), Corte/rapado (12€/25min)
- **Corte**: 7 servicios, 5€–17€, 10–45min
- **Barba**: 4 servicios, 8€–12€, 15–30min
- **Combinados**: 4 servicios, 16€–25€, 35–55min

---

## Sistema de NickPoints

| Acción | Puntos |
|---|---|
| Reserva confirmada y asistida | +5 |
| Reseña + foto subida tras cita | +5 |
| No asistencia | −todos los puntos |
| Total para corte gratis | 100 |

---

## Política de no asistencia

- Admin peluquería puede bloquear a un cliente desde su perfil
- Cliente bloqueado ve mensaje: "Bloqueado por no asistencia el día X a las Y. Pasa por el local para proceder al pago y poder reservar de nuevo."

---

## Notificaciones push

(Depende de integración con Booksy o servicio independiente)
- 24h antes de la cita: "Recuerda que tienes cita el día X a las Y horas"
- 5h antes de la cita

---

## Integración Booksy

La API de Booksy **aún no está disponible**. Mientras tanto:
- Usar `src/lib/booksy/mock.ts` que simula todas las respuestas
- La interfaz del cliente Booksy debe estar en `src/lib/booksy/client.ts`
- Al tener acceso real a la API, solo hay que reemplazar `mock.ts` sin tocar el resto

Operaciones necesarias:
- `getAvailableSlots(barberId, serviceId, date)` → slots libres
- `createAppointment(clientId, barberId, serviceId, slotId)` → nueva reserva
- `cancelAppointment(appointmentId)` → cancelar
- `addUnavailability(barberId, startTime, endTime)` → bloquear slot

---

## Archivos clave

| Archivo | Contenido |
|---|---|
| `ClaudeDesign/index.html` | Prototipo visual completo (HTML + React CDN) |
| `ClaudeDesign/uploads/logoDefinitivo.jpeg` | Logo oficial actual |
| `serviciosJSON.txt` | Catálogo de servicios con precios y duraciones |
| `src/app/` | Next.js scaffold (vacío, pendiente de construir) |

---

## Estado actual

**Hecho:**
- Prototipo UI en `ClaudeDesign/index.html` (solo estético, no migrarlo directamente)
- Scaffold Next.js + Tailwind v3 + Jest + TypeScript
- UI/UX Pro Max skill instalado

**Pendiente — Fase 1 (base):**
1. Instalar y configurar Clerk (Google OAuth)
2. Configurar Supabase (DB schema: users, appointments, points, reviews, portfolio)
3. Tailwind design tokens (colores de marca)
4. Layout base + fuentes
5. Página Login/Register

**Pendiente — Fase 2 (núcleo):**
6. Mock Booksy client
7. Flujo de reserva completo
8. Home con próxima cita
9. Mis citas (próximas + historial)

**Pendiente — Fase 3 (extra):**
10. Portafolio + comentarios
11. Sistema de NickPoints
12. Vista agenda para peluqueros
13. Gestión de roles (admin)
14. Notificaciones push
15. Capacitor (iOS/Android)

---

## Gotchas

- Booksy API no disponible aún — todo debe pasar por `src/lib/booksy/client.ts` para poder swapear el mock fácilmente
- La cancelación/reprogramación tiene regla de 12h — validar siempre en servidor, no solo en cliente
- Peluqueros NO ven la sección "Mis citas" ni tienen NickPoints
- `autoasignación` asigna al barbero con más disponibilidad en la fecha elegida

Piensa antes de actuar. Lee los archivos antes de escribir código. Edita solo lo que cambia. Sin preámbulos ni resúmenes.
