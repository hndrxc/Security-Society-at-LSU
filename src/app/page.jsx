import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "../../utils/supabase/server";
import SnowfallEffect from "@/components/SnowfallEffect";
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
    detail: "Local leaders, educators, and peers sharing their Cybersecurity Knowledge",
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

  // Fetch user profile if logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, username, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const accountHref = user ? "/account" : "/login";
  const displayName = profile?.username || "hacker";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100 cyber-grid">
      <SnowfallEffect />
      {/* Animated blur orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" style={{ animation: 'slow-pulse 8s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" style={{ animation: 'slow-pulse 10s ease-in-out infinite 1s' }} />

      {/* Decorative corner brackets */}
      <div className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-purple-500/30" />
      <div className="pointer-events-none absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-purple-500/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-amber-500/30" />

      <Navbar user={user} profile={profile} currentPath="/" />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        <section className="relative flex flex-col gap-8 clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-7 shadow-2xl shadow-purple-900/40 backdrop-blur sm:gap-10 sm:p-12 md:p-14">
          {/* Scanline overlay */}
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative flex flex-col gap-5 text-center sm:max-w-3xl sm:gap-6 sm:text-left" id="about">
            {/* Terminal prompt */}
            <div className="font-terminal text-xs text-purple-400">
              <span className="text-amber-400">{displayName}@ssl</span>
              <span className="text-slate-500">:</span>
              <span className="text-purple-300">~</span>
              <span className="text-slate-500">$</span>
              <span className="ml-2 text-slate-300">./welcome.sh</span>
            </div>

            <p className="font-terminal text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">[SYSTEM] Security Society at LSU</p>
            <h1 className="rgb-hover text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Hello {displayName}!<span className="terminal-cursor"></span>
            </h1>
            <p className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Welcome to the Security Society at LSU. We are a Cybersecurity club that aims to equip students with the technical skills needed in today&apos;s cybersecurity landscape, and provide job opportunities by connecting them with industry professionals.
            </p>
            <p className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              <span className="font-terminal text-amber-200">[LOCATION]</span> PFT 1240 on Tuesdays, PFT 1212 on Fridays @ 6:00-7:30
              <br />
              <span className="font-terminal text-amber-200">[CONTACT]</span> securitysocietylsu@protonmail.com
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
              <a
                className="pulse-glow rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3"
                href="#programs"
              >
                Explore programs
              </a>
              <Link
                href={accountHref}
                className="hover-glow rounded-full border border-purple-500/60 px-5 py-2.5 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white sm:px-6 sm:py-3"
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
            <div className="relative mt-8 clip-cyber border border-purple-900/50 bg-gradient-to-br from-[#0f0b16] via-[#0b0812] to-black p-5 shadow-xl shadow-purple-900/30 sm:p-6">
              {/* LIVE indicator */}
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#39ff14]" />
                <span className="font-terminal text-xs uppercase text-[#39ff14]">Live</span>
              </div>

              <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
                <div>
                  <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[COMMS] Stay Connected</p>
                  <h2 className="rgb-hover text-xl font-semibold text-white">Join our Discord</h2>
                  <p className="text-sm text-slate-300">
                    Get event alerts, find teammates, and ask questions between meetings.
                  </p>
                </div>
                {discordInvite && (
                  <a
                    href={discordInvite}
                    target="_blank"
                    rel="noreferrer"
                    className="pulse-glow inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Open Invite
                  </a>
                )}
              </div>

              {/* Terminal window frame */}
              <div className="mt-5 overflow-hidden border border-purple-700/50 bg-black/90">
                <div className="flex items-center gap-1.5 border-b border-purple-700/50 bg-purple-900/30 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="font-terminal ml-2 text-xs text-slate-400">discord-widget.exe</span>
                </div>
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

        {/* Programs Section Header */}
        <div className="mt-10 flex items-center gap-4 sm:mt-12">
          <span className="font-terminal text-xs uppercase tracking-wider text-amber-400">[PROGRAMS]</span>
          <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
          <span className="font-terminal text-xs text-slate-500">{highlights.length} MODULES</span>
        </div>

        <section id="programs" className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6 stagger-children">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="animate-slide-up hover-glow relative flex flex-col gap-2.5 clip-cyber border border-purple-900/50 bg-black/60 p-6 text-center shadow-lg shadow-purple-900/30 backdrop-blur sm:gap-3 sm:p-7 sm:text-left"
            >
              {/* Hex address decoration */}
              <span className="font-terminal absolute right-3 top-3 text-[10px] text-purple-400/60">
                0x{(0x00FF + index).toString(16).toUpperCase().padStart(4, '0')}
              </span>

              <div className="font-terminal flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-700 to-amber-400 text-sm font-bold text-black">
                [{index + 1}]
              </div>
              <h2 className="rgb-hover text-lg font-semibold text-white sm:text-xl">{item.title}</h2>
              <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{item.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
