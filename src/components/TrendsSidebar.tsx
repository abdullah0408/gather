import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "./ui/button";
import UserAvatar from "./UserAvatar";
import { unstable_cache } from "next/cache";
import { formatCount } from "@/lib/utils";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden md:block lg:w-80 w-72 h-fit flex-none space-y-5">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <SuggestedUsersList />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function SuggestedUsersList() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay

  const suggestedUsers = await prisma.user.findMany({
    where: {
      NOT: {
        clerkId,
      },
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Follow</div>
      {suggestedUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : user.username}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </Link>
          <Button>Follow</Button>
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) as count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

    return result.map((item) => ({
      hashtag: item.hashtag,
      count: Number(item.count), // Convert bigint to number
    }));
  },
  ["trending_topics"],
  {
    revalidate: 60 * 60, // Revalidate every hour
  }
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const hashtagText = hashtag.split("#")[1];
        return (
          <Link
            key={hashtag}
            href={`/hashtag/${hashtagText}`}
            className="block"
          >
            <p
              className="font-semibold break-all line-clamp-1 hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCount(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
