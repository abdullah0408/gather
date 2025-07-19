import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/user/username/:username
 *
 * This endpoint returns a user's profile information.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Path Parameters:
 *  username: The username of the user to retrieve.
 *
 * Response codes:
 *  200 – OK, returns the user object.
 *  401 – Unauthorized (no valid Clerk session)
 *  404 – Not Found (user with the specified username does not exist)
 *  500 – Internal Server Error (unexpected exception)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
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
    // Query Prisma to find the user by their username.
    // This includes checking if the authenticated user follows the target user
    //
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Case-insensitive search
        },
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
            followerId: authenticatedUserId,
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

    // If no user is found with the provided username, return a 404 Not Found response.
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.error("Error fetching posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
