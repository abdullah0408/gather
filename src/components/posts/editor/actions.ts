"use server";

import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function submitPost(input: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const { content } = createPostSchema.parse({ content: input });

  const newPost = await prisma.post.create({
    data: {
      content,
      userId,
    },
    include: {
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          clerkId: true,
          createdAt: true,
          id: true,
          followers: {
            select: {
              followerId: true,
            },
          },
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      },
    },
  });

  return newPost;
}
