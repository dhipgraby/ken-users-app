import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { getSettings, getUser } from "@/lib/actions/get-user";
import { ServerSubmit } from "@/lib/utils";
import { ServerSubmitProps } from "@/types/form-dtos";

//USER LOGIN
export const useLoginMutation = () => {
  const submitLoginMutation = useMutation({
    mutationFn: async (submitProps: ServerSubmitProps) => {
      const serverResponse = await ServerSubmit(submitProps);
      // ServerSubmit can return undefined for certain early-exit cases; treat as failure.
      if (!serverResponse) {
        throw new Error("No response received from the server. Please try again.");
      }
      return { serverResponse };
    },
    onSuccess: (data: any) => {
      return data.serverResponse;
    }
  });
  return {
    submitLoginMutation
  };
};

//USER SESSION
export const useUserSession = () => {
  // capture session helpers at hook top-level (valid hook usage)
  const { retrieveAccessToken } = useSession();
  return useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const token = await retrieveAccessToken();
      return await getUser({ token });
    },
    refetchOnWindowFocus: false
  });
};

export const useUserSettingsQuery = () => {
  const { retrieveAccessToken } = useSession();
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const accessToken = await retrieveAccessToken();
      if (!accessToken) return null;
      const personalInfo = await getSettings(accessToken);
      return personalInfo;
    },
    refetchOnWindowFocus: false
  });
};

export const useUserSettingsMutation = () => {
  const queryClient = useQueryClient();
  const submitSettingsMutation = useMutation({
    mutationFn: async (submitProps: ServerSubmitProps) => {
      try {
        const serverResponse = await ServerSubmit(submitProps);
        return { serverResponse };
      } catch (error: any) {
        return { message: error, status: 400 };
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      return data.serverResponse;
    }
  });
  return {
    submitSettingsMutation
  };
};