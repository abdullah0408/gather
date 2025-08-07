import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

/**
 * GET /api/posts/bookmarked
 * This endpoint returns a paginated list of posts bookmarked by the currently authenticated user.
 * It relies on Clerk’s `auth()` function to verify the user’s session.
 *
 * Query Parameters:
 *  cursor (optional): A post ID to use as a cursor for pagination. Posts created before this ID will be returned.
 *
 * Response codes:
 *  200 – OK, returns an object containing an array of bookmarked post objects and a nextCursor for pagination.
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
  const pageSize = 10; // Number of bookmarked posts to fetch per request

  try {
    //
    // Query Prisma for a paginated list of bookmarked posts by the authenticated user, including user details.
    // The `take` value fetches one more than `pageSize` to determine if there's a next page.
    // The `cursor` is used for pagination to fetch posts created before a specific post ID.
    //
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: authenticatedUserId,
      },
      include: {
        post: {
          include: {
            attachments: true,
            bookmarks: {
              where: {
                userId: authenticatedUserId,
              },
              select: {
                userId: true,
              },
            },
            likes: {
              where: {
                userId: authenticatedUserId,
              },
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                bio: true,
                clerkId: true,
                createdAt: true,
                id: true,
                followers: {
                  select: {
                    followerId: true, // Include follower information
                  },
                },
                _count: {
                  select: {
                    followers: true,
                    posts: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Determine the next cursor for pagination. If more bookmarked posts were fetched than the page size,
    // the last bookmarked post's ID becomes the next cursor; otherwise, there are no more pages.
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[bookmarks.length - 1].id : null;

    // Create a structured response containing the bookmarked posts and the next cursor.
    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    // If found, return the entire array of bookmarked Post objects (JSON).
    return NextResponse.json(data);
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching bookmarked posts: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
