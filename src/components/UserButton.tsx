"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { fetchUserDetails } from "@/lib/fetchUserDetails";
import Link from "next/link";
import { Check, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import SignOutButton from "./SignOutButton"; // Import the modified SignOutButton
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import Image from "next/image";
import { useTheme } from "next-themes"




interface userButtonProps {
  className?: string;
}

const UserButton = ({ className }: userButtonProps) => {
  const [user, setUser] = useState<any>(null);
  const {theme, setTheme} = useTheme()

  useEffect(() => {
    const getUserDetails = async () => {
      const userDetails = await fetchUserDetails();
      setUser(userDetails);
    };

    getUserDetails();
  }, []);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full out", className)}>
          <UserAvatar avatarUrl={(!user) ? avatarPlaceholder : user?.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Logged in as @{user?.username}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <Link href={`/users/${user?.username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Monitor className="mr-2 size-4" />
                Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-2 size-4"/>
                        System Defult
                        {theme === "system" && <Check className="mr-2 size-4"/>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 size-4"/>
                        Light
                        {theme === "light" && <Check className="mr-2 size-4"/>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 size-4"/>
                        Dark
                        {theme === "dark" && <Check className="mr-2 size-4"/>}
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOutButton className="bg-blue-900" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
