"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { regenerateInviteCode } from "@/app/actions/teams";

interface InviteCodeProps {
  teamId: string;
  code: string;
}

export function InviteCode({ teamId, code }: InviteCodeProps) {
  const [currentCode, setCurrentCode] = useState(code);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    const result = await regenerateInviteCode(teamId);
    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 rounded-md bg-muted p-3">
      <p className="text-xs font-medium">This is your team</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Invite code:</span>
        <code className="rounded bg-background px-1.5 py-0.5 font-mono text-sm text-foreground">
          {currentCode}
        </code>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              disabled={loading}
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Regenerate invite code?</AlertDialogTitle>
              <AlertDialogDescription>
                This will invalidate the current invite code. Anyone with the old
                code won&apos;t be able to join your team. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerate}>
                Regenerate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Share this code with people you want to invite to your team
      </p>
    </div>
  );
}
