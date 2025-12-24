import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { getUser } from "@/lib/actions/get-user";

export type CurrentUser = {
  name?: string;
  email?: string;
  image?: string | null;
};

export const useCurrentUser = () => {
  const { retrieveAccessToken } = useSession();
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const token = await retrieveAccessToken();
      if (!token) return null;

      const res = await getUser({ token });
      if (!res) return null;
      const d = res ?? {};
      return {
        name: d.name,
        email: d.email,
        image: null
      };
    },
    refetchOnWindowFocus: false
  });
};