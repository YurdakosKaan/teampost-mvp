"use client";

import { useEffect, useState } from "react";
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
import { createTeamAndProfile, joinTeam, getTeams } from "@/app/actions/auth";
import type { Team } from "@/lib/types";

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

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
              <TabsTrigger value="join">Join existing</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4">
              <form action={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your name</Label>
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
                  <Label htmlFor="joinFullName">Your name</Label>
                  <Input
                    id="joinFullName"
                    name="fullName"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select a team</Label>
                  <input type="hidden" name="teamId" value={selectedTeamId || ""} />
                  {teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No teams yet. Create one instead!
                    </p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setSelectedTeamId(team.id)}
                          className={`w-full rounded-md border p-3 text-left transition-colors ${
                            selectedTeamId === team.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{team.handle}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !selectedTeamId}
                >
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
