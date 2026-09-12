import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PageHeading, Panel } from "@/components/ui/primitives";
import AccountForm from "./account-form";
import { createClient } from "../../../utils/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (!user) {
    redirect("/login");
  }

  // Check if profile is incomplete
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, is_admin")
    .eq("id", user.id)
    .single();

  const isProfileIncomplete =
    !profile?.username?.trim() || !profile?.full_name?.trim();

  return (
    <PageShell user={user} profile={profile} currentPath="/account">
      <PageHeading
        eyebrow="Member / Profile"
        title="Manage your account details"
        description="Update your info and sign out securely."
      />
      <div className="max-w-2xl">
        <Panel>
          <AccountForm user={user} isProfileIncomplete={isProfileIncomplete} />
        </Panel>
      </div>
    </PageShell>
  );
}
