"use server";

import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function submitPost(input: {
  content: string;
  mediaIds?: string[];
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const { content, mediaIds } = createPostSchema.parse(input);

  if (mediaIds && mediaIds.length > 0) {
    const media = await prisma.media.findMany({
      where: {
        id: {
          in: mediaIds,
        },
      },
    });

    if (media.length !== mediaIds.length) {
      throw new Error("Invalid media IDs");
    }
  }

  const newPost = await prisma.post.create({
    data: {
      content,
      userId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: {
      attachments: true,
      bookmarks: {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
      },
      likes: {
        where: {
          userId: userId,
        },
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true, // Count the total number of likes for the post
          comments: true, // Count the total number of comments for the post
        },
      },
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
