"use server";

import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import {
  updateUserProfileSchema,
  type updateUserProfileValues,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { imagekit } from "@/lib/imageKit";

export async function updateUserProfile(
  values: updateUserProfileValues,
  avatar?: File,
  uuid?: string
) {
  const validationValues = updateUserProfileSchema.parse(values);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  let avatarUrl: string | undefined = undefined;

  if (avatar) {
    // Use the provided UUID or generate a new one
    const fileId = uuid || crypto.randomUUID();
    const fileBuffer = await avatar.arrayBuffer();
    const response = await imagekit.upload({
      file: Buffer.from(fileBuffer),
      fileName: `avatar_${fileId}.webp`,
      useUniqueFileName: false,
      folder: "avatars",
    });
    avatarUrl = response.url;
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { clerkId: userId },
      data: {
        ...validationValues,
        avatarUrl: avatarUrl || validationValues.avatarUrl,
      },
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
        name: updatedUser.username,
        image: updatedUser.avatarUrl || undefined,
      },
    });
    return updatedUser;
  });

  return updatedUser;
}
