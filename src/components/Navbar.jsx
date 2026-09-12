import Link from "next/link";
import LogoBadge from "@/components/LogoBadge";
import MobileNavigation from "./MobileNavigation";
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events", aliases: ["/ctf"] },
  { href: "/about", label: "About" },
];
export default function Navbar({ user, profile, currentPath = "/" }) {
  const links = [
    ...NAV_LINKS,
    ...(profile?.is_admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  const account = {
    href: user ? "/account" : "/login",
    label: user ? profile?.username || "Account" : "Log in",
  };
  return (
    <header className="lab-header">
      <div className="lab-header-inner">
        <Link
          href="/"
          className="lab-brand"
          aria-label="Security Society at LSU home"
        >
          <LogoBadge
            size={38}
            sizes="(min-width: 900px) 40px, 38px"
            className="lab-nav-logo"
            priority
          />
          <div>
            <strong>Security Society at LSU</strong>
            <small>LSU&apos;s Best Cybersecurity Club</small>
          </div>
        </Link>
        <nav className="lab-desktop-nav" aria-label="Main navigation">
          {links.map(({ href, label, aliases = [] }) => (
            <Link
              key={href}
              href={href}
              className="lab-nav-link"
              aria-current={
                (
                  href === "/"
                    ? currentPath === "/"
                    : [href, ...aliases].some(
                        (p) =>
                          currentPath === p || currentPath.startsWith(p + "/"),
                      )
                )
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="lab-header-actions">
          <Link
            className="lab-button lab-button--secondary lab-nav-account"
            href={account.href}
            prefetch={false}
            aria-current={currentPath === account.href ? "page" : undefined}
          >
            <span className="lab-nav-account-label">{account.label}</span>
            <span className="lab-nav-account-icon" aria-hidden="true">↗</span>
          </Link>
          <MobileNavigation
            links={[...links, account]}
            currentPath={currentPath}
          />
        </div>
      </div>
    </header>
  );
}
