import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { SESSIONS_DATA } from '@/lib/data/sessions'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // SEO: Redirect old booking links to slug-based links
  if (pathname === '/agendar') {
    const sessionId = searchParams.get('sessao')
    if (sessionId && SESSIONS_DATA[sessionId]) {
      const slug = SESSIONS_DATA[sessionId].slug
      const tier = searchParams.get('tier')
      
      const newUrl = new URL(`/agendar/${slug}`, request.url)
      if (tier) newUrl.searchParams.set('tier', tier)
      
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
