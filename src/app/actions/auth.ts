"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { Team } from "@/lib/types";

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      redirect("/onboarding");
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  redirect("/onboarding");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function createTeamAndProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("handle")
      .eq("id", existingProfile.team_id)
      .single();
    redirect(existingTeam ? `/team/${existingTeam.handle}` : "/");
  }

  const fullName = formData.get("fullName") as string;
  const teamName = formData.get("teamName") as string;
  const teamHandle = formData.get("teamHandle") as string;
  const sanitizedHandle = teamHandle.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  const { error } = await supabase.rpc("create_team_and_profile", {
    _user_id: user.id,
    _team_name: teamName,
    _team_handle: sanitizedHandle,
    _full_name: fullName || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You are already a member of a team" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(`/team/${sanitizedHandle}`);
}

export async function joinTeam(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  const fullName = formData.get("fullName") as string;

  if (!inviteCode) {
    return { error: "Please enter an invite code" };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("handle")
      .eq("id", existingProfile.team_id)
      .single();
    redirect(existingTeam ? `/team/${existingTeam.handle}` : "/");
  }

  // Look up team by invite code
  const { data: team } = await supabase
    .from("teams")
    .select("id, handle")
    .eq("invite_code", inviteCode)
    .single();

  if (!team) {
    return { error: "Invalid invite code. Please check with your team admin." };
  }

  const { error } = await supabase.rpc("join_team", {
    _user_id: user.id,
    _team_id: team.id,
    _invite_code: inviteCode,
    _full_name: fullName || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You are already a member of a team" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(team ? `/team/${team.handle}` : "/");
}
