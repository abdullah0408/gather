import React, { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const TrendsSidebar = async () => {
  const usersToFollow = await fetchUsersToFollow();

  return (
    <div className="sticky top-[5.25rem] hidden w-72 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow users={usersToFollow} />
        {/* <TrandingTopics /> */}
      </Suspense>
    </div>
  );
};

// Server-side function to fetch data
async function fetchUsersToFollow() {
  const usersToFollow = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
    take: 5,
  });

  return usersToFollow;
}

// Client-side component
function WhoToFollow({ users }) {
  if (!users || users.length === 0) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who To Follow</div>
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
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

async function TrandingTopics() {
    
}

// export default TrendsSidebar;
