"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";

export function useSupabaseProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState({
    user: null,
    profile: null,
    loading: true,
  });
  useEffect(() => {
    let active = true;
    let generation = 0;
    const timers = new Set();
    async function load() {
      const current = ++generation;
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        const { data: profile } = user
          ? await supabase
              .from("profiles")
              .select("is_admin, username, full_name")
              .eq("id", user.id)
              .single()
          : { data: null };
        if (active && current === generation)
          setState({ user, profile, loading: false });
      } catch {
        if (active && current === generation)
          setState({ user: null, profile: null, loading: false });
      }
    }
    // Auth callbacks run under the Supabase auth lock. Defer queries until it is released.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (active) void load();
      }, 0);
      timers.add(timer);
    });
    return () => {
      active = false;
      generation++;
      subscription.unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [supabase]);
  return state;
}
