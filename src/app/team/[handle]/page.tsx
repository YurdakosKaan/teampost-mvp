import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import { FollowButton } from "@/components/follow-button";
import { InviteCode } from "@/components/invite-code";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostWithTeam } from "@/lib/types";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function TeamProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!team) notFound();

  const [
    { data: posts },
    { count: followerCount },
    { count: followingCount },
    { count: memberCount },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("*, teams(name, handle)")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_team_id", team.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_team_id", team.id),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team.id),
  ]);

  const typedPosts = (posts ?? []) as PostWithTeam[];

  // Determine if the current user is part of this team and if they follow it
  let isOwnTeam = false;
  let isFollowing = false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      isOwnTeam = profile.team_id === team.id;

      if (!isOwnTeam) {
        const { data: follow } = await supabase
          .from("follows")
          .select("follower_team_id")
          .eq("follower_team_id", profile.team_id)
          .eq("following_team_id", team.id)
          .single();

        isFollowing = !!follow;
      }
    }
  }

  const initials = team.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Team header */}
      <div className="border-b px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{team.name}</h1>
              <p className="text-muted-foreground">@{team.handle}</p>
            </div>
          </div>
          {user && (
            <FollowButton
              targetTeamId={team.id}
              isFollowing={isFollowing}
              isOwnTeam={isOwnTeam}
            />
          )}
        </div>

        <div className="mt-4 flex gap-4">
          <div className="text-sm">
            <span className="font-semibold">{followingCount ?? 0}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{followerCount ?? 0}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="text-sm">
            <Badge variant="secondary">{memberCount ?? 0} members</Badge>
          </div>
        </div>

        {isOwnTeam && team.invite_code && (
          <InviteCode teamId={team.id} code={team.invite_code} />
        )}
      </div>

      {/* Team posts */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">Posts</h2>
      </div>

      {typedPosts.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-muted-foreground">No posts yet.</p>
        </div>
      ) : (
        <div>
          {typedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
