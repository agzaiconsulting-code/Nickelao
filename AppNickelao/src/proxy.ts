import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PAGES = ['/', '/sign-in', '/sign-up', '/complete-profile']

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API routes handle their own auth — never redirect them
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // Public pages — always allow
  if (PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next()

  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ??
    req.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
