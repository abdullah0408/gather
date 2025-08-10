import { prisma } from "@/lib/prisma";
import { PostsPage } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract the search query from the request URL
  const q = request.nextUrl.searchParams.get("q") || "";

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
  const pageSize = 10; // Number of posts to fetch per request

  try {
    //
    // Query Prisma for a paginated list of posts, including user details.
    // The `take` value fetches one more than `pageSize` to determine if there's a next page.
    // The `cursor` is used for pagination to fetch posts created before a specific post ID.
    //
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              contains: q, // Use contains for content search
            },
          },
          {
            user: {
              username: {
                contains: q, // Use contains for username search
              },
            },
          },
          {
            user: {
              firstName: {
                contains: q, // Use contains for first name search
              },
            },
          },
          {
            user: {
              lastName: {
                contains: q, // Use contains for last name search
              },
            },
          },
        ],
      },
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
            likes: true, // Count the total number of likes for the post
            comments: true, // Count the total number of comments for the post
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
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Determine the next cursor for pagination. If more posts were fetched than the page size,
    // the last post's ID becomes the next cursor; otherwise, there are no more pages
    const nextCursor =
      posts.length > pageSize ? posts[posts.length - 1].id : null;

    // Prepare the response data, slicing the posts to the requested page size.
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    // If found, return the entire array of Post objects (JSON).
    return NextResponse.json(data);
  } catch (error) {
    // If anything goes wrong (e.g., database connectivity), log and return 500.
    console.log("Error fetching search results: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
