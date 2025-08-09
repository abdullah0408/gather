"use server";

import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
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

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
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
    await streamServerClient.partialUpdateUser({
      id: updatedUser.clerkId,
      set: {
        name: (updatedUser.firstName + " " + updatedUser.lastName).trim(),
      },
    });
    return updatedUser;
  });

  return updatedUser;
}
