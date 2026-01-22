"use client";

import { usePathname } from "next/navigation";
import { useSupabaseProfile } from "@/hooks/useSupabaseProfile";
import Navbar from "./Navbar";

/**
 * Client-side navbar wrapper that handles auth state.
 * For use in client components (like About page).
 *
 * @param {object} props
 * @param {string} [props.maxWidth="5xl"] - Max width class
 */
export default function NavbarClient({ maxWidth = "5xl" }) {
  const { user, profile } = useSupabaseProfile();
  const pathname = usePathname();

  return (
    <Navbar
      user={user}
      profile={profile}
      currentPath={pathname}
      maxWidth={maxWidth}
    />
  );
}
