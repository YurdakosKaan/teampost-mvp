export interface Team {
  id: string;
  name: string;
  handle: string;
  created_at: string;
}

export interface Profile {
  id: string;
  team_id: string;
  full_name: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  team_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
}

export interface PostWithTeam extends Post {
  teams: Pick<Team, "name" | "handle">;
}

export interface Follow {
  follower_team_id: string;
  following_team_id: string;
  created_at: string;
}
