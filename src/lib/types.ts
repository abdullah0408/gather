import type { Post } from "@/generated/prisma";

export type PostData = Post & {
  user: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    clerkId: string;
    createdAt: Date;
    id: string;
    followers: {
      followerId: string;
    }[];
    _count: {
      followers: number;
      posts: number;
    };
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

export type UserData = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  clerkId: string;
  bio: string | null;
  createdAt: Date;
  followers: {
    followerId: string;
  }[];
  _count: {
    followers: number;
    posts: number;
  };
};
