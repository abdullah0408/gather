"use client";

import useFollowersInfo from "@/hooks/useFollowersInfo";
import type { FollowerInfo } from "@/lib/types";
import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const { data } = useFollowersInfo(userId, initialState);

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`api/user/${userId}/followers`)
        : kyInstance.post(`api/user/${userId}/followers`),
    onMutate: async () => {
      const queryKey: QueryKey = ["followers-info", userId];

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) + (data.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onError: (error, variables, context) => {
      console.error("Error toggling follow state: ", error);
      queryClient.setQueryData<FollowerInfo>(
        ["followers-info", userId],
        context?.previousState
      );
      toast.error(
        `Failed to ${
          data.isFollowedByUser ? "unfollow" : "follow"
        } user, please try again.`
      );
    },
  });
  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
