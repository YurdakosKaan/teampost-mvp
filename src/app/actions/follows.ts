"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function followTeam(targetTeamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "No team found" };

  if (profile.team_id === targetTeamId) {
    return { error: "Cannot follow your own team" };
  }

  const { error } = await supabase.from("follows").insert({
    follower_team_id: profile.team_id,
    following_team_id: targetTeamId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Already following this team" };
    }
    return { error: error.message };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function unfollowTeam(targetTeamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "No team found" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_team_id", profile.team_id)
    .eq("following_team_id", targetTeamId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  return { success: true };
}
