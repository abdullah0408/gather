import { prisma } from "@/lib/prisma";
import type { CommentsPage } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  // Retrieve Clerk-authenticated user ID from the session.
  // If there’s no valid session, `userId` will be undefined.
  const { userId: authenticatedUserId } = await auth();

  // If not signed in via Clerk, block the request.
  if (!authenticatedUserId) {
    return NextResponse.json(
      { error: "Unauthorized: no valid session" },
      { status: 401 }
    );
  }

  // Extract the cursor from the request query parameters.
  const cursor = request.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 5; // Number of comments to fetch per request
  const { postId } = await params;

  try {
    // Fetch comments for the specified post.
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            firstName: true,
            lastName: true,
            bio: true,
            createdAt: true,
            clerkId: true,
            followers: {
              where: {
                followerId: authenticatedUserId,
              },
              select: {
                followerId: true,
              },
            },
            _count: {
              select: {
                posts: true,
                followers: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: -pageSize - 1,
    });

    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
