import PageShell from "@/components/layout/PageShell";
import { ActionLink, Breadcrumbs, PageHeading } from "@/components/ui/primitives";
import { kernels } from "@/data/kernels";
import { getAuthData } from "../../../utils/auth/getAuthData";
import styles from "./kernels.module.css";

export const metadata = {
  title: "Kernels | Security Society at LSU",
  description:
    "Find your cybersecurity interest group at SSL: HiFoB for beginners, KHAN for vulnerability research, and S.H.I.E.L.D for blue teaming and home labs.",
};

export default async function KernelsPage() {
  const { user, profile } = await getAuthData();
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;

  return (
    <PageShell user={user} profile={profile} currentPath="/kernels">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Kernels" }]} />
      <div className={styles.hero}>
        <PageHeading
          eyebrow="SSL / Interest groups"
          title="Find your Kernel."
          description="A shared interest. A team to build with. Kernels are long-term group projects focused on a specific cybersecurity niche, led by a team captain we call a Kernel Colonel."
        />
        <p className={styles.intro}>
          Learn through lectures and group projects, build experience for your
          resume, and explore the part of cyber that interests you. Seniors and
          alumni can join, too.
        </p>
        <div className="lab-actions">
          <ActionLink
            href={discordInvite || "mailto:securitysocietylsu@protonmail.com"}
            {...(discordInvite ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {discordInvite ? "Find your team on Discord" : "Ask about joining"}
            <span aria-hidden="true">↗</span>
          </ActionLink>
          <ActionLink href="/events" variant="secondary">Explore events</ActionLink>
        </div>
      </div>

      <nav className={styles.directory} aria-label="Jump to a Kernel">
        {kernels.map((kernel, index) => (
          <a key={kernel.id} href={`#${kernel.id}`} className={styles[kernel.id]}>
            <span className="lab-eyebrow">0{index + 1} / {kernel.name}</span>
            <span className={styles.directoryFocus}>{kernel.focus}</span>
            <span className={styles.directoryArrow} aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>

      <div className={styles.sections}>
        {kernels.map((kernel, index) => (
          <section
            key={kernel.id}
            id={kernel.id}
            aria-labelledby={`${kernel.id}-heading`}
            className={`${styles.kernel} ${styles[kernel.id]}`}
          >
            <div className={styles.identity}>
              <p className={`lab-eyebrow ${styles.focus}`}>0{index + 1} / {kernel.focus}</p>
              <h2 id={`${kernel.id}-heading`}>{kernel.name}</h2>
              <p className={styles.fullName}>{kernel.fullName}</p>
              <div className={styles.colonel}>
                <p className="lab-eyebrow">Kernel Colonel</p>
                <p>{kernel.colonel}</p>
              </div>
            </div>
            <div className={styles.details}>
              <p className={styles.description}>{kernel.description}</p>
              <h3>What you’ll work on</h3>
              <ul className={styles.activities}>
                {kernel.activities.map((activity) => <li key={activity}>{activity}</li>)}
              </ul>
              <div className={styles.outcome}>
                <h3>{kernel.outcome}</h3>
                <p>{kernel.outcomeDetail}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
      <aside className={styles.note} aria-label="Suggest a Kernel">
        <p>Have a different cyber niche in mind?</p>
        <p className="lab-muted">
          Bring your idea to the club. Could be AI security research,
          video game hacking, spacecraft hacking, or anything else as possibilities for future Kernels.
        </p>
        <ActionLink href="mailto:securitysocietylsu@protonmail.com" variant="secondary">
          Share a Kernel idea <span aria-hidden="true">↗</span>
        </ActionLink>
      </aside>
    </PageShell>
  );
}
