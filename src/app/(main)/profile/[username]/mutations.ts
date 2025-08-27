import type { updateUserProfileValues } from "@/lib/validation";
import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { PostsPage } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function useUpdateProfileMutation() {
  const router = useRouter();
  const { refetch } = useAuth();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
      uuid,
    }: {
      values: updateUserProfileValues;
      avatar?: File;
      uuid?: string;
    }) => {
      const formData = new FormData();
      formData.append("values", JSON.stringify(values));
      if (avatar) {
        formData.append("avatar", avatar);
      }
      if (uuid) {
        formData.append("uuid", uuid);
      }

      const response = await fetch("/api/user/user-details", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: async (updatedUser) => {
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.clerkId === updatedUser.clerkId) {
                  return {
                    ...post,
                    user: updatedUser,
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Refresh user data after successful profile update
      await refetch();

      router.refresh();

      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile. Please try again.`);
    },
  });

  return mutation;
}
