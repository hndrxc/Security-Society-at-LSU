'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-rose-800/50 bg-[#130d17]/90 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200 ring-2 ring-rose-600/40">
              <span className="text-2xl font-semibold">!</span>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[CRITICAL ERROR]</p>
              <h1 className="text-3xl font-semibold text-white">Application Error</h1>
              <p className="text-base leading-7 text-slate-300">
                A critical error occurred. Please try again.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => reset()}
                className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
