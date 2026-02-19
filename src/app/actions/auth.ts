"use server";

import { redirect } from "next/navigation";
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

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const teamName = formData.get("teamName") as string;
  const teamHandle = formData.get("teamHandle") as string;

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "Signup succeeded but no user ID was returned" };
  }

  const { error: teamError } = await supabase.rpc("create_team_and_profile", {
    _user_id: userId,
    _team_name: teamName,
    _team_handle: teamHandle.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
    _full_name: fullName || null,
  });

  if (teamError) {
    return { error: teamError.message };
  }

  redirect("/");
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

  const fullName = formData.get("fullName") as string;
  const teamName = formData.get("teamName") as string;
  const teamHandle = formData.get("teamHandle") as string;

  const { error } = await supabase.rpc("create_team_and_profile", {
    _user_id: user.id,
    _team_name: teamName,
    _team_handle: teamHandle.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
    _full_name: fullName || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function joinTeam(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const teamId = formData.get("teamId") as string;
  const fullName = formData.get("fullName") as string;

  const { error } = await supabase.rpc("join_team", {
    _user_id: user.id,
    _team_id: teamId,
    _full_name: fullName || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
