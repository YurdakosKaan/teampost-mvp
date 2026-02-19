import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import type { PostWithTeam } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, teams(name, handle)")
    .order("created_at", { ascending: false })
    .limit(50);

  const typedPosts = (posts ?? []) as PostWithTeam[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-b px-4 py-4">
        <h1 className="text-xl font-bold">Home</h1>
        <p className="text-sm text-muted-foreground">
          Latest posts from all teams
        </p>
      </div>

      {typedPosts.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-muted-foreground">No posts yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to post on behalf of your team!
          </p>
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
