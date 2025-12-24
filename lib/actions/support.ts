import axios from "axios";
import { USERS_API } from "@/lib/constants";
import { handleServerError } from "@/lib/server-handler";

const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

export type SupportPayload = {
  subject: string;
  type: "bug" | "feature" | "enhancement" | "question";
  description: string;
};

export const sendSupport = async (token: string, payload: SupportPayload) => {
  try {
    const res = await axios.post(`${USERS_API}support`, payload, { headers: jsonHeaders(token) });
    return res.data;
  } catch (error: any) {
    return await handleServerError(error);
  }
};
