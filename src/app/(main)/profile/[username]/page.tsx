import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import TrendsSidebar from "@/components/TrendsSidebar";
import type { FollowerInfo, UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { formatDate } from "date-fns";
import { formatCount } from "@/lib/utils";
import FollowersCount from "@/components/FollowersCount";
import FollowButton from "@/components/FollowButton";
import UsersPostFeed from "@/components/UsersPostFeed";
import Linkify from "@/components/Linkify";
import EditProfileButton from "@/components/EditProfileButton";

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
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
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { userId } = await auth();
  const { username } = await params;

  if (!userId) {
    return {
      title: "Profile",
      description: "User profile page",
    };
  }

  const user = await getUser(username, userId);
  return {
    title: `${user.firstName || user.username} (@${user.username})`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, userId);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={userId} />
        <div className="rounded-2xl bg-card p-5 shadow-sm ">
          <h2 className="text-center text-2xl font-bold">
            {user.firstName || user.lastName
              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
              : user.username}
            &apos;s posts
          </h2>
        </div>
        <UsersPostFeed userId={user.clerkId} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      (followerId) => followerId.followerId === loggedInUserId
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">
              {user.firstName || user.lastName
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : user.username}
            </h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatCount(user._count.posts)}
              </span>
            </span>
            <FollowersCount userId={user.clerkId} initialState={followerInfo} />
          </div>
        </div>
        {user.clerkId === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.clerkId} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="whitespace-pre-line overflow-hidden break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
