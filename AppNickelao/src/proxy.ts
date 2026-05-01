import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/', '/sign-in', '/sign-up', '/api/auth']

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next()

  const uid = req.cookies.get('uid')?.value
  if (!uid) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
