"use client";
import React from "react";
import UserAvatar from "../user-avatar";
import { ThemeToggle } from "../theme-toggle";
import IconController from "../icon-controller";
import { useSidebar } from "./sidebar-provider";
import { useCurrentUser } from "@/queries/user/current-user";
// import BitcoinPrice from "../btc-price";

// ...removed page-title inspection; header now contains sidebar toggle + search

const DashboardHeader = () => {
  const { collapsed, toggle } = useSidebar();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  return (
    <header className="overflow-hidden flex h-14 lg:h-[60px] items-center gap-3 md:gap-4 border-b bg-gray-100/40 px-3 md:px-6 dark:bg-gray-800/40">
      {/* Left: burger + nav arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex items-center justify-center rounded-md border bg-white/80 px-2 py-2 text-gray-600 hover:bg-white hover:text-gray-900 dark:bg-gray-900/40 dark:text-gray-200"
        >
          <IconController icon={collapsed ? "sidebarOpen" : "sidebarClose"} />
        </button>
      </div>

      <div className="flex-1" />

      {/* Right: Theme + Avatar */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* <BitcoinPrice /> */}
        <ThemeToggle />
        <div className="group inline-flex items-center rounded-full px-1 py-1 gap-2 sm:gap-3 transition-colors hover:bg-gray-100">
          {userLoading ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="hidden md:block h-4 w-40 rounded bg-gray-200 animate-pulse" />
            </div>
          ) : (
            <>
              <UserAvatar imageUrl={user?.image ?? null} name={user?.name} />
              {user?.name && (
                <span className="hidden md:inline text-sm text-gray-600 max-w-[220px] truncate">
                  {user.name}
                </span>
              )}
            </>
          )}
        </div>
      </div>

    </header>
  );
};

export default DashboardHeader;
