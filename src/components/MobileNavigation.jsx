'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@base-ui/react/dialog';

export default function MobileNavigation({ links, currentPath }) {
  const [open, setOpen] = useState(false);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger className="lab-button lab-button--secondary lab-menu-trigger" aria-label="Open navigation">Menu <span aria-hidden="true">☰</span></Dialog.Trigger>
    <Dialog.Portal><Dialog.Backdrop className="lab-menu-backdrop" /><Dialog.Popup className="lab-menu">
      <div className="lab-menu-top"><Dialog.Title className="lab-eyebrow">Security Society / LSU</Dialog.Title><Dialog.Close className="lab-button lab-button--secondary" aria-label="Close navigation">Close ×</Dialog.Close></div>
      <Dialog.Description className="lab-muted">Explore the society.</Dialog.Description>
      <nav aria-label="Mobile navigation">{links.map(({ href, label, aliases = [] }) => <Link key={href} href={href} aria-current={(href === '/' ? currentPath === '/' : [href, ...aliases].some(p => currentPath === p || currentPath.startsWith(p + '/'))) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}<span aria-hidden="true">↗</span></Link>)}</nav>
    </Dialog.Popup></Dialog.Portal>
  </Dialog.Root>;
}
