import { createClient } from "../supabase/server";
import { isProfileComplete } from "./requireCompleteProfile";

/**
 * Get authenticated user and their profile data.
 * For use in server components.
 *
 * @returns {Promise<{user: object|null, profile: object|null, isProfileComplete: boolean}>}
 */
export async function getAuthData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, isProfileComplete: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, username, full_name")
    .eq("id", user.id)
    .single();

  return { user, profile, isProfileComplete: isProfileComplete(profile) };
}
