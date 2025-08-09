"use client";

import type { NotificationCountInfo } from "@/lib/types";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface NotificationButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton({
  initialState,
}: NotificationButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: async () =>
      kyInstance
        .get("api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          {/* Badge inside button */}
          <BellIcon />
          {!!data?.unreadCount && data.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
              {data.unreadCount > 99 ? "99+" : data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  );
}
