"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { userDetails } = useAuth();
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={userDetails?.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Logged in as @{userDetails?.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/profile/${userDetails?.username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/sign-in" })}>
          <LogOutIcon className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
