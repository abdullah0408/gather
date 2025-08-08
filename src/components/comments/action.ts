"use server";

import { prisma } from "@/lib/prisma";
import type { PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const { content: validatedContent } = createCommentSchema.parse({ content });

  const newComment = await prisma.comment.create({
    data: {
      content: validatedContent,
      postId: post.id,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          clerkId: true,
          createdAt: true,
          followers: {
            where: {
              followerId: userId,
            },
            select: {
              followerId: true,
            },
          },
          _count: {
            select: {
              posts: true,
              followers: true,
            },
          },
        },
      },
    },
  });

  return newComment;
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own comments");
  }

  const deletedComment = await prisma.comment.delete({
    where: { id: commentId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          clerkId: true,
          createdAt: true,
          followers: {
            where: {
              followerId: userId,
            },
            select: {
              followerId: true,
            },
          },
          _count: {
            select: {
              posts: true,
              followers: true,
            },
          },
        },
      },
    },
  });

  return deletedComment;
}
