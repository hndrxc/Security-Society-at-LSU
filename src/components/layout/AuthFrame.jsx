import PageBackground from "./PageBackground";
import NavbarClient from "@/components/NavbarClient";
import { Panel } from "@/components/ui/primitives";

export default function AuthFrame({ title, description, children }) {
  return (
    <PageBackground>
      <NavbarClient />
      <main id="main-content" className="lab-auth">
        <div className="lab-auth-intro">
          <p className="lab-eyebrow">Member access / Security Society at LSU</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="mt-10 border-t border-[var(--line)] pt-6">
            <p className="lab-eyebrow">Learn. Build. Defend.</p>
            <p className="text-sm mt-3">Fridays / 6:00–7:30 PM / PFT 1225</p>
          </div>
        </div>
        <Panel className="lab-auth-card">{children}</Panel>
      </main>
    </PageBackground>
  );
}
