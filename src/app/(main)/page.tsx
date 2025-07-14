import PostEditor from "@/components/posts/editor/PostEditor";
import { prisma } from "@/lib/prisma";
import Post from "@/components/posts/Post";
export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="w-full min-w-0">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
