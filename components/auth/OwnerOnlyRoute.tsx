"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// eslint-disable-next-line import/extensions
import { useOrgRole } from "@/hooks/useOrgRole";
import { AlertCircle } from "lucide-react";

interface OwnerOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that restricts access to Owner and System Admin only
 * Members are redirected to dashboard with an error message
 */
export default function OwnerOnlyRoute({ children }: OwnerOnlyRouteProps) {
  const router = useRouter();
  const { isLoading, canOnlyView } = useOrgRole();

  useEffect(() => {
    if (!isLoading && canOnlyView) {
      // Redirect members to dashboard
      router.push("/dashboard");
    }
  }, [canOnlyView, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (canOnlyView) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Access Denied</h3>
            <p className="text-sm text-muted-foreground">
              You dont have permission to access this page. Only organization owners can edit settings and add data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
