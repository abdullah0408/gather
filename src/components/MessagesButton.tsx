"use client";

import kyInstance from "@/lib/ky";
import type { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { MailIcon } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () =>
      kyInstance.get("api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Messages"
      asChild
    >
      <Link href="/messages">
        <div className="relative">
          <MailIcon />
          {!!data?.unreadCount && data.unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>

        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  );
}
