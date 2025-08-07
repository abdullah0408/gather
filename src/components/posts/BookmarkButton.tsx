import kyInstance from "@/lib/ky";
import type { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["bookmark-info", postId],
    queryFn: async () =>
      kyInstance.get(`api/posts/${postId}/bookmark`).json<BookmarkInfo>(),

    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`api/posts/${postId}/bookmark`)
        : kyInstance.post(`api/posts/${postId}/bookmark`),
    onMutate: async () => {
      toast.message(
        data.isBookmarkedByUser ? "Removing bookmark..." : "Bookmarking post..."
      );

      await queryClient.cancelQueries({
        queryKey: ["bookmark-info", postId],
      });

      const previousState = queryClient.getQueryData<BookmarkInfo>([
        "bookmark-info",
        postId,
      ]);

      queryClient.setQueryData<BookmarkInfo>(["bookmark-info", postId], () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },

    onSuccess: () => {
      toast.success(
        data.isBookmarkedByUser ? "Post bookmarked" : "Bookmark removed"
      );
    },

    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["bookmark-info", postId],
        context?.previousState
      );
      console.error("Error updating bookmark state:", error);

      toast.error(
        `Failed to ${
          data.isBookmarkedByUser ? "remove bookmark from" : "bookmark"
        } the post.`
      );
    },
  });

  return (
    <button
      onClick={() => mutate()}
      className="flex items-center gap-2 cursor-pointer"
    >
      <BookmarkIcon
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary"
        )}
      />
    </button>
  );
}
