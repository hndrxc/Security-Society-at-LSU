import { redirect } from 'next/navigation'
import { getAuthData } from './getAuthData'

/**
 * Server-side helper to require admin access.
 * Use in server actions and page components.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User }>}
 * @throws {Error} If not authenticated or not an admin
 */
export async function requireAdmin() {
  const { supabase, user, profile } = await getAuthData()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (!profile?.is_admin) {
    throw new Error('Not authorized')
  }

  return { supabase, user }
}

/**
 * Server-side helper to require admin access for page components.
 * Redirects to login if not authenticated, or home if not admin.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User, profile: Profile }>}
 */
export async function requireAdminPage() {
  const { supabase, user, profile } = await getAuthData()

  if (!user) {
    redirect('/login')
  }

  if (!profile?.is_admin) {
    redirect('/')
  }

  return { supabase, user, profile }
}
