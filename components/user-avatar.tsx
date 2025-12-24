"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
  // Use primitive trigger manually to avoid Slot-based wrapper with element.ref access
} from "@/components/ui/dropdown-menu";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useHandleLogout } from "@/lib/auth";

type Props = {
  imageUrl?: string | null;
  name?: string | null | undefined;
};

const initials = (name?: string | null) => {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const UserAvatar = ({ imageUrl, name }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          className="rounded-full border-0 p-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          aria-label="Open user menu"
        >
          <Avatar className="h-9 w-9 ring-2 ring-[#0F5E59] bg-white">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name ?? "user avatar"} />
            ) : (
              <>
                <AvatarImage src="" alt={name ?? "user avatar"} />
                <AvatarFallback className="bg-white">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </AvatarFallback>
              </>
            )}
            {/* fallback to initials if image fails to load */}
            <AvatarFallback className="bg-white text-gray-500 hidden">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuContent align="end">
        <LoggedUserMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LoggedUserMenu = () => {
  const logout = useHandleLogout(); // call hook at top-level of component
  return (
    <>
      {/* User Info Header */}
      <div className="px-2 py-3 bg-gradient-to-r from-[#0F5E59]/10 to-emerald-500/10 rounded-t-lg">
        <DropdownMenuLabel className="font-normal p-0">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">My Account</p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
              Manage your account settings
            </p>
          </div>
        </DropdownMenuLabel>
      </div>
      <DropdownMenuSeparator />

      {/* Menu Items */}
      <DropdownMenuGroup>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings" className="flex items-center py-2.5 px-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-3">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Account</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Profile, security & preferences</span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Logout */}
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          logout();
        }}
        className="cursor-pointer py-2.5 px-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 mr-3">
          <LogOut className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Log out</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</span>
        </div>
      </DropdownMenuItem>
    </>
  );
};

export default UserAvatar;
