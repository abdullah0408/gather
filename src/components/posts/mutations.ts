import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePost } from "./actions";
import type { PostsPage } from "@/lib/types";

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  const route = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        }
      );

      toast.success("Post deleted successfully!");

      if (pathname === `/post/${deletedPost.id}`)
        route.push(`/profile/${deletedPost.user.username}`);
    },
    onError(error) {
      console.error("Error deleting post: ", error);
      toast.error(`Failed to delete post, please try again.`);
    },
  });

  return mutation;
}
