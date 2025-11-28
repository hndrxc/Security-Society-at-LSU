import Link from "next/link";
import ResetRequest from "./reset-request";
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-purple-900/50 bg-[#0f0d16]/90 p-10 shadow-2xl shadow-purple-900/40 backdrop-blur">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-lg font-semibold uppercase tracking-tight text-amber-300 ring-1 ring-purple-700/60 shadow-lg shadow-purple-900/40">
              SSL
            </div>
            <h1 className="text-2xl font-semibold text-white">Security Society at LSU</h1>
          </div>

          <form className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-purple-900/60 bg-black/40 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-purple-900/20 focus:border-amber-400 focus:outline-none focus:ring focus:ring-amber-300/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-purple-900/60 bg-black/40 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-purple-900/20 focus:border-amber-400 focus:outline-none focus:ring focus:ring-amber-300/30"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                formAction={login}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Log in
              </button>
              <button
                formAction={signup}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-purple-500/60 px-4 py-3 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Create account
              </button>
            </div>
          </form>

          <ResetRequest />

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-amber-400/70 px-4 py-2 text-sm font-semibold text-amber-200 transition-colors hover:border-transparent hover:bg-amber-400 hover:text-black"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
