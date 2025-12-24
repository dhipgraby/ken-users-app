"use server";

import * as z from "zod";
import axios from "axios";
// Server action now only talks to backend auth API; next-auth signIn is moved client-side
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas/zod/auth-zod-schema";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AUTH_URL } from "@/lib/constants";
import { handleServerError } from "../server-handler";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { message: "Invalid fields!", status: 400 };
    }

    const { identifier, password, code, smsCode } = validatedFields.data;
    const response = await axios.post(`${AUTH_URL}auth/login`, { identifier, password, code: Number(code), smsCode }, { headers: { "Content-Type": "application/json" } });

    if (response.data.status === 202 || response.data.twofactor || response.data.twofactorSms) return response.data;
    if (response.data.status !== 200) return response.data;

    if (response.data.message === "Confirmation email sent") return response.data;
    if (response.data.message === "Verification sms sent to your phone.") return response.data;

    // Return raw response (client will call signIn to establish session)
    return response.data;

  } catch (error: any) {
    return await handleServerError(error);
  }

};

export const googleLogin = async (callbackUrl?: string | null) => {
  try {
    const googleSignIn = await signIn("google", { redirect: false, redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT });
    return googleSignIn;

  } catch (error: any) {
    return await handleServerError(error);
  }

};