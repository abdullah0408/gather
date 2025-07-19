import type { Post } from "@/generated/prisma";

export type PostData = Post & {
  user: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}
