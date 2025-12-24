"use client";

import React from "react";
import UserSettings from "@/components/forms/user/settings-form";
import { useUserSession, useUserSettingsQuery } from "@/queries/user/profile-query";
import { useUsersProfile } from "@/queries/user/user-profile-query";
import IconController from "@/components/icon-controller";
import ProfileSection from "@/components/profile/ProfileSection";

const SettingsPage = () => {

  const { data: user, isLoading: loadingUser } = useUserSession();
  const { data: usersProfile, isLoading: loadingUsersProfile } = useUsersProfile();
  const { data: userSettings, isLoading: loadingSettings } = useUserSettingsQuery();

  if (loadingUser || loadingUsersProfile || loadingSettings) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-56 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F5E59] via-[#0d4d48] to-[#0a3f3b] p-4 md:p-5 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <IconController icon="settings" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Account</h1>
            <p className="text-white/80 text-sm">Profile, security, and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile + Security */}
      <ProfileSection user={user} usersProfile={usersProfile} />

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 md:p-5">
        <UserSettings user={user} userSettings={userSettings} showEmail={false} />
      </div>
    </div>
  );
};

export default SettingsPage;
