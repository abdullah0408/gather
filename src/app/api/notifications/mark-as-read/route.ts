import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * PATCH /api/notifications/mark-as-read
 *
 * This endpoint marks all unread notifications as read for the authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Response codes:
 *  200 – OK, returns a success message.
 *  401 – Unauthorized (no valid Clerk session)
 *  500 – Internal Server Error (unexpected exception)
 */
export async function PATCH() {
  try {
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

    //
    // Mark all unread notifications as read for the authenticated user.
    // This updates the `read` field to true for all notifications
    // where `recipientId` matches the authenticated user ID.
    //
    await prisma.notification.updateMany({
      where: {
        recipientId: authenticatedUserId,
        read: false, // Only mark unread notifications as read
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(
      { message: "Notifications marked as read" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
