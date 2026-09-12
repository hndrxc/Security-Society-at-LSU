import PageShell from "@/components/layout/PageShell";
import { ActionLink, PageHeading, Panel } from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import OfficerGrid from "@/components/about/OfficerGrid";
import { getAuthData } from "../../../utils/auth/getAuthData";

const officers = [
  {
    name: "Peyton 'Tai' Tran",
    role: "President",
    team: "Officer",
    photoPath: "tai.png",
    description:
      "Responsible for role and task delegation as well as overall management of club. Any uncertainty, ask me",
  },
  {
    name: "Bennett Marceaux",
    role: "Vice President",
    team: "Officer",
    photoPath: "bennett.jpg",
    description:
      "Responsible for communication between LSU, board, and members. This includes maintenance of newsletter and calendar. True president.",
  },

  {
    name: "Carter Hendricks",
    role: "Web-Master",
    team: "Officer",
    photoPath: "cartergood.png",
    description:
      "Responsible for maintaining the club's website and ensuring that all information is up to date. Also assists with any technical issues that may arise. ",
  },
  {
    name: "Simeon Orji",
    role: "Secretary",
    team: "Officer",
    photoPath: "CJ.png",
    description:
      "Responsible for assisting other members of the SSL board when they have tasks that require extra hands. I'm open to helping with any and all aspects of the club.",
  },
  {
    name: "Benito Mendoza",
    role: "Treasurer",
    team: "Officer",
    photoPath: "benito.png",
    description: "Responsible for SSL funds and fundraising",
  },
  {
    name: "Taylor Graham",
    role: "Outreach Chair",
    team: "Officer",
    photoPath: "taylor.jpg",
    description:
      "Works heavily with other officers to ensure all the communications being done are benefiting some part of the club. Outside parties can include companies for talks/sponsorships, potential speakers, and more.",
  },
  {
    name: "Alyvia Whitney",
    role: "Social Media Chair",
    team: "Officer",
    photoPath: "liv.png",
    description:
      "Responsible for managing the club's social media accounts and creating engaging content.",
  },
  {
    name: "Adam Zumwalt",
    role: "Ambassador",
    team: "Ambassadors",
    photoPath: "zed.png",
    description:
      "Ambassador for the club, responsible for representing the club at events and promoting the club to potential members.",
  },
  {
    name: "Cole Cadarette",
    role: "Ambassador",
    team: "Ambassadors",
    photoPath: "cole.jpg",
    description:
      "Ambassador for the club, responsible for representing the club at events and promoting the club to potential members.",
  },
  {
    name: "Ronald Gibson, III",
    role: "Senior Advisor",
    team: "just a guy",
    photoPath: "ronald.png",
    description:
      "Secret leader of LSU's secret Cybersecurity cult and facilitator of communications between SSL and outside parties.",
  },
];

export default async function AboutPage() {
  const { user, profile } = await getAuthData();

  return (
    <PageShell user={user} profile={profile} currentPath="/about">
      <Reveal className="lab-about-hero">
        <PageHeading
          eyebrow="02 / The people behind SSL"
          title="We teach, compete, and secure together."
          description="The Security Society at LSU empowers students to build defensive and offensive skills through labs, competitions, and mentorship. We welcome every background, from first-timers curious about cyber to veterans looking to lead red and blue team operations."
        />
        <div className="lab-actions">
          <ActionLink href="#officers">Meet the officers ↓</ActionLink>
          <ActionLink href="/" variant="secondary">
            Back to home
          </ActionLink>
        </div>
      </Reveal>
      <div className="lab-stat-grid">
        {[
          ["Founded", "2017"],
          ["Focus", "Hands-on labs"],
          ["Meetings", "Fridays"],
        ].map(([label, value]) => (
          <Panel key={label}>
            <p className="lab-eyebrow">{label}</p>
            <strong>{value}</strong>
          </Panel>
        ))}
      </div>
      <section id="officers">
        <div className="lab-section-title">
          <div>
            <p className="lab-eyebrow">Personnel / {officers.length} members</p>
            <h2>Meet the Officers</h2>
            <p className="lab-muted text-sm mt-3">
              A Quick Introduction to our Officers
            </p>
          </div>
          <ActionLink
            href="mailto:securitysocietylsu@protonmail.com"
            variant="secondary"
          >
            Contact us ↗
          </ActionLink>
        </div>
        <OfficerGrid officers={officers} />
      </section>
    </PageShell>
  );
}
