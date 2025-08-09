import Link from "next/link";
import { Button } from "./ui/button";
import { BookmarkIcon, HomeIcon } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import NotificationsButton from "./NotificationsButton";
import MessagesButton from "./MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenubarProps {
  className?: string;
}

export default async function Menubar({ className }: MenubarProps) {
  const { userId } = await auth();

  if (!userId) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: userId,
        read: false, // Only count unread notifications
      },
    }),
    (await streamServerClient.getUnreadCount(userId)).total_unread_count,
  ]);

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
