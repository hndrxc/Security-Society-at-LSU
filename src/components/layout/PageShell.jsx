import Navbar from '@/components/Navbar';
import PageBackground from './PageBackground';

export default function PageShell({ children, user, profile, currentPath, wide = false, className = '' }) {
  return <PageBackground><Navbar user={user} profile={profile} currentPath={currentPath} maxWidth={wide ? '6xl' : '5xl'} /><main id="main-content" className={`lab-container ${wide ? 'lab-container--wide' : ''} ${className}`}>{children}</main><footer className="lab-footer"><span>Security Society at LSU</span><span className="font-terminal">Learn. Build. Defend.</span></footer></PageBackground>;
}
