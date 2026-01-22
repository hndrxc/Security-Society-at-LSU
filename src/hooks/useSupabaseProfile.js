"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";

/**
 * Hook to get the current user and their profile data.
 * Extends useSupabaseUser pattern to also fetch profile.
 *
 * @returns {{ user: object|null, profile: object|null, loading: boolean }}
 */
export function useSupabaseProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;

      const currentUser = data?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_admin, username, full_name")
          .eq("id", currentUser.id)
          .single();

        if (isMounted) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("is_admin, username, full_name")
            .eq("id", currentUser.id)
            .single();

          if (isMounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  return { user, profile, loading };
}
