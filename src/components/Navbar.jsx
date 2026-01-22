import Link from "next/link";
import LogoBadge from "@/components/LogoBadge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/ctf", label: "CTF" },
  { href: "/about", label: "About" },
];

const MAX_WIDTH_CLASSES = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

/**
 * Check if a route is active based on the current path.
 * Handles nested routes (e.g., /ctf/123 matches /ctf)
 */
function isActiveRoute(href, currentPath) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}

/**
 * Reusable navigation bar component.
 *
 * @param {object} props
 * @param {object|null} props.user - Authenticated user object
 * @param {object|null} props.profile - User profile with is_admin, username
 * @param {string} props.currentPath - Current route path for active state
 * @param {string} [props.maxWidth="5xl"] - Max width class (5xl or 6xl)
 */
export default function Navbar({ user, profile, currentPath, maxWidth = "5xl" }) {
  const accountHref = user ? "/account" : "/login";
  const accountLabel = user ? (profile?.username || "Account") : "Login";
  const isAdmin = profile?.is_admin || false;

  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth] || "max-w-5xl";

  return (
    <header
      className={`relative mx-auto flex w-full ${maxWidthClass} flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8`}
    >
      {/* Animated border line */}
      <div className="absolute bottom-0 left-4 right-4 h-px border-animate sm:left-6 sm:right-6" />

      {/* Logo and branding */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LogoBadge size={48} className="shrink-0" priority />
        <div className="text-center sm:text-left">
          <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Security Society at LSU
          </p>
          <p className="text-base font-semibold text-slate-100">
            LSU&apos;s Best Cybersecurity Club
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex w-full flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-200 sm:w-auto sm:justify-end">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = isActiveRoute(href, currentPath);
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "font-terminal rounded-full border border-purple-700/60 bg-purple-800/40 px-4 py-2 text-xs uppercase tracking-wider text-amber-200 shadow-sm shadow-purple-900/40"
                  : "glitch-hover font-terminal rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-purple-700/40 hover:text-amber-200"
              }
            >
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="glitch-hover font-terminal rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-purple-700/40 hover:text-amber-200"
          >
            Admin
          </Link>
        )}

        <Link
          href={accountHref}
          className="pulse-glow rounded-full border border-amber-400/70 px-4 py-2 text-amber-200 transition-all hover:border-transparent hover:bg-amber-400 hover:text-black"
        >
          {accountLabel}
        </Link>
      </nav>
    </header>
  );
}
