"use client";

import { useUserSession } from "@/queries/user/profile-query";
import { useUsersProfile } from "@/queries/user/user-profile-query";
import * as React from "react";
import ProfileSection from "@/components/profile/ProfileSection";

export default function ProfilePage() {
  const { data: user } = useUserSession();
  const { data: usersProfile } = useUsersProfile();
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F5E59] via-[#0d4d48] to-[#0a3f3b] p-4 md:p-5 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Profile</h1>
            <p className="text-white/80 text-sm">Manage your personal information and security</p>
          </div>
        </div>
      </div>

      <ProfileSection user={user} usersProfile={usersProfile} />
    </div>
  );
}

