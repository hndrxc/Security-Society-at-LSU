"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';

// Dynamically import RonConsole to reduce initial bundle size
const RonConsole = dynamic(() => import('./RonConsole'), {
  loading: () => null,
  ssr: false,
});

export default function RonProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [heldKeys, setHeldKeys] = useState(new Set());
  const { user, profile } = useSupabaseProfile();

  // Extract username from profile data, fallback to 'hacker'
  const username = profile?.username
    || user?.user_metadata?.username
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'hacker';

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      setHeldKeys((prev) => {
        const next = new Set(prev);
        next.add(key);

        // Check for R+O+N combination
        if (next.has('r') && next.has('o') && next.has('n')) {
          setIsOpen(true);
        }

        return next;
      });
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setHeldKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    // Clear held keys when window loses focus
    const handleBlur = () => {
      setHeldKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <>
      {children}
      {isOpen && (
        <RonConsole
          username={username}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
