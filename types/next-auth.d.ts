import { type DefaultSession } from "next-auth";

// Augment NextAuth types to include our custom fields on Session.user, User, AdapterUser and JWT
declare module "next-auth" {
  interface Session {
    user: {
      role: number | any;
      isTwoFactorEnabled: boolean | any;
      isOAuth: boolean;
      accessToken: string | any;
      userStatus: string | any;
      email: string | any;
    } & DefaultSession["user"];
  }

  interface User {
    role: number | any;
    isTwoFactorEnabled: boolean | any;
    isOAuth: boolean;
    accessToken: string | any;
    userStatus: string | any;
    email: string | any;
  }

  interface AdapterUser {
    role: number | any;
    isTwoFactorEnabled: boolean | any;
    isOAuth: boolean;
    accessToken: string | any;
    userStatus: string | any;
    email: string | any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: number | any;
    isTwoFactorEnabled: boolean | any;
    accessToken: string | any;
    userStatus: string | any;
    email: string | any;
  }
}
