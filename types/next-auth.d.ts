import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";
import { UserRole } from "@/enum";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    provider?: string;

    // ✅ Credentials-only fields
    isEmailVerified?: boolean;
    refreshToken?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    accessTokenExpiresAt?: number;
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      provider?: string;

      // ✅ Credentials-only fields
      isEmailVerified?: boolean;
      refreshToken?: string;
      accessToken?: string;
      accessTokenExpires?: number;
      role?: UserRole;
    } & DefaultSession["user"];

    accessTokenExpires?: number;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
    provider?: string;

    // ✅ Credentials-only fields
    isEmailVerified?: boolean;
    refreshToken?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    accessTokenExpiresAt?: number;
    role?: UserRole;
  }
}
