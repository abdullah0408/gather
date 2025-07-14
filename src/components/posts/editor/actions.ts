"use server";

import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function submitPost(input: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: No valid session");

  const { content } = createPostSchema.parse({ content: input });

  await prisma.post.create({
    data: {
      content,
      userId,
    },
  });
}
