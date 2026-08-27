import styles from "./phishing.module.css";

export default function PhishHero() {
  return (
    <section className={styles.hero} aria-labelledby="phish-hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>
          <span className={styles.statusDot} aria-hidden="true" />
          Baton Rouge / Est. 2017
        </p>
        <h1 id="phish-hero-title" className={styles.heroTitle}>
          Think like an
          <br />
          <em>attacker.</em>
          <br />
          Defend like a tiger.
        </h1>
        <p className={styles.heroDescription}>
          A student-led community for curious minds building sharper instincts,
          stronger systems, and a safer digital LSU.
        </p>
      </div>

      <div
        className={styles.terminalWrap}
        aria-label="Security Society terminal status"
      >
        <div className={styles.terminalBar}>
          <span className={`${styles.terminalDot} ${styles.red}`} />
          <span className={`${styles.terminalDot} ${styles.yellow}`} />
          <span className={`${styles.terminalDot} ${styles.green}`} />
          <span className={styles.terminalLabel}>ssl_society // live</span>
        </div>
        <div className={styles.terminalBody}>
          <p>
            <span className={styles.prompt}>$</span> whoami
          </p>
          <p className={styles.terminalOutput}>security_society_lsu</p>
          <p>
            <span className={styles.prompt}>$</span> cat current_status.txt
          </p>
          <p className={`${styles.terminalOutput} ${styles.accent}`}>
            [ ONLINE ]
          </p>
          <p className={styles.terminalOutput}>
            systems curious
            <br />
            defenses active
            <br />
            doors open
          </p>
          <p>
            <span className={styles.prompt}>$</span>{" "}
            <span className={styles.cursor} aria-hidden="true" />
          </p>
        </div>
        <div className={styles.terminalNote}>{"// no experience required"}</div>
      </div>

      <div className={styles.heroIndex} aria-hidden="true">
        001 <span>/</span> 002
      </div>
    </section>
  );
}
