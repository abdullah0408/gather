import { prisma } from "@/lib/prisma";
import type { LikeInfo } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/posts/{postId}/likes
 *
 * This endpoint returns the number of likes for a specific post and whether the currently authenticated user has liked it.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 *  postId: The ID of the post to retrieve like information for.
 *
 * Response codes:
 *  200 – OK, returns an object containing the number of likes and a boolean indicating if the user has liked the post.
 *  401 – Unauthorized (no valid Clerk session)
 *  404 – Not Found (post not found)
 *  500 – Internal Server Error (unexpected exception)
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
    // Query Prisma to get the like information for the specified post.
    // This includes the total number of likes and whether the authenticated user has liked the post.
    //
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        likes: {
          where: {
            userId: authenticatedUserId,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true, // Count the total number of likes for the post
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching likes: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/{postId}/likes
 *
 * This endpoint allows an authenticated user to like a post.
 * It uses Prisma to upsert a like entry in the database and creates a notification for the
 * post owner if the liker is not the post owner.
 *
 * Path Parameters:
 *  postId: The ID of the post to like.
 *
 * Response codes:
 *  200 – OK, returns a success message.
 *  401 – Unauthorized (no valid Clerk session)
 *  500 – Internal Server Error (unexpected exception)
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
    // Check if the post exists and retrieve the userId of the post owner.
    // This is necessary to avoid notifying the post owner about their own like.
    //
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        userId: true, // Get the userId of the post owner
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      //
      // Upsert the like entry for the authenticated user and the specified post.
      // If the like already exists, it will not create a duplicate.
      // If it doesn't exist, it will create a new like entry.
      //
      prisma.like.upsert({
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
      }),
      ...(authenticatedUserId !== post.userId
        ? [
            //
            // Create a notification for the post owner if the liker is not the post owner.
            // This is done conditionally to avoid notifying the post owner about their own like.
            //
            prisma.notification.create({
              data: {
                issuerId: authenticatedUserId,
                recipientId: post.userId, // Notify the post owner
                postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(
      { message: "Post liked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error liking post: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/{postId}/likes
 *
 * This endpoint allows an authenticated user to remove their like from a post.
 * It uses Prisma to delete the like entry from the database and removes the notification for the post owner if it exists.
 *
 * Path Parameters:
 *  postId: The ID of the post to unlike.
 *
 * Response codes:
 *  200 – OK, returns a success message.
 *  401 – Unauthorized (no valid Clerk session)
 *  500 – Internal Server Error (unexpected exception)
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
    // Check if the post exists and retrieve the userId of the post owner.
    // This is necessary to avoid notifying the post owner about their own like.
    //
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        userId: true, // Get the userId of the post owner
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      //
      // Delete the like entry for the authenticated user and the specified post.
      //
      prisma.like.deleteMany({
        where: {
          userId: authenticatedUserId,
          postId,
        },
      }),
      //
      // Delete the notification for the post owner if it exists.
      //
      prisma.notification.deleteMany({
        where: {
          issuerId: authenticatedUserId,
          postId,
          type: "LIKE",
          recipientId: post.userId,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Like removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error unliking post: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
