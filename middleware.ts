import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** API routes that don't require authentication (e.g. landing page hero prompt) */
const PUBLIC_API_ROUTES = ['/api/ai/chat', '/api/waitlist']

export function middleware(request: NextRequest) {
  // Only protect API routes when Firebase is configured
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Skip public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next()
  }

  // Require Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
