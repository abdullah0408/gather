import type { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
// import { formatRelativeCreatedAt } from "@/lib/utils";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  return (
    <article className="space-y-3 rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Link href={`/profile/${post.user.username}`}>
          <UserAvatar avatarUrl={post.user.avatarUrl} />
        </Link>
        <div>
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
          <Link
            href={`/post/${post.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {/* {formatRelativeCreatedAt(post.createdAt)} */}
          </Link>
        </div>
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
