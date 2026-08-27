// src/app/admin/layout.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import { isProfileComplete } from "../../../utils/auth/requireCompleteProfile";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, username, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Require complete profile for admin access
  if (!isProfileComplete(profile)) {
    redirect("/account?complete=required");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      {/* Admin header */}
      <header className="border-b border-purple-900/50 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-terminal text-sm text-purple-400 hover:text-amber-300">
              ← Site
            </Link>
            <div className="h-4 w-px bg-purple-900/50" />
            <h1 className="font-terminal text-sm uppercase tracking-wider text-amber-300">
              [ADMIN CONSOLE]
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-terminal text-xs text-slate-500">
              {profile.username || profile.full_name || user.email}
            </span>
            <Link
              href="/account"
              className="font-terminal rounded border border-purple-700/50 px-3 py-1 text-xs text-purple-300 hover:bg-purple-700/30"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* Admin navigation */}
      <nav className="border-b border-purple-900/30 bg-black/40">
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          <Link
            href="/admin"
            className="font-terminal border-b-2 border-transparent px-4 py-3 text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-purple-500/50 hover:text-slate-200"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/events"
            className="font-terminal border-b-2 border-transparent px-4 py-3 text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-purple-500/50 hover:text-slate-200"
          >
            Events
          </Link>
          <Link
            href="/admin/ctf/competitions"
            className="font-terminal border-b-2 border-transparent px-4 py-3 text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-purple-500/50 hover:text-slate-200"
          >
            Competitions
          </Link>
          <Link
            href="/admin/ctf/submissions"
            className="font-terminal border-b-2 border-transparent px-4 py-3 text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-purple-500/50 hover:text-slate-200"
          >
            Submissions
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
