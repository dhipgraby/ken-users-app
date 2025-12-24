"use server";

import axios from "axios";
import { AUTH_URL, USERS_API } from "@/lib/constants";
import { logout } from "./logout";
import { SignInSchema } from "@/schemas/zod/auth-zod-schema";
import { handleServerError } from "../server-handler";

const normalizeToken = (rawToken: string) => {
  if (!rawToken) return rawToken;
  let token = String(rawToken).trim();
  if (token.toLowerCase().startsWith("bearer ")) token = token.slice(7).trim();
  if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  return token;
};

export const getUser = async ({ token }: { token: any }) => {
  const validatedFields = SignInSchema.safeParse({ token });

  if (!validatedFields.success) return null;

  try {
    const response = await axios.get(`${AUTH_URL}auth/user`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${normalizeToken(token)}`
      }
    });

    if (response.data.status !== 200) {
      console.log("getUser || Unauthorized response, logging out...");
      await logout();
    }

    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      userStatus: response.data.userStatus,
      isTwoFactorEnabled: response.data.isTwoFactorEnabled,
      accessToken: token
    };

  } catch (error: any) {
    if (error.message) console.error(error.message);

    if (axios.isAxiosError(error)) {
      const response = error.response;

      if (response && response.data.message === "Unauthorized" || response?.data.message === "USER NOT FOUND") {
        console.log("handleServerError || USER NOT FOUND: Unauthorized, logging out...");
        await logout();
      }
      if (response && response.data) {
        const { statusCode, message } = response.data;
        if (statusCode === 404 || statusCode === 403) {
          return { message: message, status: 400 };
        }
      }
      if (error.code === "ECONNREFUSED") {
        return { message: "Connection refused. Please try again later or contact support.", status: 400 };
      }
    }
  }
};

export const getSettings = async (token: string) => {
  try {
    const response = await axios.get(`${USERS_API}user/vendors-config`,
      { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${normalizeToken(token)}` } });
    return response.data;

  } catch (error: any) {
    return await handleServerError(error);
  }
};