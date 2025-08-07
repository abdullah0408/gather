import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import { prisma } from "@/lib/prisma";
import type { UserData } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          clerkId: true,
          bio: true,
          createdAt: true,
          followers: {
            where: {
              followerId: loggedInUserId,
            },
            select: {
              followerId: true,
            },
          },
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      },
      attachments: true,
      bookmarks: {
        where: {
          userId: loggedInUserId,
        },
        select: {
          userId: true,
        },
      },
      likes: {
        where: {
          userId: loggedInUserId,
        },
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true, // Count the total number of likes for the post
        },
      },
    },
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({ params }: PageProps) {
  const { postId } = await params;

  const { userId } = await auth();

  if (!userId) return {};

  const post = await getPost(postId, userId);

  return {
    title: `${
      post.user.firstName || post.user.lastName
        ? `${post.user.firstName ?? ""} ${post.user.lastName ?? ""}`.trim()
        : post.user.username
    } ${post.content.slice(0, 50)}...`,
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, userId);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem] hidden lg:block h-fit w-80 flex-none">
        <Suspense fallback={<Loader2Icon className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { userId: loggedInUserId } = await auth();

  if (!loggedInUserId) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold ">About This User</div>
      <UserTooltip user={user}>
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.firstName || user.lastName
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : user.username}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user.bio}
        </div>
      </Linkify>

      {user.clerkId !== loggedInUserId && (
        <FollowButton
          userId={user.clerkId}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUserId
            ),
          }}
        />
      )}
    </div>
  );
}
