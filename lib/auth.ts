"use client";
import React from "react";
import { auth } from "@/auth";
import { logout } from "./actions/logout";

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};

export function useHandleLogout() {
  const cb = React.useCallback(async () => {
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }

    // Clear server-side cookies
    await logout();

    // Clear all cookies client-side as fallback (including httpOnly ones won't work but try anyway)
    // This helps clear non-httpOnly cookies
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.split("=")[0].trim();
      // Try to delete with various domain/path combinations
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });

    // Force full page reload to login page
    // This ensures all client-side state is cleared
    window.location.href = "/auth/login";
  }, []);
  return cb;
}