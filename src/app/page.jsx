import PageShell from "@/components/layout/PageShell";
import { ActionLink, Badge, Panel } from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "../../utils/supabase/server";
import { getLiveCtfEvent } from "../../utils/events/ctf";
// import SnowfallEffect from "@/components/SnowfallEffect";

export const revalidate = 60;
const highlights = [
  {
    title: "Community-first Programs",
    detail: "Workshops, mentorship, and resources shaped with our partners and neighbors.",
  },
  {
    title: "Capture the Flag Team",
    detail: "We organize CTF events and challenges for our members.",
  },
  {
    title: "Trusted Network",
    detail: "Local leaders, educators, and peers sharing their cybersecurity knowledge.",
  },
  {
    title: "Weekly Meetings",
    detail: "We meet every Friday from 6:00–7:30 PM in PFT 1225, with material for members of all skill levels.",
  },
];

// const stats = [
//   { label: "Members", value: "80+" },
//   { label: "Hours invested", value: "67k" },
//   { label: "Meetings", value: "3" },
// ];

const discordServerId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;

export default async function Home() {
  const supabase = await createClient();

  const now = new Date().toISOString();
  const [
    {
      data: { user },
    },
    { data: activeEvent },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getLiveCtfEvent(supabase, now),
  ]);

  // Fetch user profile if logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, username, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const accountHref = user ? "/account" : "/login";
  const displayName = profile?.username || "hacker";

  return (
    <PageShell user={user} profile={profile} currentPath="/">
      <section className="lab-hero">
        <Reveal className="lab-hero-copy">
          <p className="lab-eyebrow">Security Society at LSU / Est. 2017</p>
          <h1>Stay curious.<br /><em>Stay secure.</em></h1>
          <p className="lab-greeting">Hello {displayName}! <span aria-hidden="true">~/welcome.sh</span></p>
          <p>Welcome to the Security Society at LSU. We are a Cybersecurity club that aims to equip students with the technical skills needed in today&apos;s cybersecurity landscape, and provide job opportunities by connecting them with industry professionals.</p>
          <div className="lab-actions"><ActionLink href="#programs">Explore programs <span aria-hidden="true">↗</span></ActionLink><ActionLink href={accountHref} variant="secondary">{user ? "Go to your account" : "Login to your account"}</ActionLink></div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="lab-instrument" aria-hidden="true"><div className="lab-instrument-grid" /><div className="lab-instrument-top"><span>SSL / SECURITY LAB</span><span>01 — 04</span></div><div className="lab-orbit"><div className="lab-orbit-sweep" /><div className="lab-orbit-label">SSL<small>LEARN · BUILD · DEFEND</small></div></div><div className="lab-instrument-bottom"><span>BATON ROUGE, LA</span><span>30.41° N / 91.18° W</span></div></div>
        </Reveal>
      </section>
      <div className="lab-meeting-strip"><div><span className="lab-eyebrow">Weekly meetings</span><p>Fridays / 6:00–7:30 PM</p></div><div><span className="lab-eyebrow">Find us</span><p>PFT 1225</p></div><div><span className="lab-eyebrow">Get in touch</span><p><a href="mailto:securitysocietylsu@protonmail.com">securitysocietylsu@protonmail.com</a></p></div></div>
      {activeEvent && <Panel as="aside" aria-label="Live event CTF access" className="lab-live"><div><Badge tone="active">Live Event / Event CTF</Badge><h2>{activeEvent.title}</h2>{activeEvent.location && <p className="lab-muted">{activeEvent.location}</p>}</div><ActionLink href={`/ctf/${activeEvent.ctf_competition_id}`}>Open CTF <span aria-hidden="true">↗</span></ActionLink></Panel>}
      <div className="lab-section-title" id="programs"><div><p className="lab-eyebrow">01 / Programs</p><h2>Find your next challenge.</h2></div><span className="lab-eyebrow">{highlights.length} ways to get involved</span></div>
      <div className={discordServerId ? "lab-program-layout" : ""}>
        <section className="lab-programs" aria-label="Programs">{highlights.map((item, index) => <Reveal interactive key={item.title} delay={index * 0.06}><Panel as="article" className="lab-program"><p className="lab-eyebrow"><span>0{index + 1}</span><span aria-hidden="true">↗</span></p><h3>{item.title}</h3><p>{item.detail}</p></Panel></Reveal>)}</section>
        {discordServerId && <Panel className="lab-discord"><p className="lab-eyebrow">02 / Stay connected</p><h2>Join our Discord</h2><p className="lab-muted">Get event alerts, find teammates, and ask questions between meetings.</p>{discordInvite && <div className="lab-actions"><ActionLink href={discordInvite} target="_blank" rel="noreferrer">Open Invite ↗</ActionLink></div>}<iframe title="Discord server preview" src={`https://discord.com/widget?id=${discordServerId}&theme=dark`} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" loading="lazy" /></Panel>}
      </div>
    </PageShell>
  );
}
