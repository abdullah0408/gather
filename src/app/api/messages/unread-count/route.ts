import streamServerClient from "@/lib/stream";
import type { MessageCountInfo } from "@/lib/types";
import { auth, currentUser, User } from "@clerk/nextjs/server";
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
  // If there’s no valid session, `user` will be undefined.
  // If the user is not synced with the database, return an empty count.
  const user = await currentUser();
  const authenticatedUserId = user?.id;
  // If not signed in via Clerk, block the request.
  if (!authenticatedUserId) {
    return NextResponse.json(
      { error: "Unauthorized: no valid session" },
      { status: 401 }
    );
  }
  const publicMetadata = user?.publicMetadata as User["publicMetadata"];
  if (publicMetadata?.isDbSynced === false) {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
