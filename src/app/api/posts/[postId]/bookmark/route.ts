import { prisma } from "@/lib/prisma";
import type { BookmarkInfo } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/posts/{postId}/bookmark
 * This endpoint checks if a post is bookmarked by the currently authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 * postId: The ID of the post to check for bookmarks.
 *
 * Response codes:
 * 200 – OK, returns an object containing a boolean indicating if the post is bookmarked by the user.
 * 401 – Unauthorized (no valid Clerk session)
 * 404 – Not Found (post not found)
 * 500 – Internal Server Error (unexpected exception)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
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

  try {
    //
    // Query Prisma to check if the post is bookmarked by the authenticated user.
    //
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: authenticatedUserId,
          postId,
        },
      },
    });

    // If the bookmark exists, it means the post is bookmarked by the user.
    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.error("Error checking bookmark status: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/{postId}/bookmark
 *
 * This endpoint allows an authenticated user to bookmark a post.
 * It uses an upsert operation to ensure that a user can only bookmark a post once.
 *
 * Path Parameters:
 * postId: The ID of the post to bookmark.
 *
 * Response codes:
 * 200 – OK, returns a success message.
 * 401 – Unauthorized (no valid Clerk session)
 * 500 – Internal Server Error (unexpected exception)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
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

  try {
    //
    // Upsert the bookmark entry for the authenticated user and the specified post.
    // If the bookmark already exists, it will not create a duplicate.
    // If it doesn't exist, it will create a new bookmark entry.
    //
    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: authenticatedUserId,
          postId,
        },
      },
      create: {
        userId: authenticatedUserId,
        postId,
      },
      update: {},
    });

    return NextResponse.json(
      { message: "Post bookmarked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bookmarking post: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/{postId}/bookmark
 *
 * This endpoint allows an authenticated user to remove a bookmark from a post.
 * It deletes the bookmark entry for the authenticated user and the specified post.
 *
 * Path Parameters:
 * postId: The ID of the post to remove the bookmark from.
 *
 * Response codes:
 * 200 – OK, returns a success message.
 * 401 – Unauthorized (no valid Clerk session)
 * 500 – Internal Server Error (unexpected exception)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
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

  try {
    //
    // Delete the bookmark entry for the authenticated user and the specified post.
    //
    await prisma.bookmark.deleteMany({
      where: {
        userId: authenticatedUserId,
        postId,
      },
    });

    return NextResponse.json(
      { message: "Bookmark removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing bookmark: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
