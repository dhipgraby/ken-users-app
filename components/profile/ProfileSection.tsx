"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { changeUserPassword, updateUserProfile } from "@/lib/actions/user-profile";

type ProfileSectionProps = {
    user?: any;
    usersProfile?: any;
};

export default function ProfileSection({ user, usersProfile }: ProfileSectionProps) {
  const { retrieveAccessToken } = useSession();
  const queryClient = useQueryClient();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [origUsername, setOrigUsername] = React.useState("");
  const [origEmail, setOrigEmail] = React.useState("");
  const [origFirstName, setOrigFirstName] = React.useState("");
  const [origLastName, setOrigLastName] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [changingPwd, setChangingPwd] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const nextEmail = user.email ?? "";
    setEmail(nextEmail);

    if (user.name) {
      const parts = String(user.name).trim().split(" ");
      const fn = parts[0] || "";
      const ln = parts.slice(1).join(" ") || "";
      setFirstName(fn);
      setLastName(ln);
      setOrigFirstName(fn);
      setOrigLastName(ln);
      setUsername(user.name || "");
      setOrigUsername(user.name || "");
    }

    setOrigEmail(nextEmail);
  }, [user]);

  React.useEffect(() => {
    if (!usersProfile) return;
    if (usersProfile.email) setEmail(usersProfile.email);
    if (usersProfile.username !== undefined) {
      setUsername(usersProfile.username || "");
      setOrigUsername(usersProfile.username || "");
    }
    if (usersProfile.first_name !== undefined) {
      setFirstName(usersProfile.first_name || "");
      setOrigFirstName(usersProfile.first_name || "");
    }
    if (usersProfile.last_name !== undefined) {
      setLastName(usersProfile.last_name || "");
      setOrigLastName(usersProfile.last_name || "");
    }
    if (usersProfile.email !== undefined) {
      setOrigEmail(usersProfile.email || "");
    }
  }, [usersProfile]);

  const emailValid = !email || /\S+@\S+\.\S+/.test(email);
  const passwordMinLen = 8;
  const passwordLengthValid = newPassword.length === 0 || newPassword.length >= passwordMinLen;
  const passwordsMatch = newPassword === confirmPassword;
  const profileDirty = (
    email !== origEmail ||
        username !== origUsername ||
        firstName !== origFirstName ||
        lastName !== origLastName
  );

  const onSaveProfile = async () => {
    try {
      setSaving(true);
      const token = await retrieveAccessToken();
      console.log("token", token);

      const payload: any = {
        username: username || undefined,
        email: email || undefined,
        first_name: firstName || undefined,
        last_name: lastName || undefined
      };

      if (!token) return;
      const res: any = await updateUserProfile(token, payload);
      const isOk = typeof res?.status === "number" ? res.status >= 200 && res.status < 300 : true;
      if (!isOk) {
        toast.error(res?.message || "Failed to update profile");
      } else {
        toast.success(res?.message || "Profile updated");
      }
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["users-profile"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setChangingPwd(true);
      const token = await retrieveAccessToken();
      if (!token) return;
      const res: any = await changeUserPassword(token, { newPassword });
      const isOk = typeof res?.status === "number" ? res.status >= 200 && res.status < 300 : true;
      if (!isOk) {
        toast.error(res?.message || "Failed to change password");
      } else {
        toast.success(res?.message || "Password changed");
      }
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 md:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <Input
              className={`h-10 ${email && !emailValid ? "border-destructive" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
            {email && !emailValid && (
              <span className="mt-1 block text-xs text-destructive">Enter a valid email address</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
            <Input
              className="h-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
            <Input
              className="h-10"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
            <Input
              className="h-10"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="default"
            className="w-full h-10 text-sm font-medium bg-[#0F5E59] hover:bg-[#0d4d48] transition-colors"
            disabled={saving || !profileDirty || (!!email && !emailValid)}
            onClick={onSaveProfile}
            type="button"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 md:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <Input
              type="password"
              className={`h-10 ${newPassword && !passwordLengthValid ? "border-destructive" : ""}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            {newPassword && !passwordLengthValid && (
              <span className="mt-1 block text-xs text-destructive">Password must be at least {passwordMinLen} characters</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
            <Input
              type="password"
              className={`h-10 ${confirmPassword && !passwordsMatch ? "border-destructive" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            {confirmPassword && !passwordsMatch && (
              <span className="mt-1 block text-xs text-destructive">Passwords do not match</span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="default"
            className="w-full h-10 text-sm font-medium bg-[#0F5E59] hover:bg-[#0d4d48] transition-colors"
            disabled={changingPwd || !newPassword || !passwordLengthValid || !passwordsMatch}
            onClick={onChangePassword}
            type="button"
          >
            {changingPwd ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                                Changing...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
