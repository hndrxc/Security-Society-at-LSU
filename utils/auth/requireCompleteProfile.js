import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

/**
 * Check if a profile is complete (has username and full_name)
 * @param {object} profile - The profile object
 * @returns {boolean}
 */
export function isProfileComplete(profile) {
  return Boolean(
    profile?.username?.trim() &&
    profile?.full_name?.trim()
  )
}

/**
 * Server-side helper to require a complete profile.
 * Use in server actions - throws error if profile is incomplete.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User, profile: Profile }>}
 * @throws {Error} If not authenticated or profile is incomplete
 */
export async function requireCompleteProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, username, full_name')
    .eq('id', user.id)
    .single()

  if (!isProfileComplete(profile)) {
    throw new Error('Profile incomplete')
  }

  return { supabase, user, profile }
}

/**
 * Server-side helper to require a complete profile for page components.
 * Redirects to login if not authenticated, or account page if profile is incomplete.
 *
 * @returns {Promise<{ supabase: SupabaseClient, user: User, profile: Profile }>}
 */
export async function requireCompleteProfilePage() {
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

  if (!isProfileComplete(profile)) {
    redirect('/account?complete=required')
  }

  return { supabase, user, profile }
}
