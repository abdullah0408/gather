import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/user-details
 *
 * This endpoint returns the Prisma User record for the currently authenticated Clerk user.
 * It relies on Clerk’s `auth()` function to verify the user’s session and extract their Clerk user ID.
 *
 * Response codes:
 *   200 – OK, returns the user object
 *   401 – Unauthorized (no valid Clerk session)
 *   404 – Not Found (no matching Prisma User row)
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
    // Query Prisma for the row whose `clerkId` matches the authenticated Clerk user ID.
    //
    const user = await prisma.user.findUnique({
      where: { clerkId: authenticatedUserId },
    });

    // If no row exists with that clerkId, return 404.
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If found, return the entire Prisma User object (JSON).
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.error("Error fetching user details: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}