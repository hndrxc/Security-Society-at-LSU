import Link from 'next/link';
import LogoBadge from '@/components/LogoBadge';
import MobileNavigation from './MobileNavigation';
const NAV_LINKS = [{ href: '/', label: 'Home' }, { href: '/events', label: 'Events', aliases: ['/ctf'] }, { href: '/about', label: 'About' }];
export default function Navbar({ user, profile, currentPath = '/' }) {
  const links = [...NAV_LINKS, ...(profile?.is_admin ? [{ href: '/admin', label: 'Admin' }] : [])];
  const account = { href: user ? '/account' : '/login', label: user ? (profile?.username || 'Account') : 'Log in' };
  return <header className="lab-header"><div className="lab-header-inner">
    <Link href="/" className="lab-brand" aria-label="Security Society at LSU home"><LogoBadge size={38} priority /><div><strong>Security Society at LSU</strong><small>LSU&apos;s Best Cybersecurity Club</small></div></Link>
    <nav className="lab-desktop-nav" aria-label="Main navigation">{links.map(({ href, label, aliases = [] }) => <Link key={href} href={href} className="lab-nav-link" aria-current={(href === '/' ? currentPath === '/' : [href, ...aliases].some(p => currentPath === p || currentPath.startsWith(p + '/'))) ? 'page' : undefined}>{label}</Link>)}<Link className="lab-button lab-button--secondary ml-3" href={account.href} aria-current={currentPath === account.href ? 'page' : undefined}>{account.label}<span aria-hidden="true">↗</span></Link></nav>
    <MobileNavigation links={[...links, account]} currentPath={currentPath} />
  </div></header>;
}
