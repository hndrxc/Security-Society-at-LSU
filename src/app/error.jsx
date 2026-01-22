'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Optionally log to an error reporting service
    // console.error(error)
  }, [error])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-rose-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-60px] h-72 w-72 rounded-full bg-amber-500/25 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-rose-800/50 bg-[#130d17]/90 p-10 text-center shadow-2xl shadow-rose-900/30 backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200 ring-2 ring-rose-600/40">
            <span className="text-2xl font-semibold">!</span>
          </div>

          <div className="mt-6 space-y-2">
            <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[ERROR]</p>
            <h1 className="text-3xl font-semibold text-white">Something went wrong</h1>
            <p className="text-base leading-7 text-slate-300">
              An unexpected error occurred. You can try again or go back to the home page.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-w-[160px] items-center justify-center rounded-xl border border-purple-500/60 px-4 py-3 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
