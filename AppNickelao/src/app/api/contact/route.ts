import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, msg } = await req.json()

  if (!name || !email || !msg) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'Nickelao Barber <onboarding@resend.dev>',
    to: ['nickelaobarbershop@gmail.com', 'adrian.gomez.dejuan@gmail.com'],
    subject: `Contacto web — ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${msg}`,
    replyTo: email,
  })

  if (error) {
    console.error('[contact] Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
