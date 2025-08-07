import kyInstance from "@/lib/ky";
import type { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["like-info", postId],
    queryFn: async () =>
      kyInstance.get(`api/posts/${postId}/likes`).json<LikeInfo>(),

    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`api/posts/${postId}/likes`)
        : kyInstance.post(`api/posts/${postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["like-info", postId],
      });

      const previousState = queryClient.getQueryData<LikeInfo>([
        "like-info",
        postId,
      ]);

      queryClient.setQueryData<LikeInfo>(["like-info", postId], () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },

    onError: (error, variables, context) => {
      queryClient.setQueryData(["like-info", postId], context?.previousState);
      console.error("Error updating like state:", error);

      toast.error(
        `Failed to ${data.isLikedByUser ? "unlike" : "like"} the post.`
      );
    },
  });

  return (
    <button
      onClick={() => mutate()}
      className="flex items-center gap-2 cursor-pointer"
    >
      <HeartIcon
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500"
        )}
      />

      <span className="text-sm font-medium tabular-nums">
        {data.likes}{" "}
        <span className="hidden sm:inline">{` like${
          data.likes === 1 ? "" : "s"
        }`}</span>
      </span>
    </button>
  );
}
