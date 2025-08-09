import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { auth } from "@clerk/nextjs/server";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      // Retrieve Clerk-authenticated user ID from the session.
      // If there’s no valid session, `userId` will be undefined.
      const { userId } = await auth();

      // If not signed in via Clerk, block the request.
      if (!userId) throw new UploadThingError("Unauthorized");

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) throw new UploadThingError("User not found");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split("/f/")[1];

        if (key) {
          await new UTApi().deleteFiles(key);
        }
      }

      await Promise.all([
        await prisma.user.update({
          where: { clerkId: metadata.user.clerkId },
          data: { avatarUrl: file.url },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.clerkId,
          set: {
            image: file.url,
          },
        }),
      ]);

      await prisma.user.update({
        where: { clerkId: metadata.user.clerkId },
        data: { avatarUrl: file.url },
      });

      return {
        avatarUrl: file.url,
      };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      // Retrieve Clerk-authenticated user ID from the session.
      // If there’s no valid session, `userId` will be undefined.
      const { userId } = await auth();

      // If not signed in via Clerk, block the request.
      if (!userId) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url,
          type: file.type.toLowerCase().startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
