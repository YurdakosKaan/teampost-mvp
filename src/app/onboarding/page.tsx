"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTeamAndProfile, joinTeam } from "@/app/actions/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamHandle, setTeamHandle] = useState("");
  const [handleEdited, setHandleEdited] = useState(false);

  function handleTeamNameChange(value: string) {
    setTeamName(value);
    if (!handleEdited) {
      setTeamHandle(slugify(value));
    }
  }

  async function handleCreateTeam(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createTeamAndProfile(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleJoinTeam(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await joinTeam(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join or create a team</CardTitle>
          <CardDescription>
            Every action on this platform is performed as a team. Pick yours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create new team</TabsTrigger>
              <TabsTrigger value="join">Join with code</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4">
              <form action={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Your name{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input id="fullName" name="fullName" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team name</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    placeholder="Vizio Engineering"
                    required
                    value={teamName}
                    onChange={(e) => handleTeamNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamHandle">Team handle</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">@</span>
                    <Input
                      id="teamHandle"
                      name="teamHandle"
                      placeholder="vizio-engineering"
                      required
                      pattern="^[a-z0-9_-]+$"
                      title="Lowercase letters, numbers, hyphens, and underscores only"
                      value={teamHandle}
                      onChange={(e) => {
                        setTeamHandle(e.target.value);
                        setHandleEdited(true);
                      }}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create team"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="mt-4">
              <form action={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinFullName">
                    Your name{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="joinFullName"
                    name="fullName"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite code</Label>
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    placeholder="e.g. a1b2c3d4"
                    required
                    className="font-mono tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask your team admin for the invite code
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Joining..." : "Join team"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
