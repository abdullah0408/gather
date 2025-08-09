import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import type { MessageCountInfo } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/messages/unread-count
 *
 * This endpoint returns the count of unread messages for the authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Response codes:
 *  200 – OK, returns an object containing the unread message count.
 *  401 – Unauthorized (no valid Clerk session)
 *  500 – Internal Server Error (unexpected exception)
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

  const user = await prisma.user.findUnique({
    where: { clerkId: authenticatedUserId },
  });

  // If user is not found in the database, return 0 unread count
  if (!user) {
    console.log("User not found in database, returning 0 unread count");
    const data: MessageCountInfo = {
      unreadCount: 0,
    };
    return NextResponse.json(data, { status: 200 });
  }
  try {
    const { total_unread_count } = await streamServerClient.getUnreadCount(
      authenticatedUserId
    );

    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching unread messages count:", error);

    // If user doesn't exist in Stream yet (common during user sync), return 0
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 16
    ) {
      console.log("User not found in Stream, returning 0 unread count");
      const data: MessageCountInfo = {
        unreadCount: 0,
      };
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
