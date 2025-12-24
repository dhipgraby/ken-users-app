"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import pathUrls from "@/data/pathUrl.json";
import IconController from "../icon-controller";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ThemeToggle } from "../theme-toggle";
import UserAvatar from "../user-avatar";
import { useSidebar } from "./sidebar-provider";
import { useHandleLogout } from "@/lib/auth";
import FrameworkLogo from "../framework-logo";

// Sidebar visual styles to match screenshot
const baseLink =
  "flex items-center gap-3 rounded-xl px-5 py-4 text-white/80 hover:text-white transition-colors";
const selectedLink =
  "flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 text-white shadow-sm";

const DashboardNavBar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { collapsed } = useSidebar();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const logout = useHandleLogout();

  const bodyOverflowRef = useRef<string | null>(null);
  useEffect(() => {
    if (isDesktop) return;

    if (mobileMenuOpen) {
      if (bodyOverflowRef.current === null) {
        bodyOverflowRef.current = document.body.style.overflow;
      }
      document.body.style.overflow = "hidden";
      return;
    }

    if (bodyOverflowRef.current !== null) {
      document.body.style.overflow = bodyOverflowRef.current;
      bodyOverflowRef.current = null;
    }
  }, [mobileMenuOpen, isDesktop]);

  return (
    <div
      className={`
        ${isDesktop ? "lg:flex" : "lg:hidden"} 
        lg:h-dvh max-h-screen sticky top-0 bg-[#0F5E59] text-white
         ${isDesktop ? (collapsed ? "lg:w-[80px]" : "lg:w-[260px]") : ""} border-none transition-all duration-300 ease-in-out z-50`}
    >
      {isDesktop ? (
        <nav className="flex h-full w-full flex-col py-6">
          <div className="flex-1 overflow-y-auto">
            <div className={`flex h-[60px] items-center px-6 pb-6 ${collapsed ? "justify-center" : "justify-start"}`}>
              <Link className="flex items-center gap-2" href={pathUrls.dashboard.linkHref}>
                <FrameworkLogo variant="dark" size={32} withShadow={false} />
                {!collapsed && <span className="text-lg font-bold text-white tracking-tight">Ken Framework</span>}
              </Link>
            </div>
            <div className={`space-y-2 ${collapsed ? "px-1" : "px-2"}`}>
              <Link
                className={`${pathname === pathUrls.dashboard.linkHref ? selectedLink : baseLink} ${collapsed ? "justify-center px-0" : ""}`}
                href={pathUrls.dashboard.linkHref}
              >
                <IconController icon="grid" className="w-5 h-5" />
                {!collapsed && pathUrls.dashboard.linkText}
              </Link>

              <Link
                className={`${pathname === pathUrls.settings.linkHref ? selectedLink : baseLink} ${collapsed ? "justify-center px-0" : ""}`}
                href={pathUrls.settings.linkHref}
              >
                <IconController icon="settings" className="w-5 h-5" />
                {!collapsed && pathUrls.settings.linkText}
              </Link>
            </div>
          </div>

          <div className="space-y-2 px-2 pt-2">
            <Link
              className={`${pathname === pathUrls.get_support.linkHref ? selectedLink : baseLink} ${collapsed ? "justify-center px-0" : ""}`}
              href={pathUrls.get_support.linkHref}
            >
              <IconController icon="help" className="w-5 h-5" />
              {!collapsed && pathUrls.get_support.linkText}
            </Link>
            <button
              type="button"
              onClick={logout}
              className={`${baseLink} w-full ${collapsed ? "justify-center px-0" : "text-left"}`}
            >
              <IconController icon="logout" className="w-5 h-5" />
              {!collapsed && "Logout"}
            </button>
          </div>
        </nav>
      ) : (
        <div className="flex w-full items-center justify-between px-4 py-3 bg-[#0F5E59]">
          <button className="text-white" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <IconController icon="X" /> : <IconController icon="menu" />}
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserAvatar />
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer with Modern Design */}
      {!isDesktop && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[9998] ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleMobileMenu}
          />

          {/* Slide-in Drawer */}
          <nav
            className={`fixed top-0 left-0 h-full w-[280px] bg-gradient-to-br from-[#0F5E59] to-[#0a4540] text-white shadow-2xl transform transition-transform duration-300 ease-out z-[9999] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FrameworkLogo variant="dark" size={32} withShadow={false} />
                  <span className="text-lg font-bold tracking-tight">Ken Framework</span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <IconController icon="X" className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Section */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <UserAvatar />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Welcome back!</p>
                    <p className="text-xs text-white/70 truncate">Logged in</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === pathUrls.dashboard.linkHref
                      ? "bg-white/10 shadow-lg"
                      : "hover:bg-white/5"
                    }`}
                    href={pathUrls.dashboard.linkHref}
                  >
                    <IconController icon="grid" className="w-5 h-5" />
                    <span className="font-medium">{pathUrls.dashboard.linkText}</span>
                  </Link>

                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === pathUrls.settings.linkHref
                      ? "bg-white/10 shadow-lg"
                      : "hover:bg-white/5"
                    }`}
                    href={pathUrls.settings.linkHref}
                  >
                    <IconController icon="settings" className="w-5 h-5" />
                    <span className="font-medium">{pathUrls.settings.linkText}</span>
                  </Link>

                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === pathUrls.get_support.linkHref
                      ? "bg-white/10 shadow-lg"
                      : "hover:bg-white/5"
                    }`}
                    href={pathUrls.get_support.linkHref}
                  >
                    <IconController icon="help" className="w-5 h-5" />
                    <span className="font-medium">{pathUrls.get_support.linkText}</span>
                  </Link>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-3 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-200 transition-all"
                >
                  <IconController icon="logout" className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </div>
  );
};

export default DashboardNavBar;
