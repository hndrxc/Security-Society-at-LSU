"use client";

import { useStorageImage } from "@/hooks/useStorageImage";

const OFFICER_BUCKET = process.env.NEXT_PUBLIC_OFFICER_BUCKET || "officers";

function OfficerCard({ officer, index }) {
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
      <span className="font-terminal absolute right-3 top-3 text-[10px] text-purple-400/60">
        FILE #{String(index + 1).padStart(3, "0")}
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
                className="h-24 w-24 object-cover transition-all duration-300 group-hover:scale-105 group-hover:saturate-125"
              />
              <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          {showComingSoon ? (
            <span className="font-terminal absolute -bottom-3 left-1/2 -translate-x-1/2 rounded bg-purple-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              Photo coming soon
            </span>
          ) : null}
        </div>
        <div>
          <p className="font-terminal text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            {officer.team}
          </p>
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

export default function OfficerGrid({ officers }) {
  return (
    <div className="stagger-children mt-6 grid gap-6 md:grid-cols-2">
      {officers.map((officer, index) => (
        <OfficerCard key={officer.name} officer={officer} index={index} />
      ))}
    </div>
  );
}
