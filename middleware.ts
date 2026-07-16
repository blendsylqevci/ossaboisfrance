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
    pathname.startsWith('/api/test-') ||
    pathname.startsWith('/api/upload-planimetry')

  if (isDevOnlyEndpoint) {
    const forbidden = new NextResponse(
      JSON.stringify({ success: false, error: 'Access forbidden.' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    )

    // Primary control: these destructive/dev endpoints are never reachable in
    // production (Vercel sets NODE_ENV=production for prod AND preview builds).
    if (process.env.NODE_ENV === 'production') {
      return forbidden
    }

    // Defense-in-depth for any non-production/self-hosted run: if an admin task
    // token is configured, require it. This closes the "no auth at all outside
    // production" gap without breaking local dev when the token is unset.
    const adminToken = process.env.ADMIN_TASK_TOKEN
    if (adminToken) {
      const provided =
        request.headers.get('x-admin-task-token') ||
        request.nextUrl.searchParams.get('adminToken')
      if (provided !== adminToken) {
        return forbidden
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
