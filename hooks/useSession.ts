"use client";
import { getSession } from "next-auth/react";
import { logout } from "@/lib/actions/logout";

export const useSession = () => {

  const retrieveAccessToken = async () => {
    if (typeof window === "undefined") return null;

    // Primary source: localStorage (used by axios calls to backend)
    const existing = localStorage.getItem("accessToken");
    if (existing && existing !== "") return existing;

    // Fallback: NextAuth session (Google login stores backend token in session.user.accessToken)
    // This prevents an immediate logout right after OAuth redirect.
    const session = await getSession();
    const sessionToken = (session as any)?.user?.accessToken as string | undefined;
    if (sessionToken) {
      localStorage.setItem("accessToken", sessionToken);
      return sessionToken;
    }

    // No token anywhere → clear and log out
    localStorage.removeItem("accessToken");
    console.log("logging out.. because no token");
    await logout();
    return null;
  };

  return {
    retrieveAccessToken
  };
};