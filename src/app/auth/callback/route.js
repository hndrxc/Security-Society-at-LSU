import { NextResponse } from 'next/server'
import { createClient } from '../../../../utils/supabase/server'

// Allowed route patterns for redirect after auth
// Uses prefix matching to allow dynamic routes like /ctf/[id]
const ALLOWED_ROUTE_PREFIXES = [
  '/reset-password',
  '/account',
  '/ctf',
  '/events',
  '/admin',
  '/about',
]

function isAllowedRoute(route) {
  if (!route || typeof route !== 'string') return false
  if (route === '/') return true
  // Must start with / and match one of the allowed prefixes
  if (!route.startsWith('/')) return false
  return ALLOWED_ROUTE_PREFIXES.some(prefix =>
    route === prefix || route.startsWith(prefix + '/')
  )
}

// Handles Supabase auth callbacks (e.g., password recovery PKCE) on the server
export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Validate 'next' parameter to prevent open redirect attacks
  const requestedNext = url.searchParams.get('next')
  const next = isAllowedRoute(requestedNext) ? requestedNext : '/reset-password'

  const redirectUrl = new URL(next, url.origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectUrl)
    }

    redirectUrl.searchParams.set('error', 'link_invalid')
    return NextResponse.redirect(redirectUrl)
  }

  redirectUrl.searchParams.set('error', 'missing_code')
  return NextResponse.redirect(redirectUrl)
}
