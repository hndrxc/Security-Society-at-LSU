import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PageHeading, Panel } from "@/components/ui/primitives";
import AccountForm from "./account-form";
import { getAuthData } from "../../../utils/auth/getAuthData";

export default async function Account() {
  const { user, profile, isProfileComplete } = await getAuthData();
  if (!user) redirect("/login");

  return (
    <PageShell user={user} profile={profile} currentPath="/account">
      <PageHeading
        eyebrow="Member / Profile"
        title="Manage your account details"
        description="Update your info and sign out securely."
      />
      <div className="max-w-2xl">
        <Panel>
          <AccountForm key={user.id} user={{ id: user.id, email: user.email }} profile={profile} isProfileIncomplete={!isProfileComplete} />
        </Panel>
      </div>
    </PageShell>
  );
}
