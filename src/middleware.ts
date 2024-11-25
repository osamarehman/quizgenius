import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check auth session
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/auth', '/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Handle authentication for non-public routes
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}