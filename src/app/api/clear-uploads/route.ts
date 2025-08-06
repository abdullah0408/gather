import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

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
        url: true,
      },
    });

    if (unusedUploads.length === 0) {
      return NextResponse.json(
        { message: "No unused uploads found" },
        { status: 200 }
      );
    }

    // Extract file keys, filtering out invalid URLs
    const fileKeys = unusedUploads
      .map((upload) => {
        const parts = upload.url.split('/f/');
        return parts.length > 1 ? parts[1] : null;
      })
      .filter((key): key is string => Boolean(key));

    if (fileKeys.length > 0) {
      await new UTApi().deleteFiles(fileKeys);
    }

    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedUploads.map((e) => e.id),
        },
      },
    });

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
