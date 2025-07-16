import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/posts/for-you
 *
 * This endpoint returns a feed of posts for the currently authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Response codes:
 *   200 – OK, returns the array of post objects
 *   401 – Unauthorized (no valid Clerk session)
 *   500 – Internal Server Error (unexpected exception)
 */
export async function GET() {
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
    // Query Prisma for all posts, including user details.
    //
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If found, return the entire array of Post objects (JSON).
    return NextResponse.json(posts);
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
