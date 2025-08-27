import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imageKit";

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unusedUploads = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
              },
            }
          : {}),
      },
      select: {
        id: true,
        fileId: true,
      },
    });

    if (unusedUploads.length === 0) {
      return NextResponse.json(
        { message: "No unused uploads found" },
        { status: 200 }
      );
    }

    for (let i = 0; i < unusedUploads.length; i += BATCH_SIZE) {
      const batch = unusedUploads.slice(i, i + BATCH_SIZE);

      const fileIds = batch.map((upload) => upload.fileId);

      if (fileIds.length > 0) {
        await imagekit.bulkDeleteFiles(fileIds);
      }

      await prisma.media.deleteMany({
        where: {
          id: {
            in: batch.map((e) => e.id),
          },
        },
      });
    }

    return NextResponse.json(
      { message: "Unused uploads cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal server error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
