"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RonConsole to reduce initial bundle size
const RonConsole = dynamic(() => import('./RonConsole'), {
  loading: () => null,
  ssr: false,
});

export default function RonProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    // Held keys are transient input, not rendered state.
    const heldKeys = new Set();
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.matches?.('input, textarea, select') || e.target.isContentEditable) {
        heldKeys.clear();
        return;
      }

      const key = e.key.toLowerCase();

      heldKeys.add(key);
      if (heldKeys.has('r') && heldKeys.has('o') && heldKeys.has('n')) {
        setIsOpen(true);
        heldKeys.clear();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      heldKeys.delete(key);
    };

    // Clear held keys when window loses focus
    const handleBlur = () => {
      heldKeys.clear();
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
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
