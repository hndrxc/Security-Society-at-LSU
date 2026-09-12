import { cache } from "react";
import { createClient } from "../supabase/server";
import { isProfileComplete } from "./profile";

/**
 * Get authenticated user and their profile data.
 * For use in server components.
 *
 * @returns {Promise<{supabase: object, user: object|null, profile: object|null, isProfileComplete: boolean}>}
 */
// Share authentication reads within a server render, never across requests.
export const getAuthData = cache(async function getAuthData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null, isProfileComplete: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, username, full_name")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile, isProfileComplete: isProfileComplete(profile) };
});
