"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const content = (formData.get("content") as string)?.trim();

  if (!content || content.length === 0) {
    return { error: "Post content cannot be empty" };
  }

  if (content.length > 500) {
    return { error: "Post content cannot exceed 500 characters" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to post" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "You must belong to a team to post" };
  }

  const { error } = await supabase.from("posts").insert({
    team_id: profile.team_id,
    author_id: user.id,
    content,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
