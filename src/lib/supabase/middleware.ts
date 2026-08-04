import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getUser(). A
  // simple mistake can make it very hard to debug issues with deep-link caching.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login')
  const authorizedAdminEmails = ['hellen@hellenferreira.com']

  if (isAdminPath && !isLoginPage) {
    if (!user || !user.email || !authorizedAdminEmails.includes(user.email)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
