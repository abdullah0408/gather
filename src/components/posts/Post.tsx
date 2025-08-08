"use client";

import type { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeCreatedAt } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import PostMenuButton from "./PostMenuButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@/generated/prisma";
import Image from "next/image";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useState } from "react";
import { MessageSquareIcon } from "lucide-react";
import Comments from "../comments/Comments";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { userDetails } = useAuth();
  const [showComments, setShowComments] = useState(false);

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
              suppressHydrationWarning
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
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: !!post.likes.length,
            }}
          />
          <CommentsButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: !!post.bookmarks.length,
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment) => (
        <MediaPreview key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  attachment: Media;
}

function MediaPreview({ attachment }: MediaPreviewProps) {
  if (attachment.type === "IMAGE") {
    return (
      <Image
        src={attachment.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (attachment.type === "VIDEO") {
    return (
      <video
        src={attachment.url}
        controls
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentsButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentsButton({ post, onClick }: CommentsButtonProps) {
  return (
    <button onClick={onClick} className="flex item-center gap-2 cursor-pointer">
      <MessageSquareIcon className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments || 0}{" "}
        <span className="hidden sm:inline">
          {post._count.comments === 1 ? "comment" : "comments"}
        </span>
      </span>
    </button>
  );
}
