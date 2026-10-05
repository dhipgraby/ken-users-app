"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { UserRoles } from "@/types/user-types";

export const useOrgRole = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [canOnlyView, setCanOnlyView] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await getSession();
        const role = (session as any)?.user?.role as number | undefined;

        if (!mounted) return;

        // In users-app we only have an explicit ADMIN role.
        // Treat everyone else as "view-only" for owner/admin-only routes.
        setCanOnlyView(role !== UserRoles.ADMIN);
      } catch {
        if (!mounted) return;
        setCanOnlyView(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, canOnlyView };
};
