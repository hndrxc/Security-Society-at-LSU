"use client";

import { useEffect, useRef } from "react";
import styles from "./phishing.module.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ScrollWarningModal({ isOpen, discordInvite, onDismiss }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [];
    focusable[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div
        ref={dialogRef}
        className={styles.hackModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hack-title"
        aria-describedby="hack-description"
      >
        <div className={styles.modalTopline}>
          <span className={styles.warningIcon} aria-hidden="true">
            !
          </span>
          <span>UNAUTHORIZED ACCESS DETECTED</span>
          <span className={styles.modalCode}>ERR_0x1337</span>
        </div>
        <div className={styles.modalContent}>
          <h2
            className={styles.glitchTitle}
            data-text="You've been hacked!"
            id="hack-title"
          >
            You&apos;ve been hacked!
          </h2>
          <p className={styles.modalCopy} id="hack-description">
            Not actually—you&apos;re good this time. Never scan QR codes from
            strangers. To join the real SSL Discord, use the verified link below.
          </p>
          <a
            className={styles.discordLink}
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
          >
            Enter the SSL Discord <span aria-hidden="true">↗</span>
          </a>
          <button
            className={styles.dismissButton}
            type="button"
            onClick={onDismiss}
          >
            [ okay, play the game ]
          </button>
        </div>
        <div className={styles.modalFooter}>
          <span>connection secure</span>
          <span className={styles.loading} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
