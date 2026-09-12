"use client";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";

export default function MobileNavigationDialog({
  links,
  currentPath,
  open,
  onOpenChange,
  triggerRef,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="lab-menu-backdrop" />
        <Dialog.Popup className="lab-menu" finalFocus={triggerRef}>
          <div className="lab-menu-top">
            <Dialog.Title className="lab-eyebrow">
              Security Society / LSU
            </Dialog.Title>
            <Dialog.Close
              className="lab-button lab-button--secondary"
              aria-label="Close navigation"
            >
              Close ×
            </Dialog.Close>
          </div>
          <Dialog.Description className="lab-muted">
            Explore the society.
          </Dialog.Description>
          <nav aria-label="Mobile navigation">
            {links.map(({ href, label, aliases = [] }) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                aria-current={
                  (
                    href === "/"
                      ? currentPath === "/"
                      : [href, ...aliases].some(
                          (p) =>
                            currentPath === p ||
                            currentPath.startsWith(p + "/"),
                        )
                  )
                    ? "page"
                    : undefined
                }
                onClick={() => onOpenChange(false)}
              >
                {label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
