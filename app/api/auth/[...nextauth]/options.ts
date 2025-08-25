/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

export const authOption: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: { params: { scope: "openid email profile" } },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.API_BASE_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) throw new Error("Invalid credentials");

        const result = await res.json();
        const user = result?.data;
        if (!user?.accessToken) throw new Error("User not found");

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // First login
      if (user && account) {
        if (account.provider === "credentials") {
          token = {
            ...token,
            id: user.id,
            name: user.name,
            email: user.email,
            provider: "credentials",
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessTokenExpires: user.accessTokenExpiresAt,
          };
        } else if (
          account.provider === "google" ||
          account.provider === "github"
        ) {
          try {
            // Call backend to exchange provider token for your API tokens
            const { data } = await axios.post(
              `${process.env.API_BASE_URL}/auth/auto-signin`,
              {
                provider: account.provider,
                access_token: account.access_token,
                id_token: (account as any).id_token, // Github uses id_token only for OIDC, optional
              }
            );

            const userData = data?.data;
            token = {
              ...token,
              id: userData.id,
              name: userData.name,
              email: userData.email,
              provider: account.provider,
              accessToken: userData.accessToken,
              refreshToken: userData.refreshToken,
              accessTokenExpires: userData.accessTokenExpiresAt,
            };
          } catch (error) {
            console.error("OAuth auto-signin failed", error);
            return null;
          }
        }
      }

      // Refresh token if expired (credentials)
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      if (token.provider === "credentials") {
        return await refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.provider = token.provider as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Refresh access token for credentials provider
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const refreshed: any = await res.json();

    if (!res.ok || !refreshed.data?.accessToken) {
      throw new Error(refreshed.error || "Failed to refresh access token");
    }

    return {
      ...token,
      accessToken: refreshed.data.accessToken,
      accessTokenExpires:
        refreshed.data.accessTokenExpiresAt ?? token.accessTokenExpires,
      refreshToken: refreshed.data.refreshToken ?? token.refreshToken,
    };
  } catch (err) {
    console.error("Error refreshing token", err);
    return { ...token, error: "RefreshTokenError", accessToken: "" };
  }
}
