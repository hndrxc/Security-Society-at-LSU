"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const MobileNavigationDialog = dynamic(
  () => import("./MobileNavigationDialog"),
  {
    ssr: false,
    loading: () => (
      <span role="status" className="sr-only">
        Opening navigation…
      </span>
    ),
  },
);

export default function MobileNavigation({ links, currentPath }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const triggerRef = useRef(null);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="lab-button lab-button--secondary lab-menu-trigger"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setHasOpened(true);
          setOpen(true);
        }}
      >
        Menu <span aria-hidden="true">☰</span>
      </button>
      {hasOpened && (
        <MobileNavigationDialog
          links={links}
          currentPath={currentPath}
          open={open}
          onOpenChange={setOpen}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
