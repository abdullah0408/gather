import { prisma } from "@/lib/prisma";
import type { NotificationCountInfo } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/notifications/unread-count
 *
 * This endpoint returns the count of unread notifications for the authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Response codes:
 *  200 – OK, returns an object containing the unread notification count.
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

  try {
    //
    // Count unread notifications for the authenticated user.
    // This counts notifications where `read` is false.
    //
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: authenticatedUserId,
        read: false, // Only count unread notifications
      },
    });

    const data: NotificationCountInfo = {
      unreadCount,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
