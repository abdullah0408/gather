import Post from "@/components/posts/Post";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          clerkId: true,
          bio: true,
          createdAt: true,
          followers: {
            where: {
              followerId: loggedInUserId,
            },
            select: {
              followerId: true,
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
      attachments: true,
    },
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({ params }: PageProps) {
  const { postId } = await params;

  const { userId } = await auth();

  if (!userId) return {};

  const post = await getPost(postId, userId);

  return {
    title: `${
      post.user.firstName || post.user.lastName
        ? `${post.user.firstName ?? ""} ${post.user.lastName ?? ""}`.trim()
        : post.user.username
    } ${post.content.slice(0, 50)}...`,
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, userId);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
    </main>
  );
}

