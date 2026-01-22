"use client";

import Link from "next/link";
import NavbarClient from "@/components/NavbarClient";
import { useStorageImage } from "@/hooks/useStorageImage";

const OFFICER_BUCKET = process.env.NEXT_PUBLIC_OFFICER_BUCKET || "officers";

const officers = [ 
  // {
  //   name: "First Last",
  //   role: "role",
  //   team: "class",
  //   photoPath: "cam.png",
  //   description:
  //     "Very long and drawn out description",
  // },
  {
    name: "Peyton 'Tai' Tran",
    role: "President",
    team: "Officer",
    photoPath: "tai.png",
    description:
      "Responsible for role and task delegation as well as overall management of club. Any uncertainty, ask me",
  },
  {
    name: "Simeon Orji",
    role: "Vice President",
    team: "Officer",
    photoPath: "CJ.png",
    description:
      "Responsible for assisting other members of the SSL board when they have tasks that require extra hands. I'm open to helping with any and all aspects of the club.",
  },
  {
    name: "Carter Hendricks",
    role: "Web-Master",
    team: "Officer",
    photoPath: "cartergood.png",
    description:
      "Guides the club's vision, coordinates with campus partners, and keeps every meeting focused on hands-on practice.",
  },
  {
    name: "Bennett Marceaux",
    role: "Secretary",
    team: "Officer",
    photoPath: "bennett.jpg",
    description:
      "Responsible for communication between LSU, board, and members. This includes maintenance of newsletter and calendar.",
  },
  {
    name: "Ronald Gibson",
    role: "Outreach Chair",
    team: "just a guy",
    photoPath: "ronald.png",
    description:
      "Secret leader of LSU's secret Cybersecurity cult and facilitator of communications between SSL and outside parties. Works heavily with other officers to ensure all the communications being done are benefiting some part of the club. Outside parties can include companies for talks/sponsorships, potential speakers, and more.",
  },
 
  {
    name: "Benito Mendoza",
    role: "Treasurer",
    team: "Officer",
    photoPath: "benito.png",
    description:
      "Responsible for SSL funds and fundraising",
  },
  {
    name: "Jennifer Saldana",
    role: "CTF Lead",
    team: "CTF",
    photoPath: "jennifer.png",
    description:
      "Responsible for organizing CTF meetings every week, CTF hackathons, and keeping track of national CTFs",
  },
  {
    name: "Taylor Graham",
    role: "CTF Team",
    team: "CTF",
    photoPath: "taylor.jpg",
    description:
      "Responsible for helping to organize CTF meetings, future hackathons, and train for future CTF competitions",
  },
  {
    name: "Aeris Kelleher",
    role: "CTF Team/WiCyS President",
    team: "CTF/Collaborator",
    photoPath: "aeris.png",
    description:
      "Responsible for organizing Hello, Hacker! and helping to organize CTF meetings, future hackathons, and train for future CTF competitions",
  },
  {
    name: "Chloe Phan",
    role: "Graphics Designer/Social Media Lead",
    team: "Officer",
    photoPath: "chloe.jpg",
    description:
      "make graphic designs, manage socials",
  },
];

function OfficerCard({ officer, index = 0 }) {
  // Simple calculation - no need for useMemo since officer data is static
  const initials = officer.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const { url, loading, error } = useStorageImage({
    bucket: OFFICER_BUCKET,
    path: officer.photoPath,
  });

  const showPlaceholder = loading || !url;
  const showComingSoon = !loading && !url && Boolean(error);

  return (
    <article className="animate-slide-up hover-glow group relative flex flex-col gap-4 clip-cyber border border-purple-900/50 bg-[#0f0d16]/80 p-6 shadow-xl shadow-purple-900/30 backdrop-blur">
      {/* File number decoration */}
      <span className="font-terminal absolute right-3 top-3 text-[10px] text-purple-400/60">
        FILE #{String(index + 1).padStart(3, '0')}
      </span>

      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24">
          {showPlaceholder ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-purple-700 to-amber-400 text-xl font-semibold uppercase text-black ring-2 ring-purple-800/50 transition-all group-hover:ring-purple-500">
              {loading ? "..." : initials}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg ring-2 ring-purple-800/50 transition-all group-hover:ring-purple-500">
              <img
                src={url}
                alt={`${officer.name} headshot`}
                className="h-24 w-24 object-cover transition-all duration-300 group-hover:saturate-125 group-hover:scale-105"
              />
              {/* Scanline overlay on hover */}
              <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          {showComingSoon && (
            <span className="font-terminal absolute -bottom-3 left-1/2 -translate-x-1/2 rounded bg-purple-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              Photo coming soon
            </span>
          )}
        </div>
        <div>
          <p className="font-terminal text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">{officer.team}</p>
          <h3 className="rgb-hover text-xl font-semibold text-white">{officer.name}</h3>
          <p className="font-terminal text-xs text-[#39ff14]">
            <span className="text-slate-500">CLEARANCE:</span> {officer.role}
          </p>
        </div>
      </div>
      <p className="text-base leading-7 text-slate-300">{officer.description}</p>
    </article>
  );
}

export default function AboutPage() {
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

      <NavbarClient />

      <main className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        <section className="relative flex flex-col gap-8 clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-7 shadow-2xl shadow-purple-900/40 backdrop-blur sm:gap-10 sm:p-12 md:p-14">
          {/* Scanline overlay */}
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative flex flex-col gap-5 text-center sm:max-w-3xl sm:gap-6 sm:text-left">
            {/* Terminal intro */}
            <div className="font-terminal text-xs text-[#39ff14]">
              <span className="animate-pulse">[ACCESS GRANTED]</span>
              <span className="ml-2 text-slate-400">Loading personnel database...</span>
            </div>

            <p className="font-terminal text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">[ABOUT] Security Society at LSU</p>
            <h1 className="rgb-hover text-3xl font-semibold leading-tight text-white sm:text-5xl">
              We teach, compete, and secure together.
            </h1>
            <p className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              The Security Society at LSU empowers students to build defensive and offensive skills through labs,
              competitions, and mentorship. We welcome every background, from first-timers curious about cyber to
              veterans looking to lead red and blue team operations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
              <a
                className="pulse-glow rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3"
                href="#officers"
              >
                Meet the officers
              </a>
              <Link
                href="/"
                className="hover-glow rounded-full border border-purple-500/60 px-5 py-2.5 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white sm:px-6 sm:py-3"
              >
                Back to home
              </Link>
            </div>
          </div>

          <div className="grid gap-4 text-center sm:grid-cols-3 sm:text-left">
            <div className="hover-sweep clip-cyber border border-purple-900/50 bg-gradient-to-br from-[#181124] via-[#0f0b16] to-black px-5 py-4 shadow-lg shadow-purple-900/30">
              <p className="font-terminal text-sm font-semibold uppercase tracking-wide text-amber-300/90">FOUNDED:</p>
              <p className="text-glow-amber mt-2 text-3xl font-semibold text-white">2017</p>
            </div>
            <div className="hover-sweep clip-cyber border border-purple-900/50 bg-gradient-to-br from-[#181124] via-[#0f0b16] to-black px-5 py-4 shadow-lg shadow-purple-900/30">
              <p className="font-terminal text-sm font-semibold uppercase tracking-wide text-amber-300/90">FOCUS:</p>
              <p className="text-glow-amber mt-2 text-3xl font-semibold text-white">Hands-on labs</p>
            </div>
            <div className="hover-sweep clip-cyber border border-purple-900/50 bg-gradient-to-br from-[#181124] via-[#0f0b16] to-black px-5 py-4 shadow-lg shadow-purple-900/30">
              <p className="font-terminal text-sm font-semibold uppercase tracking-wide text-amber-300/90">MEETINGS:</p>
              <p className="text-glow-amber mt-2 text-3xl font-semibold text-white">Tue & Fri</p>
            </div>
          </div>
        </section>

        <section id="officers" className="mt-12">
          {/* Personnel section header */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-terminal text-xs uppercase tracking-wider text-amber-400">[PERSONNEL]</span>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
            <span className="font-terminal text-xs text-slate-500">{officers.length} RECORDS</span>
          </div>

          <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <h2 className="rgb-hover text-3xl font-semibold text-white">Meet the Officers</h2>
              <p className="text-sm text-slate-300">
                A Quick Introduction to our Officers
              </p>
            </div>
            <a
              href="mailto:securitysocietylsu@protonmail.com"
              className="hover-glow inline-flex items-center justify-center rounded-full border border-purple-500/60 px-5 py-2 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white"
            >
              Contact us
            </a>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 stagger-children">
            {officers.map((officer, index) => (
              <OfficerCard key={officer.name} officer={officer} index={index} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
