"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { followTeam, unfollowTeam } from "@/app/actions/follows";

interface FollowButtonProps {
  targetTeamId: string;
  isFollowing: boolean;
  isOwnTeam: boolean;
}

export function FollowButton({
  targetTeamId,
  isFollowing: initialIsFollowing,
  isOwnTeam,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  if (isOwnTeam) return null;

  async function handleClick() {
    setLoading(true);
    if (isFollowing) {
      const result = await unfollowTeam(targetTeamId);
      if (!result.error) setIsFollowing(false);
    } else {
      const result = await followTeam(targetTeamId);
      if (!result.error) setIsFollowing(true);
    }
    setLoading(false);
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
