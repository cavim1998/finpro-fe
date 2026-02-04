"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { axiosInstance } from "@/lib/axios";
import { User, UserProfile, RoleCode } from "@/types";

// Extended user type for app context (includes computed fields for convenience)
export interface AppUser extends User {
  profile?: UserProfile;
  outletId?: number;
  outletStaffId?: number;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  authReady: boolean;

  // optional helpers (masih berguna)
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeJsonParse = <T,>(value?: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!Cookies.get("auth_token");
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    return safeJsonParse<AppUser>(Cookies.get("user_data") ?? undefined);
  });

  const [authReady, setAuthReady] = useState(false);

  const syncFromCookies = useCallback(() => {
    const token = Cookies.get("auth_token");
    setIsAuthenticated(!!token);

    const cookieUser = safeJsonParse<AppUser>(
      Cookies.get("user_data") ?? undefined,
    );
    setUser(cookieUser);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const res = await axiosInstance.get("/users/profile");
      const data = res.data?.data ?? res.data;

      // Normalisasi minimal: pastikan role ada di root
      const normalized: AppUser = {
        ...data,
        role: data?.role as RoleCode,
        profile: data?.profile ?? undefined,
      };

      setUser(normalized);
      setIsAuthenticated(true);

      // simpan supaya cepat saat reload
      const isProduction = window.location.protocol === "https:";
      Cookies.set("user_data", JSON.stringify(normalized), {
        expires: 7,
        secure: isProduction,
        sameSite: "strict",
      });
    } catch {
      // token ada tapi profile gagal → anggap unauth untuk keamanan
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // 1) sync cepat dari cookie
    syncFromCookies();

    // 2) kalau ada token, ambil user source-of-truth
    const token = Cookies.get("auth_token");
    if (token) {
      refreshProfile().finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }

    // 3) event dari login page
    const handler = () => {
      syncFromCookies();
      const t = Cookies.get("auth_token");
      if (t) refreshProfile().catch(() => {});
    };

    window.addEventListener("user-data-updated", handler);
    return () => window.removeEventListener("user-data-updated", handler);
  }, [refreshProfile, syncFromCookies]);

  const logout = useCallback(() => {
    Cookies.remove("auth_token");
    Cookies.remove("user_data");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      authReady,
      refreshProfile,
      logout,
    }),
    [user, isAuthenticated, authReady, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
