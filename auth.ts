import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import axios from "axios";
import { AUTH_URL } from "./lib/constants";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("DEBUG: signIn callback", { provider: account?.provider, userId: user?.id });
      if (account?.provider === "credentials") return true;

      if (account?.provider === "google") {
        try {
          console.log("DEBUG: Verifying Google Token with backend...");
          const response = await axios.post(
            `${AUTH_URL}auth/google`,
            { googleTokenId: account.id_token },
            { headers: { "Content-Type": "application/json" } }
          );

          const data = response.data;

          // Allow admin users - they can access all organizations
          Object.assign(user, {
            name: data.user.username,
            email: data.user.email,
            role: data.user.role,
            userStatus: data.userStatus,
            isTwoFactorEnabled: data.isTwoFactorEnabled,
            accessToken: data.token,
            isOAuth: true
          });

          return true;
        } catch {
          console.error("Signing server error");
          return false;
        }
      }
      return true;
    },
    async session({ token, session }) {
      console.log("DEBUG: session callback", { tokenSub: token.sub, hasAccessToken: !!token.accessToken });

      if (token.accessToken) {
        session.user.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email || undefined;
        session.user.userStatus = token.userStatus;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      }

      return session;
    },
    async jwt({ token, user }) {

      if (!token.sub) return token;
      if (user) {
        token = {
          accessToken: user.accessToken,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          name: user.name,
          email: user.email,
          userStatus: user.userStatus
        };
      }
      return token;
    }
  },
  // session: { strategy: "jwt" },
  ...authConfig
});
