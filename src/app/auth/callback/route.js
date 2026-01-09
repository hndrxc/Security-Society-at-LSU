import { NextResponse } from 'next/server'
import { createClient } from '../../../../utils/supabase/server'

// Handles Supabase auth callbacks (e.g., password recovery PKCE) on the server
export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Validate 'next' parameter to prevent open redirect attacks
  const allowedNextRoutes = ['/reset-password', '/account', '/ctf', '/']
  const requestedNext = url.searchParams.get('next')
  const next = allowedNextRoutes.includes(requestedNext) ? requestedNext : '/reset-password'

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
