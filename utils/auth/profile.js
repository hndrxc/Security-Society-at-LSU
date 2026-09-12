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

