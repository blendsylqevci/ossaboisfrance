import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of administrative and import endpoints that are destructive or dev-only
  const isDevOnlyEndpoint =
    pathname.startsWith('/api/import-') ||
    pathname.startsWith('/api/import-house/') ||
    pathname.startsWith('/api/reseed') ||
    pathname.startsWith('/api/seed-') ||
    pathname.startsWith('/api/migrate') ||
    pathname.startsWith('/api/cleanup-') ||
    pathname.startsWith('/api/test-')

  if (isDevOnlyEndpoint && process.env.NODE_ENV === 'production') {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Access forbidden in production environment.' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
