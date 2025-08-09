import type { Media, Post } from "@/generated/prisma";

export type PostData = Post & {
  attachments: Media[];
  bookmarks: {
    userId: string;
  }[];
  likes: {
    userId: string;
  }[];
  _count: {
    likes: number; // Count the total number of likes for the post
    comments: number; // Count the total number of comments for the post
  };
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

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export type CommentData = {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user: {
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
};

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export type NotificationData = {
  id: string;
  recipientId: string;
  issuerId: string;
  postId: string | null;
  type: "FOLLOW" | "LIKE" | "COMMENT";
  read: boolean;
  createdAt: Date;
  issuer: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  post: {
    content: string;
  } | null;
};

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface NotificationCountInfo {
  unreadCount: number;
}
