import { prisma } from "@/lib/prisma";
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
        where: { clerkId: userId }
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

      await prisma.user.update({
        where: { clerkId: metadata.user.clerkId },
        data: { avatarUrl: file.url },
      });

      return {
        avatarUrl: file.url,
      };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
