import Navbar from "@/components/Navbar";
import PhishHero from "@/components/phishing/PhishHero";
import PhishingExperience from "@/components/phishing/PhishingExperience";
import { getAuthData } from "../../../utils/auth/getAuthData";
import styles from "@/components/phishing/phishing.module.css";

export const metadata = {
  title: "Spot the Phish | Security Society at LSU",
  description:
    "Test your phishing instincts in an interactive message-classification exercise from the Security Society at LSU.",
};

const discordInvite =
  process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/fepuyPTVGb";

export default async function SpotThePhishPage() {
  const { user, profile } = await getAuthData();

  return (
    <div className={styles.page}>
      <div className={styles.scanlines} aria-hidden="true" />
      <Navbar
        user={user}
        profile={profile}
        currentPath="/QR"
        maxWidth="6xl"
      />
      <main id="main-content">
        <PhishHero />
        <PhishingExperience discordInvite={discordInvite} />
      </main>
    </div>
  );
}
