import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/forgot-password'
]

// Routes that require admin access
const adminRoutes = [
  '/dashboard/admin'
]

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const pathname = request.nextUrl.pathname

    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    // Check if it's an admin route
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    // If authenticated user tries to access auth pages, redirect to dashboard
    if (isPublicRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If unauthenticated user tries to access protected routes
    if (!isPublicRoute && !session) {
      const returnUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(new URL(`/auth?returnUrl=${returnUrl}`, request.url))
    }

    // Handle admin routes
    if (isAdminRoute) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth', request.url))
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        return NextResponse.redirect(new URL('/auth', request.url))
      }

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Update session if needed
    const {
      data: { session: newSession },
    } = await supabase.auth.getSession()

    if (newSession?.expires_at) {
      const expiresIn = newSession.expires_at - Math.floor(Date.now() / 1000)
      if (expiresIn < 3600) { // Less than 1 hour until expiry
        await supabase.auth.refreshSession()
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}