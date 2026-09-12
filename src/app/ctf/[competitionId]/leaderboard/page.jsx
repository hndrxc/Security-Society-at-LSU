// src/app/ctf/[competitionId]/leaderboard/page.jsx
import LeaderboardTable from "@/components/ctf/LeaderboardTable";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { Breadcrumbs, PageHeading, Badge } from "@/components/ui/primitives";
import { createClient } from "../../../../../utils/supabase/server";
import { getAuthData } from "../../../../../utils/auth/getAuthData";

export const revalidate = 30;

export default async function LeaderboardPage({ params }) {
  const { competitionId } = await params;
  const supabase = await createClient();
  const { user, profile } = await getAuthData();

  // Fetch competition
  const { data: competition, error: compError } = await supabase
    .from("ctf_competitions")
    .select("id, title, starts_at, ends_at")
    .eq("id", competitionId)
    .eq("is_active", true)
    .single();

  if (compError || !competition) {
    notFound();
  }

  // Fetch full leaderboard
  const { data: leaderboard } = await supabase.rpc(
    "get_competition_leaderboard",
    {
      p_competition_id: competitionId,
      p_limit: 100,
    },
  );

  // Get challenge count
  const { count: challengeCount } = await supabase
    .from("ctf_challenges")
    .select("*", { count: "exact", head: true })
    .eq("competition_id", competitionId)
    .eq("is_visible", true);

  return (
    <PageShell user={user} profile={profile} currentPath="/ctf" wide>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events#ctf" },
          { label: competition.title, href: `/ctf/${competitionId}` },
          { label: "Leaderboard" },
        ]}
      />
      <PageHeading
        eyebrow="CTF / Rankings"
        title="Leaderboard"
        description={competition.title}
      >
        <Badge>{challengeCount || 0} challenges</Badge>
      </PageHeading>
      <LeaderboardTable
        entries={leaderboard}
        currentUserId={user?.id}
        limit={100}
        detailed
        challengeCount={challengeCount}
      />
    </PageShell>
  );
}
