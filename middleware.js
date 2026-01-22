import { NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// IMPORTANT: This in-memory rate limiter is only suitable for development
// or single-instance deployments. For production with multiple instances
// (e.g., Vercel serverless), use a distributed store like:
// - Upstash Redis (@upstash/ratelimit)
// - Vercel KV
// - Redis with @vercel/edge-config
// The Map resets on every deployment/restart and isn't shared across instances.
const rateLimitMap = new Map()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_AUTH_REQUESTS = 10 // Auth endpoints
const MAX_CTF_REQUESTS = 30 // Flag submissions

// Cleanup old entries periodically
// Note: This cleanup only affects the current instance's memory
if (typeof globalThis !== 'undefined' && !globalThis.__rateLimitCleanupInitialized) {
  globalThis.__rateLimitCleanupInitialized = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.windowStart > WINDOW_MS) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

function getRateLimitKey(ip, path) {
  if (path.startsWith('/login') || path.startsWith('/auth')) {
    return `auth:${ip}`
  }
  if (path.startsWith('/ctf')) {
    return `ctf:${ip}`
  }
  return null
}

function isRateLimited(key, maxRequests) {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now - record.windowStart > WINDOW_MS) {
    rateLimitMap.set(key, { windowStart: now, count: 1 })
    return false
  }

  record.count++
  return record.count > maxRequests
}

export async function middleware(request) {
  // Improved IP detection for rate limiting
  // Try multiple header sources for proxied requests
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  )

  const path = request.nextUrl.pathname
  const key = getRateLimitKey(ip, path)

  if (key) {
    const maxRequests = key.startsWith('auth:') ? MAX_AUTH_REQUESTS : MAX_CTF_REQUESTS
    if (isRateLimited(key, maxRequests)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}