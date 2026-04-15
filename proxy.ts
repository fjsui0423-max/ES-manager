import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MOBILE_UA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const ua = request.headers.get('user-agent') ?? ''
    const isMobile = MOBILE_UA.test(ua)
    return NextResponse.redirect(new URL(isMobile ? '/home' : '/editor', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest).*)'],
}
