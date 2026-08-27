"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PhishGame from "./PhishGame";
import ScrollWarningModal from "./ScrollWarningModal";
import styles from "./phishing.module.css";

const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", " ", "End"]);

export default function PhishingExperience({ discordInvite }) {
  const gameSectionRef = useRef(null);
  const [hasTriggeredWarning, setHasTriggeredWarning] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const dismissWarning = useCallback(() => {
    setIsWarningOpen(false);
    setShowJoin(true);
    requestAnimationFrame(() => {
      gameSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (hasTriggeredWarning) return undefined;

    const isInteractiveTarget = (target) => target instanceof HTMLElement && (
      target.matches("a, button, input, textarea, select") || target.isContentEditable
    );

    const revealWarning = (event) => {
      if (isInteractiveTarget(event.target)) return;
      setHasTriggeredWarning(true);
      setIsWarningOpen(true);
    };

    const handleKeyDown = (event) => {
      const target = event.target;
      if (!isInteractiveTarget(target) && SCROLL_KEYS.has(event.key)) revealWarning(event);
    };

    window.addEventListener("wheel", revealWarning, { passive: true });
    window.addEventListener("touchstart", revealWarning, { passive: true });
    window.addEventListener("scroll", revealWarning, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", revealWarning);
      window.removeEventListener("touchstart", revealWarning);
      window.removeEventListener("scroll", revealWarning);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasTriggeredWarning]);

  return (
    <>
      <section
        ref={gameSectionRef}
        className={styles.phishGame}
        id="phish-game"
        aria-labelledby="game-title"
      >
        <div className={styles.gameHeading}>
          <div>
            <p className={styles.sectionLabel}>02 / Live exercise</p>
            <h2 id="game-title">
              Spot the <em>phish.</em>
            </h2>
          </div>
          <p>
            Inspect each message, classify the threat, and identify the strongest
            signal before it reaches the network.
          </p>
        </div>
        <PhishGame />
      </section>

      {showJoin ? (
        <div className={styles.bottomJoin}>
          <a
            className={styles.primaryButton}
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
          >
            Join the verified Discord <span aria-hidden="true">↗</span>
          </a>
        </div>
      ) : null}

      <ScrollWarningModal
        isOpen={isWarningOpen}
        discordInvite={discordInvite}
        onDismiss={dismissWarning}
      />
    </>
  );
}
