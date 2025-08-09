import Link from "next/link";
import { Button } from "./ui/button";
import { BookmarkIcon, HomeIcon } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import NotificationsButton from "./NotificationsButton";
import MessagesButton from "./MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenubarProps {
  className?: string;
}

export default async function Menubar({ className }: MenubarProps) {
  const user = await currentUser();

  if (!user) return null;

  const publicMetadata = user.publicMetadata;

  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (!!publicMetadata) {
    try {
      [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
        prisma.notification.count({
          where: {
            recipientId: user.id,
            read: false, // Only count unread notifications
          },
        }),
        streamServerClient.getUnreadCount(user.id).then(result => result.total_unread_count).catch(error => {
          // If user doesn't exist in Stream yet (common during user sync), return 0
          if (error && typeof error === "object" && "code" in error && error.code === 16) {
            console.log("User not found in Stream, returning 0 unread count");
            return 0;
          }
          throw error;
        }),
      ]);
    } catch (error) {
      console.error("Error fetching counts in Menubar:", error);
      // Fallback to 0 counts if there's an error
      unreadNotificationsCount = 0;
      unreadMessagesCount = 0;
    }
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <div className="relative">
            <HomeIcon />
          </div>
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <div className="relative">
            <BookmarkIcon />
          </div>
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}
