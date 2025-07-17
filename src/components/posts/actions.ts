"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function deletePost(postId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new Error("Post not found");
  if (post.userId !== userId) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id: postId },
    include: {
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return deletedPost;
}
