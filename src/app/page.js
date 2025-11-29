import Link from "next/link";
import { createClient } from "../../utils/supabase/server";

const highlights = [
  {
    title: "Community-first programs",
    detail: "Workshops, mentorship, and resources shaped with our partners and neighbors.",
  },
  {
    title: "Capture The Flag Team",
    detail: "We Organize CTF events and Challenges for our members",
  },
  {
    title: "Trusted network",
    detail: "Local leaders, educators, and peers shareing their Cybersecurity Knowledge",
  },
  {
    title: "Weekly Meetings",
    detail: "We host Multiple levels of meeting throughout the week allowing members of all skill levels to learn",
  },
];

// const stats = [
//   { label: "Members", value: "80+" },
//   { label: "Hours invested", value: "67k" },
//   { label: "Meetings", value: "3" },
// ];

const discordServerId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? "/account" : "/login";
  const accountLabel = user ? "Account" : "Login";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />

      <header className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black ring-1 ring-purple-700/60 text-base font-semibold uppercase tracking-tight text-amber-300 shadow-lg shadow-purple-900/40 sm:h-12 sm:w-12 sm:text-lg">
            SSL
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Security Society at LSU
            </p>
            <p className="text-base font-semibold text-slate-100">LSU&apos;s Best Cybersecurity Club</p>
          </div>
        </div>

        <nav className="flex w-full flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-200 sm:w-auto sm:justify-end">
          <a
            className="rounded-full px-4 py-2 transition-colors hover:bg-purple-700/40 hover:text-amber-200"
            href="#programs"
          >
            Programs
          </a>
          <a
            className="rounded-full px-4 py-2 transition-colors hover:bg-purple-700/40 hover:text-amber-200"
            href="/about"
          >
            About
          </a>
          <Link
            href={accountHref}
            className="rounded-full border border-amber-400/70 px-4 py-2 text-amber-200 transition-colors hover:border-transparent hover:bg-amber-400 hover:text-black"
          >
            {accountLabel}
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        <section className="flex flex-col gap-8 rounded-3xl border border-purple-900/50 bg-[#0f0d16]/80 p-7 shadow-2xl shadow-purple-900/40 backdrop-blur sm:gap-10 sm:p-12 md:p-14">
          <div className="flex flex-col gap-5 text-center sm:max-w-3xl sm:gap-6 sm:text-left" id="about">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Security Society at LSU</p>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Hello Hacker!
            </h1>
            <p className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Welcome to the Security Society at LSU. We are are Cybersecurity club that aims to equip students with the technical skills needed in today&apos;s cybersecurity landscape,and provide job opportunities by connecting them with industry professionals.
            </p>
            <p className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Join us from 6:00-7:30 in PFT 1240 on
              Tuesdays, in PFT 1212 on Fridays, or email us at securitysocietylsu@protonmail.com!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
              <a
                className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3"
                href="#programs"
              >
                Explore programs
              </a>
              <Link
                href={accountHref}
                className="rounded-full border border-purple-500/60 px-5 py-2.5 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white sm:px-6 sm:py-3"
              >
                {user ? "Go to your account" : "Login to your account"}
              </Link>
            </div>
          </div>

          {/* <div className="grid gap-4 sm:grid-cols-3" role="list">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-purple-900/50 bg-gradient-to-br from-[#181124] via-[#0f0b16] to-black px-5 py-4 shadow-lg shadow-purple-900/30"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-300/90">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div> */}

          {discordServerId && (
            <div className="mt-8 rounded-2xl border border-purple-900/50 bg-gradient-to-br from-[#0f0b16] via-[#0b0812] to-black p-5 shadow-xl shadow-purple-900/30 sm:p-6">
              <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Stay Connected</p>
                  <h2 className="text-xl font-semibold text-white">Join our Discord</h2>
                  <p className="text-sm text-slate-300">
                    Get event alerts, find teammates, and ask questions between meetings.
                  </p>
                </div>
                {discordInvite && (
                  <a
                    href={discordInvite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Open Invite
                  </a>
                )}
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-purple-900/50 bg-black/70">
                <iframe
                  title="Discord server preview"
                  src={`https://discord.com/widget?id=${discordServerId}&theme=dark`}
                  allowtransparency="true"
                  width="100%"
                  height="380"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="h-[300px] w-full sm:h-[380px]"
                />
              </div>
            </div>
          )}
        </section>

        <section id="programs" className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-2.5 rounded-2xl border border-purple-900/50 bg-black/60 p-6 text-center shadow-lg shadow-purple-900/30 backdrop-blur sm:gap-3 sm:p-7 sm:text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-amber-400 text-black">
                <span aria-hidden>✦</span>
              </div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h2>
              <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{item.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
