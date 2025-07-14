import type { Post } from "@/generated/prisma";

export type PostData = Post & {
  user: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};
