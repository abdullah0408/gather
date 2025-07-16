import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { submitPost } from "./actions";
import type { PostsPage } from "@/lib/types";

export function useSubmitPostMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed", "for-you"],
      };

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData?.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: null,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("Error submitting post: ", error);
      toast.error(`Failed to post, please try again.`);
    },
  });

  return mutation;
}
