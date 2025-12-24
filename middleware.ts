import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req): Promise<any | null> => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Normalize path to avoid trailing-slash mismatches (e.g. "/auth/login/" vs "/auth/login")
  const pathname = nextUrl.pathname.endsWith("/") && nextUrl.pathname !== "/"
    ? nextUrl.pathname.slice(0, -1)
    : nextUrl.pathname;

  // Server Actions / RSC POSTs can break if Middleware returns a redirect.
  // Next expects special headers for action redirects; a plain 307/308 from Middleware
  // often surfaces as: "An unexpected response was received from the server." (E394)
  const accept = req.headers.get("accept") ?? "";
  const isRscRequest = req.headers.get("rsc") === "1" || accept.includes("text/x-component");
  const isServerActionRequest =
    req.method === "POST" &&
    (req.headers.get("next-action") || req.headers.get("x-nextjs-action") || isRscRequest);

  if (isServerActionRequest) {
    return null;
  }

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  console.log("Middleware check", { isLoggedIn });

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {

    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    console.log("Redirecting to login because not logged in", {});

    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
};