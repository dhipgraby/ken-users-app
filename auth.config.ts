import type { NextAuthConfig } from "next-auth";
import { SignInSchema } from "@/schemas/zod/auth-zod-schema";
import { AUTH_URL } from "@/lib/constants";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import Google from "next-auth/providers/google";


export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { token } = validatedFields.data;

        try {
          const response = await axios.get(`${AUTH_URL}auth/user`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          // Allow admin users - they can access all organizations
          return {
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
            userStatus: response.data.userStatus,
            isTwoFactorEnabled: response.data.isTwoFactorEnabled,
            accessToken: token,
            isOAuth: false
          } as any;
        } catch (error) {
          console.error("Signing server error", error);
          // Fail the credentials flow
          return null;
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: { strategy: "jwt" }
} satisfies NextAuthConfig;