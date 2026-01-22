import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

/**
 * Server-side helper to require admin access.
 * Use in server actions and page components.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User }>}
 * @throws {Error} If not authenticated or not an admin
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, username, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return { supabase, user, profile }
}
