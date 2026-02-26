import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PRIVATE_ROUTES = [
  '/dashboard',
  '/bookings',
  '/booking/checkout',
  '/owner',
  '/admin',
]

// Routes that are always public
const PUBLIC_ROUTES = [
  '/',
  '/equipment',
  '/auth',
]

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always run session refresh first (required by Supabase SSR)
  const supabaseResponse = await updateSession(request)

  // Only enforce auth on private routes
  if (!isPrivateRoute(pathname)) {
    return supabaseResponse
  }

  // Check if user is authenticated
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op: cookies are already set by updateSession above
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login, preserving the intended URL
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
