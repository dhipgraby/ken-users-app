"use server";

import axios from "axios";
import { USERS_API } from "@/lib/constants";
import { handleServerError } from "@/lib/server-handler";

const normalizeToken = (rawToken: string) => {
  if (!rawToken) return rawToken;
  let token = String(rawToken).trim();
  // If something stored "Bearer <token>" in localStorage, avoid "Bearer Bearer ..."
  if (token.toLowerCase().startsWith("bearer ")) token = token.slice(7).trim();
  // If token was accidentally JSON-stringified
  if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  return token;
};

const jsonHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${normalizeToken(token)}`
});

export interface UpdateUserProfilePayload {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export const updateUserProfile = async (token: string, payload: UpdateUserProfilePayload) => {

  console.log("calling updateUserProfile", payload);

  try {
    const res = await axios.patch(`${USERS_API}user/profile`, payload, { headers: jsonHeaders(token) });
    return res.data;
  } catch (error: any) {
    return await handleServerError(error);
  }
};

export const changeUserPassword = async (token: string, payload: ChangePasswordPayload) => {
  try {
    const res = await axios.patch(`${USERS_API}user/change-password`, payload, { headers: jsonHeaders(token) });
    return res.data;
  } catch (error: any) {
    return await handleServerError(error);
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const res = await axios.get(`${USERS_API}user/me`, { headers: jsonHeaders(token) });
    return res.data;
  } catch (error: any) {
    return await handleServerError(error);
  }
};
