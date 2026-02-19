"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function regenerateInviteCode(teamId: string) {
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

  if (!profile || profile.team_id !== teamId) {
    return { error: "You can only regenerate codes for your own team" };
  }

  const { error } = await supabase
    .from("teams")
    .update({ invite_code: crypto.randomUUID().slice(0, 8) })
    .eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  return { success: true };
}
