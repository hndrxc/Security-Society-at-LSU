import Link from "next/link";
import { redirect } from "next/navigation";
import LogoBadge from "@/components/LogoBadge";
import AccountForm from "./account-form";
import { createClient } from "../../../utils/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (!user) {
    redirect("/login");
  }

  // Check if profile is incomplete
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  const isProfileIncomplete = !profile?.username?.trim() || !profile?.full_name?.trim();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100 cyber-grid">
      {/* Animated blur orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" style={{ animation: 'slow-pulse 8s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" style={{ animation: 'slow-pulse 10s ease-in-out infinite 1s' }} />

      {/* Decorative corner brackets */}
      <div className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-purple-500/30" />
      <div className="pointer-events-none absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-purple-500/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-amber-500/30" />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <LogoBadge size={48} className="shrink-0" priority />
            <div>
              <p className="font-terminal text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">[ACCOUNT]</p>
              <h1 className="text-2xl font-semibold text-white">Security Society at LSU</h1>
            </div>
          </div>
          <Link
            href="/"
            className="pulse-glow inline-flex items-center justify-center rounded-full border border-amber-400/70 px-4 py-2 text-sm font-semibold text-amber-200 transition-all hover:border-transparent hover:bg-amber-400 hover:text-black"
          >
            Back to home
          </Link>
        </div>

        <div className="relative mt-8 clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/90 p-8 shadow-2xl shadow-purple-900/40 backdrop-blur sm:p-10">
          {/* Scanline overlay */}
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative mb-6 flex flex-col gap-1">
            {/* Terminal intro */}
            <div className="font-terminal mb-2 text-xs text-purple-400">
              <span className="text-amber-400">[SYS]</span>
              <span className="ml-2 text-slate-400">USER SESSION ACTIVE</span>
            </div>
            <p className="font-terminal text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">[PROFILE] User Data</p>
            <p className="rgb-hover text-lg font-semibold text-white">Manage your account details</p>
            <p className="text-sm text-slate-300">Update your info and sign out securely.</p>
          </div>
          <AccountForm user={user} isProfileIncomplete={isProfileIncomplete} />
        </div>
      </div>
    </div>
  );
}
