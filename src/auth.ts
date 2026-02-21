import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      accessToken: string;
      image?: string;
      profileImage?: string;
      role?: string;
      roleCode?: string;
      station?: string;
      outletId?: number;
      [key: string]: any; // Allow other backend fields
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    accessToken?: string;
    image?: string;
    profileImage?: string;
    role?: string;
    roleCode?: string;
    station?: string;
    outletId?: number;
    [key: string]: any;
  }
}

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const getRoleFromAccessToken = (accessToken?: string) => {
  if (!accessToken) return null;
  try {
    const decoded: any = jwtDecode(accessToken);
    return decoded?.role ?? decoded?.roleCode ?? null;
  } catch {
    return null;
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "google-id-token",
      name: "Google ID Token",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          const response = await fetch(`${baseUrl}/auth/google/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: credentials.idToken,
            }),
          });

          if (!response.ok) {
            console.error("Google login failed:", response.status);
            return null;
          }

          const data = await response.json();
          const accessToken = data?.data?.accessToken;
          const user = data?.data?.user;

          if (!accessToken || !user) {
            console.error("Invalid response from backend");
            return null;
          }

          const roleValue =
            user?.role?.code || user?.roleCode || user?.role || null;
          const tokenRole = roleValue ?? getRoleFromAccessToken(accessToken);

          return {
            id: user.id || user.userId || "unknown",
            name: user.name || user.username || "",
            email: user.email || "",
            image: user.profileImage || user.image || null,
            accessToken,
            role: tokenRole,
            roleCode: tokenRole,
            station: user.station || null,
            ...user,
          };
        } catch (error) {
          console.error("Google authorization error:", error);
          return null;
        }
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call backend API
          const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error("Login failed:", response.status);
            return null;
          }

          const data = await response.json();
          const accessToken = data?.data?.accessToken;
          const user = data?.data?.user;

          if (!accessToken || !user) {
            console.error("Invalid response from backend");
            return null;
          }

          // Return user with ALL backend data
          const roleValue =
            user?.role?.code || user?.roleCode || user?.role || null;
          const tokenRole = roleValue ?? getRoleFromAccessToken(accessToken);

          return {
            id: user.id || user.userId || "unknown",
            name: user.name || user.username || "",
            email: user.email || credentials.email,
            image: user.profileImage || user.image || null,
            accessToken,
            role: tokenRole,
            roleCode: tokenRole,
            station: user.station || null,
            // Spread all other user data
            ...user,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in - save all user data to token
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user;
      }

      if (trigger === "update" && session?.user) {
        token.user = {
          ...(token.user as any),
          ...(session.user as any),
        };
      }

      // OAuth provider - save access token
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      const tokenUser = token.user as any;
      if (tokenUser && !tokenUser.role) {
        const derivedRole = getRoleFromAccessToken(token.accessToken as string);
        if (derivedRole) {
          tokenUser.role = derivedRole;
          tokenUser.roleCode = derivedRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Pass user data and token to client session
      if (token.user) {
        session.user = {
          ...session.user,
          ...(token.user as any),
        };
      }

      if (token.accessToken) {
        session.user.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
});
