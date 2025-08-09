import { prisma } from "@/lib/prisma";
import type { NotificationsPage } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications
 *
 * This endpoint retrieves a paginated list of notifications for the authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Query Parameters:
 *  cursor: Optional cursor for pagination. If provided, it fetches notifications after this cursor.
 *
 * Response codes:
 *  200 – OK, returns an object containing notifications and a nextCursor for pagination.
 *  401 – Unauthorized (no valid Clerk session)
 *  500 – Internal Server Error (unexpected exception)
 */
export async function GET(request: NextRequest) {
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
  const pageSize = 10; // Number of notifications to fetch per request

  try {
    //
    // Query Prisma to get notifications for the authenticated user.
    // It includes the issuer's details and the post content if applicable.
    // The notifications are ordered by creation date in descending order.
    // If a cursor is provided, it fetches notifications after that cursor.
    //
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: authenticatedUserId,
      },
      include: {
        issuer: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1, // Fetch one more than pageSize to check for next page
      cursor: cursor ? { id: cursor } : undefined,
    });
    // Determine the next cursor for pagination. If more notifications were fetched than the page size,
    // the last notification's ID becomes the next cursor; otherwise, there are no more pages.
    const nextCursor =
      notifications.length > pageSize
        ? notifications[notifications.length - 1].id
        : null;

    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
