import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl?: string | null | undefined;
  className?: string;
  size?: number;
}

export default function UserAvatar({
  avatarUrl,
  className,
  size = 48,
}: UserAvatarProps) {
    console.log("UserAvatar rendered with avatarUrl:", avatarUrl);
  return (
    <Image
      src={avatarUrl || "/avatar-placeholder.png"}
      alt="user-avatar"
      width={size}
      height={size}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
    />
  );
}
