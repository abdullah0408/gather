"use client";

import type { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeCreatedAt } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import PostMenuButton from "./PostMenuButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { userDetails } = useAuth();
  return (
    <article className="group/post space-y-3 rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/profile/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/profile/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.firstName || post.user.lastName
                  ? `${post.user.firstName ?? ""} ${
                      post.user.lastName ?? ""
                    }`.trim()
                  : post.user.username}
              </Link>
            </UserTooltip>
            <Link
              href={`/post/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeCreatedAt(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.userId === userDetails?.clerkId && (
          <PostMenuButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
    </article>
  );
}
