import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { getUserProfile } from "@/lib/actions/user-profile";

export const useUsersProfile = () => {
  const { retrieveAccessToken } = useSession();
  return useQuery({
    queryKey: ["users-profile"],
    queryFn: async () => {
      const token = await retrieveAccessToken();
      if (!token) return null;
      return await getUserProfile(token);
    },
    refetchOnWindowFocus: false
  });
};
