import type { CommentData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeCreatedAt } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { userDetails } = useAuth();
  return (
    <div className="flex gap-3 py-3 group/comment">
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/profile/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={`/profile/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.firstName || comment.user.lastName
                ? `${comment.user.firstName ?? ""} ${
                    comment.user.lastName ?? ""
                  }`.trim()
                : comment.user.username}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeCreatedAt(comment.createdAt)}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
      {comment.userId === userDetails?.clerkId && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
