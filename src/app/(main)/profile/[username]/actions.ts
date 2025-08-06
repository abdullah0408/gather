"use server";

import { prisma } from "@/lib/prisma";
import {
  updateUserProfileSchema,
  type updateUserProfileValues,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function updateUserProfile(values: updateUserProfileValues) {
  const validationValues = updateUserProfileSchema.parse(values);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const updatedUser = await prisma.user.update({
    where: { clerkId: userId },
    data: validationValues,
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      clerkId: true,
      bio: true,
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
          followers: true,
          posts: true,
        },
      },
    },
  });

  return updatedUser;
}
