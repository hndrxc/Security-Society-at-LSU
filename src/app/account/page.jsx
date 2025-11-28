import Link from "next/link";
import AccountForm from "./account-form";
import { createClient } from "../../../utils/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-base font-semibold uppercase tracking-tight text-amber-300 ring-1 ring-purple-700/60 shadow-lg shadow-purple-900/40">
              SSL
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Account</p>
              <h1 className="text-2xl font-semibold text-white">Security Society at LSU</h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-amber-400/70 px-4 py-2 text-sm font-semibold text-amber-200 transition-colors hover:border-transparent hover:bg-amber-400 hover:text-black"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-purple-900/50 bg-[#0f0d16]/90 p-8 shadow-2xl shadow-purple-900/40 backdrop-blur sm:p-10">
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Profile</p>
            <p className="text-lg font-semibold text-white">Manage your account details</p>
            <p className="text-sm text-slate-300">Update your info and sign out securely.</p>
          </div>
          <AccountForm user={user} />
        </div>
      </div>
    </div>
  );
}
