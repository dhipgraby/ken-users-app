import { useMutation } from "@tanstack/react-query";
import { sendSupport, SupportPayload } from "@/lib/actions/support";
import { useSession } from "@/hooks/useSession";

export const useSendSupportMutation = () => {
  const { retrieveAccessToken } = useSession();
  return useMutation({
    mutationFn: async (payload: SupportPayload) => {
      const token = await retrieveAccessToken();
      if (!token) {
        return { message: "Unauthorized", status: 401 };
      }
      return await sendSupport(token, payload);
    }
  });
};
