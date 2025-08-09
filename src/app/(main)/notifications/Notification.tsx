import UserAvatar from "@/components/UserAvatar";
import { NotificationType } from "@/generated/prisma";
import type { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeartIcon, MessageCircleIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const notificationType: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${
        notification.issuer.firstName || notification.issuer.lastName
          ? `${notification.issuer.firstName ?? ""} ${
              notification.issuer.lastName ?? ""
            }`.trim()
          : notification.issuer.username
      } started following you.`,
      icon: <User2Icon className="size-7 text-primary" />,
      href: `/profile/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${
        notification.issuer.firstName || notification.issuer.lastName
          ? `${notification.issuer.firstName ?? ""} ${
              notification.issuer.lastName ?? ""
            }`.trim()
          : notification.issuer.username
      } commented on your post.`,
      icon: <MessageCircleIcon className="size-7 text-primary fill-primary" />,
      href: `/post/${notification.postId}`,
    },
    LIKE: {
      message: `${
        notification.issuer.firstName || notification.issuer.lastName
          ? `${notification.issuer.firstName ?? ""} ${
              notification.issuer.lastName ?? ""
            }`.trim()
          : notification.issuer.username
      } liked your post.`,
      icon: <HeartIcon className="size-7 text-red-500 fill-red-500" />,
      href: `/post/${notification.postId}`,
    },
  };

  const { message, icon, href } = notificationType[notification.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">
              {notification.issuer.firstName || notification.issuer.lastName
                ? `${notification.issuer.firstName ?? ""} ${
                    notification.issuer.lastName ?? ""
                  }`.trim()
                : notification.issuer.username}
            </span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
