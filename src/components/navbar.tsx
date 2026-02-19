import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let teamName: string | null = null;
  let teamHandle: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id, teams(name, handle)")
      .eq("id", user.id)
      .single();

    if (profile?.teams) {
      const team = profile.teams as unknown as { name: string; handle: string };
      teamName = team.name;
      teamHandle = team.handle;
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          TeamPost
        </Link>

        <nav className="flex items-center gap-3">
          {user && teamHandle ? (
            <>
              <Link
                href={`/team/${teamHandle}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                @{teamHandle}
              </Link>
              <Link href="/compose">
                <Button size="sm">New post</Button>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : user && !teamHandle ? (
            <>
              <Link href="/onboarding">
                <Button size="sm">Set up team</Button>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
