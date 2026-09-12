'use client';
import { ViewTransition } from 'react';

// App Router supplies React's canary implementation. Keep this preview opt-in.
export default function TransitionRegion({ children, name, kind = 'lab-route' }) {
  if (process.env.NEXT_PUBLIC_UI_TRANSITIONS !== '1') return children;
  return <ViewTransition name={name} default={kind}>{children}</ViewTransition>;
}
