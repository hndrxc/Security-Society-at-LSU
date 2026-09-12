"use client";
import Image from "next/image";
import { useState } from "react";
import { useStorageImage } from "@/hooks/useStorageImage";
import Reveal from "@/components/ui/Reveal";
const OFFICER_BUCKET = process.env.NEXT_PUBLIC_OFFICER_BUCKET || "officers";
function OfficerCard({ officer, index }) {
  const { url, loading } = useStorageImage({
    bucket: OFFICER_BUCKET,
    path: officer.photoPath,
  });
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = officer.name
    .split(" ")
    .map((p) => p.match(/\p{L}/u)?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const showImage = url && url !== failedUrl;
  return (
    <Reveal interactive delay={(index % 3) * 0.06}>
      <article className="lab-panel lab-officer">
        <div className="lab-portrait">
          {showImage ? (
            <Image
              src={url}
              alt={`${officer.name} headshot`}
              fill
              sizes="(min-width: 1000px) 360px, (min-width: 460px) 45vw, 90vw"
              className="object-cover"
              unoptimized
              onError={() => setFailedUrl(url)}
            />
          ) : (
            <>
              <div className="lab-initials" aria-hidden="true">
                {initials}
              </div>
              <span className="lab-photo-fallback">
                {loading ? "Loading portrait…" : "Photo coming soon"}
              </span>
            </>
          )}
        </div>
        <div className="lab-officer-info">
          <p className="lab-eyebrow">
            {officer.team} / {String(index + 1).padStart(2, "0")}
          </p>
          <h3>{officer.name}</h3>
          <p className="text-amber-300 text-sm">{officer.role}</p>
          <p>{officer.description}</p>
        </div>
      </article>
    </Reveal>
  );
}
export default function OfficerGrid({ officers }) {
  return (
    <div className="lab-officers">
      {officers.map((officer, index) => (
        <OfficerCard key={officer.name} officer={officer} index={index} />
      ))}
    </div>
  );
}
