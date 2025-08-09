import streamServerClient from "@/lib/stream";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/get-token
 *
 * This endpoint generates a Stream Chat token for the authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Response codes:
 *  200 – OK, returns the generated token.
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
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

    const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

    const token = streamServerClient.createToken(
      authenticatedUserId,
      expirationTime,
      issuedAt
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
