import { prisma } from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/user/[userId]/followers
 *
 * This endpoint returns the follower information for a specific user,
 * including the count of followers and whether the authenticated user follows them.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 *   userId (required): The Clerk ID of the user whose follower information is to be retrieved.
 *
 * Response codes:
 *   200 – OK, returns an object containing follower count and follow status.
 *   401 – Unauthorized (no valid Clerk session)
 *   404 – Not Found (user with the specified userId not found)
 *   500 – Internal Server Error (unexpected exception)
 */
export async function GET({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
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
    // Query Prisma to find the user by their Clerk ID.
    // This includes checking if the authenticated user follows the target user
    //
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        followers: {
          where: {
            followerId: authenticatedUserId, // Check if the authenticated user is following the target user
          },
          select: {
            followerId: true, // Select followerId to determine if a follow relationship exists
          },
        },
        _count: {
          select: {
            followers: true, // Count the total number of followers for the target user
          },
        },
      },
    });

    // If no user is found with the provided userId, return a 404 Not Found response.
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare the response data
    // `isFollowedByUser` indicates if the authenticated user follows the target user.
    // `followers` is the count of total followers for the target user.
    const Data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return NextResponse.json(Data, { status: 200 });
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/[userId]/followers
 *
 * This endpoint allows the authenticated user to follow another user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 *   userId (required): The Clerk ID of the user to be followed.
 *
 * Response codes:
 *   200 – OK, successfully followed the user.
 *   401 – Unauthorized (no valid Clerk session)
 *   500 – Internal Server Error (unexpected exception)
 */
export async function POST({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
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
    // Upsert a follow relationship in the database.
    // If the relationship already exists, it will not create a duplicate.
    // If it doesn't exist, it will create a new follow record.
    //
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: authenticatedUserId,
          followingId: userId,
        },
      },
      create: {
        followerId: authenticatedUserId,
        followingId: userId,
      },
      update: {},
    });

    return NextResponse.json(
      { message: "Followed successfully" },
      { status: 200 }
    );
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/[userId]/followers
 *
 * This endpoint allows the authenticated user to unfollow another user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 *   userId (required): The Clerk ID of the user to be unfollowed.
 *
 * Response codes:
 *   200 – OK, successfully unfollowed the user.
 *   401 – Unauthorized (no valid Clerk session)
 *   500 – Internal Server Error (unexpected exception)
 */
export async function DELETE({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
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
    // Delete the follow relationship from the database.
    // This will remove the follow record where the authenticated user is the follower and the target user is the following.
    //
    await prisma.follow.deleteMany({
      where: {
        followerId: authenticatedUserId,
        followingId: userId,
      },
    });

    return NextResponse.json(
      { message: "Unfollowed successfully" },
      { status: 200 }
    );
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
