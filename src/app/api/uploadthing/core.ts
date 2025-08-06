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
      const oldAvatarUrl = metadata.user.avatarUrl

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1];

        await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      );

      await prisma.user.update({
        where: { clerkId: metadata.user.clerkId },
        data: { avatarUrl: newAvatarUrl },
      });

      return {
        avatarUrl: newAvatarUrl,
      };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
