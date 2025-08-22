import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers for enhanced protection

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/',
    '/transactions',
    '/budgets',
    '/reports',
    '/ai-assistant',
    '/settings',
    '/import-data'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  )

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth pages with a session, redirect to dashboard
  if ((req.nextUrl.pathname.startsWith('/auth/login') || 
       req.nextUrl.pathname.startsWith('/auth/signup')) && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js assets: static, image, react-refresh, webpack-hmr, etc.)
     * - favicon.ico (favicon file)
     * - manifest.json / service worker
     */
    '/((?!api|_next|favicon.ico|manifest.json|sw.js).*)',
  ],
}
