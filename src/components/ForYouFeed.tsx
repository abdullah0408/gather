"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Post from "./posts/Post";
import type { PostData } from "@/lib/types";

export default function ForYouFeed() {
  const query = useQuery<PostData[]>({
    queryKey: ["post-feed", "for-you"],
    queryFn: async () => {
      const response = await fetch("/api/posts/for-you");
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.status}`);
      }
      return response.json();
    },
  });

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (query.status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  if (query.status === "success" && query.data.length === 0) {
    return <p className="text-center">No posts yet.</p>;
  }

  return (
    <>
      {query.data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
