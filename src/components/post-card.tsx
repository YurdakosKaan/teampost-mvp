import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PostWithTeam } from "@/lib/types";

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostCard({ post }: { post: PostWithTeam }) {
  const initials = post.teams.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex gap-3 border-b px-4 py-4 transition-colors hover:bg-muted/30">
      <Link href={`/team/${post.teams.handle}`} className="shrink-0">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/team/${post.teams.handle}`}
            className="truncate font-semibold hover:underline"
          >
            {post.teams.name}
          </Link>
          <Link
            href={`/team/${post.teams.handle}`}
            className="truncate text-sm text-muted-foreground"
          >
            @{post.teams.handle}
          </Link>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="shrink-0 text-sm text-muted-foreground">
            {timeAgo(post.created_at)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">
          {post.content}
        </p>
      </div>
    </article>
  );
}
