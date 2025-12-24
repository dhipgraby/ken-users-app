"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { VendorsConfigSchema, VendorsConfig } from "@/schemas/zod/user-zod-schema";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import { useUserSettingsMutation } from "@/queries/user/profile-query";
import { toast } from "sonner";
import { saveSettings } from "@/lib/actions/save-settings";
import { useSession } from "@/hooks/useSession";

const UserSettings = ({
  user,
  userSettings,
  showEmail = true
}: {
  user: any;
  userSettings: any;
  showEmail?: boolean;
}) => {

  const { retrieveAccessToken } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<VendorsConfig>({
    resolver: zodResolver(VendorsConfigSchema),
    defaultValues: {
      email: userSettings?.email || user?.email || "",
      feeRate: 2,
      isTwoFactorEnabled: userSettings?.isTwoFactorEnabled || false
    }
  });

  React.useEffect(() => {
    if (showEmail) return;
    if (!user?.email) return;
    form.setValue("email", user.email, { shouldValidate: true, shouldDirty: false });
  }, [showEmail, user?.email, form]);

  const { submitSettingsMutation } = useUserSettingsMutation();

  const onSubmit = async (values: VendorsConfig) => {
    if (values.feeRate) values.feeRate = Number(values.feeRate);

    const accessToken = await retrieveAccessToken();
    if (!accessToken) {
      setErrorMsg("User not authenticated");
      return;
    }
    const creating = await submitSettingsMutation.mutateAsync({
      setIsLoading,
      setErrorMsg,
      serverAction: async () => await saveSettings(values, accessToken)
    });

    if (creating.serverResponse.status && creating.serverResponse.status === 200) {
      setSuccess(creating.serverResponse.message);
      toast.success("User settings saved successfully");
    }
  };

  if (!user) return <h1>User not found</h1>;

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Personal Information Card */}
          {showEmail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your email</p>
                </div>
              </div>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="your.email@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {!showEmail && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} type="hidden" />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {/* Security Settings Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage two-factor authentication</p>
              </div>
            </div>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="isTwoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3 hover:border-[#0F5E59] dark:hover:border-emerald-500 transition-colors">
                    <div className="space-y-0.5 flex-1">
                      <FormLabel className="text-sm font-medium">Email Authentication</FormLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive verification codes via email</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && <Alert message={errorMsg} type="error" />}
          {success && <Alert message={success} type="success" />}

          {/* Submit Button */}
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full h-10 text-sm font-medium bg-[#0F5E59] hover:bg-[#0d4d48] transition-colors"
          >
            {isLoading ? (
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
        </form>
      </Form>
    </div>
  );
};

export default UserSettings;
