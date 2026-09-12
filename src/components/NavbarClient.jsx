"use client";

import { usePathname } from "next/navigation";
import { useSupabaseProfile } from "@/hooks/useSupabaseProfile";
import Navbar from "./Navbar";

export default function NavbarClient() {
  const { user, profile } = useSupabaseProfile();
  const pathname = usePathname();

  return (
    <Navbar
      user={user}
      profile={profile}
      currentPath={pathname}
    />
  );
}
