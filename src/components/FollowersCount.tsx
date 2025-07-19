"use client";

import useFollowersInfo from "@/hooks/useFollowersInfo";
import type { FollowerInfo } from "@/lib/types";
import { formatCount } from "@/lib/utils";

interface UserProfileProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowersCount({
  userId,
  initialState,
}: UserProfileProps) {
  const { data } = useFollowersInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatCount(data.followers)}</span>
    </span>
  );
}
