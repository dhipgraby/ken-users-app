"use server";

import { signOut } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Manual logout for Next.js 15 (avoid next-auth signOut sync access to async headers/cookies)
// We simply clear Auth.js / NextAuth related cookies and redirect.
// If you add other auth cookie names in the future, extend the prefixes array.
const COOKIE_PREFIXES = ["authjs.", "next-auth."];
const EXPLICIT_COOKIE_NAMES = [
  "authjs.session-token",
  "authjs.callback-url",
  "authjs.csrf-token",
  "next-auth.session-token",
  "next-auth.callback-url",
  "next-auth.csrf-token"
];

export async function logout() {
  const store = await cookies();

  // Delete explicit known names
  for (const name of EXPLICIT_COOKIE_NAMES) {
    if (store.get(name)) store.delete(name);
  }

  // Fallback: delete any cookie starting with a known prefix
  for (const c of store.getAll()) {
    if (COOKIE_PREFIXES.some(p => c.name.startsWith(p))) {
      store.delete(c.name);
    }
  }
  // Redirect to login (throws a NEXT_REDIRECT to terminate the action)

  await signOut();

  redirect("/auth/login");
}