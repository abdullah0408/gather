"use client";

import type { FollowerInfo, UserData } from "@/lib/types";
import type { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import FollowButton from "./FollowButton";
import Linkify from "./Linkify";
import FollowersCount from "./FollowersCount";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const { userDetails } = useAuth();

  const followerState: FollowerInfo = {
    followers: user._count?.followers,
    isFollowedByUser: !!user.followers?.some(
      (follower) => follower.followerId === userDetails?.clerkId
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/profile/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {userDetails?.clerkId !== user.clerkId && (
                <FollowButton
                  userId={user.clerkId}
                  initialState={followerState}
                />
              )}
            </div>
            <div>
              <Link href={`/profile/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.firstName || user.lastName
                    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                    : user.username}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}
            <FollowersCount
              userId={user.clerkId}
              initialState={followerState}
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
