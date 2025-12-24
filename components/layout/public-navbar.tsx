"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import FrameworkLogo from "../framework-logo";

export const PublicNavbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <FrameworkLogo variant="dark" size={32} withShadow={false} />
          <span className="text-xl font-bold text-white tracking-tight font-sans">Ken Framework</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/docs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                    Documentation
        </Link>
        <Link href="/auth/login">
          <Button className="h-10 px-6 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-0 shadow-lg transition-all hover:scale-105 active:scale-95">
                        Login
          </Button>
        </Link>
      </div>
    </nav>
  );
};
